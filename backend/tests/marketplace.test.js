'use strict';

/**
 * Marketplace integration tests.
 *
 * Covers: shop_products (marketplace model), public shop browsing, cart with
 * shop_product_id, and admin audit-log filtering.
 *
 * Uses an in-memory mock DB – no real PostgreSQL connection required.
 */

const request = require('supertest');

// ─── In-memory mock DB ────────────────────────────────────────────────────────

const mockDb = {
  users:         [],
  stores:        [],
  products:      [],
  categories:    [],
  shop_products: [],
  carts:         [],
  cart_items:    [],
  orders:        [],
  order_items:   [],
  payments:      [],
  audit_logs:    [],
};

jest.mock('../src/config/database', () => ({ query: jest.fn(), transaction: jest.fn() }));

const db = require('../src/config/database');

function setupDbMock() {
  db.query.mockImplementation(async (sql, params = []) => {
    const s = sql.trim().replace(/\s+/g, ' ').toLowerCase();

    // ── audit_logs ──
    if (s.startsWith('insert into audit_logs')) {
      mockDb.audit_logs.push({ id: params[0], user_id: params[1], action: params[2],
        resource: params[3], resource_id: params[4] });
      return { rows: [] };
    }
    if (s.startsWith('select count(*)') && s.includes('from audit_logs'))
      return { rows: [{ count: String(mockDb.audit_logs.length) }] };
    if (s.includes('from audit_logs al'))
      return { rows: mockDb.audit_logs.map((l) => ({ ...l, actor_email: null, actor_name: null })) };

    // ── users ──
    if (s.includes('from users where email')) {
      const row = mockDb.users.find((u) => u.email === params[0]);
      return { rows: row ? [row] : [] };
    }
    if (s.includes('from users where id')) {
      const row = mockDb.users.find((u) => u.id === params[0]);
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('select count(*)') && s.includes('from users'))
      return { rows: [{ count: String(mockDb.users.length) }] };
    if (s.includes('from users') && s.includes('order by') && s.includes('limit'))
      return { rows: mockDb.users.map((u) => ({ ...u, password_hash: undefined })) };
    if (s.startsWith('insert into users')) {
      const [id, email, password_hash, name, role] = params;
      const user = { id, email, password_hash, name, role, plan: 'trial' };
      mockDb.users.push(user);
      return { rows: [user] };
    }

    // ── categories ──
    if (s.includes('from categories where id')) {
      const row = mockDb.categories.find((c) => c.id === params[0]);
      return { rows: row ? [row] : [] };
    }
    if (s.includes('from categories where slug')) {
      const row = mockDb.categories.find((c) => c.slug === params[0]);
      return { rows: row ? [row] : [] };
    }
    if (s.includes("from categories where status = 'active'") || s.includes('where active = true'))
      return { rows: mockDb.categories.filter((c) => c.status === 'active' || c.active) };
    if (s.startsWith('insert into categories')) {
      const cat = { id: params[0], name: params[1], slug: params[2], parent_id: params[3],
        description: params[4], icon: params[5], sort_order: params[6], status: 'active', active: true };
      mockDb.categories.push(cat);
      return { rows: [cat] };
    }

    // ── stores ──
    if (s.includes('from stores where slug')) {
      const row = mockDb.stores.find((st) => st.slug === params[0]);
      return { rows: row ? [row] : [] };
    }
    if (s.includes('from stores where id')) {
      const row = mockDb.stores.find((st) => st.id === params[0]);
      return { rows: row ? [row] : [] };
    }
    if (s.includes('from stores where owner_id'))
      return { rows: mockDb.stores.filter((st) => st.owner_id === params[0] && st.status !== 'suspended') };
    if (s.startsWith('select count(*)') && s.includes('from stores'))
      return { rows: [{ count: String(mockDb.stores.length) }] };
    if (s.startsWith('insert into stores')) {
      const [id, owner_id, name, slug] = params;
      const store = { id, owner_id, name, slug, status: 'active', margin: 15 };
      mockDb.stores.push(store);
      return { rows: [store] };
    }

    // ── products ──
    if (s.includes('from products') && s.includes('where id')) {
      const row = mockDb.products.find((p) => p.id === params[0]);
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('insert into products')) {
      const p = { id: params[0], name: params[1] || 'Produkt',
        price_gross: params[2] || 100, price_net: params[3] || 81.3, tax_rate: 23,
        sku: params[4] || null, stock: params[5] || 10, image_url: null,
        status: 'active', selling_price: params[2] || 100, margin: 15 };
      mockDb.products.push(p);
      return { rows: [p] };
    }
    if (s.startsWith('update products set stock')) {
      const p = mockDb.products.find((pr) => pr.id === params[1]);
      if (p) p.stock -= params[0];
      return { rows: [] };
    }

    // ── shop_products ──
    // PATCH ownership with price_gross (joins stores + products)
    if (s.includes('from shop_products sp') && s.includes('p.price_gross') && s.includes('join stores s')) {
      const sp = mockDb.shop_products.find((x) => x.id === params[0]);
      if (!sp) return { rows: [] };
      const store = mockDb.stores.find((st) => st.id === sp.store_id) || {};
      const product = mockDb.products.find((p) => p.id === sp.product_id) || {};
      return { rows: [{ ...sp, owner_id: store.owner_id, price_gross: product.price_gross }] };
    }
    // DELETE ownership (joins stores only, no products)
    if (s.includes('from shop_products sp') && s.includes('join stores s') && !s.includes('join products p')) {
      const sp = mockDb.shop_products.find((x) => x.id === params[0]);
      if (!sp) return { rows: [] };
      const store = mockDb.stores.find((st) => st.id === sp.store_id) || {};
      return { rows: [{ id: sp.id, owner_id: store.owner_id }] };
    }
    // Cart validation (has global_product_id alias)
    if (s.includes('from shop_products sp') && s.includes('global_product_id')) {
      const sp = mockDb.shop_products.find((x) => x.id === params[0]);
      if (!sp) return { rows: [] };
      const p = mockDb.products.find((x) => x.id === sp.product_id) || {};
      return { rows: [{ ...sp, stock: p.stock || 10, global_product_id: p.id }] };
    }
    // GET /my/store/products listing (WHERE sp.store_id, no active filter)
    if (s.includes('from shop_products sp') && s.includes('join products p') && s.includes('where sp.store_id') && !s.includes('and sp.active')) {
      return {
        rows: mockDb.shop_products.filter((sp) => sp.store_id === params[0]).map((sp) => {
          const p = mockDb.products.find((pr) => pr.id === sp.product_id) || {};
          return { ...sp, name: p.name, sku: p.sku, price_gross: p.price_gross, stock: p.stock };
        }),
      };
    }
    // GET /shops/:slug/products COUNT
    if (s.includes('count(*)') && s.includes('from shop_products sp') && s.includes('join products p'))
      return { rows: [{ count: String(
        mockDb.shop_products.filter((sp) => sp.store_id === params[0] && sp.active && sp.status === 'active').length
      ) }] };
    // GET /shops/:slug/products listing (with active + status filter)
    if (s.includes('from shop_products sp') && s.includes('join products p') && s.includes('and sp.active')) {
      return {
        rows: mockDb.shop_products
          .filter((sp) => sp.store_id === params[0] && sp.active && sp.status === 'active')
          .map((sp) => {
            const p = mockDb.products.find((pr) => pr.id === sp.product_id) || {};
            return { ...sp, title: sp.custom_title || p.name, description: p.description,
              price_gross: p.price_gross, stock: p.stock };
          }),
      };
    }
    if (s.startsWith('select count(*)') && s.includes('from shop_products'))
      return { rows: [{ count: String(
        mockDb.shop_products.filter((x) => !params[0] || x.store_id === params[0]).length
      ) }] };
    if (s.startsWith('insert into shop_products')) {
      const parseSnapshot = (raw) => {
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
      };
      const sp = {
        id: params[0], store_id: params[1], product_id: params[2],
        custom_title: params[3], custom_description: params[4],
        margin_type: params[5], margin_value: params[6], selling_price: params[7],
        source_snapshot: parseSnapshot(params[8]),
        price_override: params[9], active: params[10] !== undefined ? params[10] : true, status: 'active',
      };
      mockDb.shop_products.push(sp);
      return { rows: [sp] };
    }
    if (s.startsWith('update shop_products set') && s.includes('where id')) {
      const id = params[params.length - 1];
      const sp = mockDb.shop_products.find((x) => x.id === id);
      if (sp) {
        if (params[0] !== null) sp.custom_title       = params[0];
        if (params[1] !== null) sp.custom_description = params[1];
        if (params[2] !== null) sp.margin_type        = params[2];
        if (params[3] !== null) sp.margin_value       = params[3];
        if (params[4] !== null) sp.selling_price      = params[4];
        if (params[5] !== null) sp.price_override     = params[5];
        if (params[6] !== null) sp.active             = params[6];
        if (params[7] !== null) sp.sort_order         = params[7];
        if (params[8] !== null) sp.status             = params[8];
      }
      return { rows: sp ? [sp] : [] };
    }
    if (s.startsWith('delete from shop_products')) {
      const idx = mockDb.shop_products.findIndex((x) => x.id === params[0]);
      if (idx !== -1) mockDb.shop_products.splice(idx, 1);
      return { rows: [] };
    }

    // ── carts ──
    if (s.includes('from carts c') && s.includes('where c.id')) {
      const cart = mockDb.carts.find((c) => c.id === params[0]);
      if (!cart) return { rows: [] };
      const store = mockDb.stores.find((st) => st.id === cart.store_id) || {};
      return { rows: [{ ...cart, shop_name: store.name, shop_slug: store.slug }] };
    }
    if (s.includes('from carts c') && s.includes("status = 'active'") && s.includes('order by')) {
      const row = mockDb.carts.find((c) => c.user_id === params[0] && c.status === 'active');
      if (!row) return { rows: [] };
      const store = mockDb.stores.find((st) => st.id === row.store_id) || {};
      return { rows: [{ ...row, shop_name: store.name, shop_slug: store.slug }] };
    }
    if (s.includes('from carts where user_id') && s.includes("status = 'active'")) {
      const row = mockDb.carts.find((c) =>
        c.user_id === params[0] && c.store_id === params[1] && c.status === 'active'
      );
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('insert into carts')) {
      const cart = { id: params[0], user_id: params[1], store_id: params[2], status: 'active' };
      mockDb.carts.push(cart);
      return { rows: [cart] };
    }
    if (s.startsWith('update carts set')) {
      return { rows: [] };
    }

    // ── cart_items ──
    if (s.includes('from cart_items ci') && s.includes('where ci.cart_id')) {
      return {
        rows: mockDb.cart_items.filter((ci) => ci.cart_id === params[0]).map((ci) => {
          const sp = mockDb.shop_products.find((x) => x.id === ci.shop_product_id) || {};
          const p  = mockDb.products.find((x) => x.id === ci.product_id) || {};
          return { ...ci, product_title: sp.custom_title || p.name || 'Produkt', image_url: p.image_url };
        }),
      };
    }
    if (s.includes('from cart_items ci') && s.includes('join carts c') && s.includes('where ci.id')) {
      const ci = mockDb.cart_items.find((x) => x.id === params[0]);
      if (!ci) return { rows: [] };
      const cart = mockDb.carts.find((c) => c.id === ci.cart_id) || {};
      return { rows: [{ id: ci.id, user_id: cart.user_id }] };
    }
    if (s.includes('from cart_items') && s.includes('where cart_id') && s.includes('shop_product_id')) {
      const row = mockDb.cart_items.find((ci) =>
        ci.cart_id === params[0] && ci.shop_product_id === params[1]
      );
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('insert into cart_items')) {
      const ci = { id: params[0], cart_id: params[1], product_id: params[2],
        shop_product_id: params[3], quantity: params[4], unit_price: params[5] };
      mockDb.cart_items.push(ci);
      return { rows: [ci] };
    }
    if (s.startsWith('update cart_items set quantity')) {
      const id = params[params.length - 1];
      const ci = mockDb.cart_items.find((x) => x.id === id);
      if (ci) ci.quantity = params[0];
      return { rows: [] };
    }
    if (s.startsWith('delete from cart_items where id')) {
      const idx = mockDb.cart_items.findIndex((x) => x.id === params[0]);
      if (idx !== -1) mockDb.cart_items.splice(idx, 1);
      return { rows: [] };
    }
    if (s.startsWith('delete from cart_items where cart_id')) {
      mockDb.cart_items = mockDb.cart_items.filter((x) => x.cart_id !== params[0]);
      return { rows: [] };
    }

    // ── orders ──
    if (s.startsWith('select count(*)') && s.includes('from orders'))
      return { rows: [{ count: String(mockDb.orders.length) }] };
    if (s.includes('from orders') && s.includes('where') && s.includes('id'))
      return { rows: mockDb.orders.filter((o) => o.id === params[0]) };
    if (s.startsWith('update orders set status'))
      return { rows: mockDb.orders.filter((o) => o.id === params[1]).map((o) => ({ ...o, status: params[0] })) };

    return { rows: [] };
  });

  db.transaction.mockImplementation(async (fn) => {
    const client = { query: db.query };
    await fn(client);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uuid() {
  return require('crypto').randomUUID();
}

/**
 * Creates a user in mockDb and returns a signed JWT directly.
 * Avoids hitting the rate-limited /api/users/login endpoint.
 */
function createUserAndToken(role = 'seller') {
  const { signToken } = require('../src/middleware/auth');
  const userId = uuid();
  const email  = `test-${userId}@example.com`;
  mockDb.users.push({ id: userId, email, password_hash: 'x', name: 'Test', role, plan: 'basic' });
  return { token: signToken({ id: userId, email, role }), userId };
}

// ─── Test setup ────────────────────────────────────────────────────────────────

let app;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.NODE_ENV   = 'test';
  setupDbMock();
  app = require('../src/app');
});

beforeEach(() => {
  Object.keys(mockDb).forEach((k) => { mockDb[k] = []; });
  setupDbMock();
});

// ─── Categories ───────────────────────────────────────────────────────────────

describe('GET /api/categories', () => {
  it('returns empty list when no categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns only active categories', async () => {
    mockDb.categories.push(
      { id: uuid(), name: 'Elektronika', slug: 'elektronika', status: 'active', active: true },
      { id: uuid(), name: 'Archiwum',    slug: 'archiwum',    status: 'inactive', active: false }
    );
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].slug).toBe('elektronika');
  });
});

describe('POST /api/categories', () => {
  it('requires admin or owner role', async () => {
    const { token } = createUserAndToken('buyer');
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', slug: 'test' });
    expect(res.status).toBe(403);
  });

  it('creates category as owner', async () => {
    const { token } = createUserAndToken('owner');
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Elektronika', slug: 'elektronika' });
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('elektronika');
    expect(mockDb.categories.length).toBe(1);
  });

  it('rejects duplicate slug', async () => {
    const { token } = createUserAndToken('owner');
    mockDb.categories.push({ id: uuid(), slug: 'duplikat', status: 'active', active: true });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplikat', slug: 'duplikat' });
    expect(res.status).toBe(409);
  });
});

// ─── Public shop browsing ─────────────────────────────────────────────────────

describe('GET /api/shops/:slug', () => {
  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/shops/nieznany-sklep');
    expect(res.status).toBe(404);
  });

  it('returns store profile', async () => {
    const storeId = uuid();
    mockDb.stores.push({ id: storeId, name: 'Mój Sklep', slug: 'moj-sklep', status: 'active' });
    const res = await request(app).get('/api/shops/moj-sklep');
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('moj-sklep');
  });

  it('does not require authentication', async () => {
    const storeId = uuid();
    mockDb.stores.push({ id: storeId, name: 'Mój Sklep', slug: 'moj-sklep', status: 'active' });
    const res = await request(app).get('/api/shops/moj-sklep');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/shops/:slug/products', () => {
  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/shops/nieznany-sklep/products');
    expect(res.status).toBe(404);
  });

  it('returns empty product listing', async () => {
    const storeId = uuid();
    mockDb.stores.push({ id: storeId, name: 'Mój Sklep', slug: 'moj-sklep', status: 'active' });
    const res = await request(app).get('/api/shops/moj-sklep/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body.total).toBe(0);
  });

  it('lists only active shop products', async () => {
    const storeId   = uuid();
    const productId = uuid();
    const sellerId  = uuid();

    mockDb.stores.push({ id: storeId, owner_id: sellerId, name: 'Sklep', slug: 'sklep', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Fotel', price_gross: 100, price_net: 81.3, tax_rate: 23,
      stock: 5, status: 'active', selling_price: 100 });

    // Active listing
    mockDb.shop_products.push({
      id: uuid(), store_id: storeId, product_id: productId,
      active: true, status: 'active', selling_price: 125,
    });
    // Inactive listing (should be excluded)
    mockDb.shop_products.push({
      id: uuid(), store_id: storeId, product_id: productId,
      active: false, status: 'active', selling_price: 115,
    });

    const res = await request(app).get('/api/shops/sklep/products');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.products.length).toBe(1);
  });
});

// ─── Seller store product management ─────────────────────────────────────────

describe('POST /api/my/store/products', () => {
  it('requires seller role', async () => {
    const { token } = createUserAndToken('buyer');
    const storeId   = uuid();
    const productId = uuid();
    const res = await request(app)
      .post('/api/my/store/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ store_id: storeId, product_id: productId });
    expect(res.status).toBe(403);
  });

  it('adds product to store computing selling_price', async () => {
    const { token, userId } = createUserAndToken('seller');
    const storeId   = uuid();
    const productId = uuid();

    mockDb.stores.push({ id: storeId, owner_id: userId, name: 'Sklep', slug: 's', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Fotel', sku: 'F001', price_gross: 100,
      price_net: 81.3, tax_rate: 23, stock: 10, status: 'active', selling_price: 100 });

    const res = await request(app)
      .post('/api/my/store/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ store_id: storeId, product_id: productId, margin_type: 'percent', margin_value: 25 });

    expect(res.status).toBe(201);
    expect(res.body.store_id).toBe(storeId);
    // selling_price = 100 * 1.25 = 125
    expect(parseFloat(res.body.selling_price)).toBeCloseTo(125);
    // source_snapshot stores product details at listing time
    expect(res.body.source_snapshot).toMatchObject({ name: 'Fotel', sku: 'F001' });
    // audit log should have been written
    expect(mockDb.audit_logs.length).toBe(1);
    expect(mockDb.audit_logs[0].action).toBe('create');
  });

  it('uses fixed margin correctly', async () => {
    const { token, userId } = createUserAndToken('seller');
    const storeId   = uuid();
    const productId = uuid();

    mockDb.stores.push({ id: storeId, owner_id: userId, name: 'Sklep2', slug: 's2', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Lampa', sku: 'L001', price_gross: 50,
      price_net: 40.65, tax_rate: 23, stock: 20, status: 'active', selling_price: 50 });

    const res = await request(app)
      .post('/api/my/store/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ store_id: storeId, product_id: productId, margin_type: 'fixed', margin_value: 15 });

    expect(res.status).toBe(201);
    // selling_price = 50 + 15 = 65
    expect(parseFloat(res.body.selling_price)).toBeCloseTo(65);
  });

  it('price_override takes precedence over margin', async () => {
    const { token, userId } = createUserAndToken('seller');
    const storeId   = uuid();
    const productId = uuid();

    mockDb.stores.push({ id: storeId, owner_id: userId, name: 'Sklep3', slug: 's3', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Krzesło', sku: 'K001', price_gross: 80,
      price_net: 65, tax_rate: 23, stock: 5, status: 'active', selling_price: 80 });

    const res = await request(app)
      .post('/api/my/store/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ store_id: storeId, product_id: productId, margin_type: 'percent', margin_value: 20, price_override: 99 });

    expect(res.status).toBe(201);
    expect(parseFloat(res.body.selling_price)).toBeCloseTo(99);
  });

  it('returns 403 when seller does not own the store', async () => {
    const { token } = createUserAndToken('seller');
    const storeId   = uuid();
    const productId = uuid();
    const otherId   = uuid();

    mockDb.stores.push({ id: storeId, owner_id: otherId, name: 'Cudzysklep', slug: 'cudzy', status: 'active' });
    mockDb.products.push({ id: productId, name: 'P', price_gross: 10, price_net: 8, tax_rate: 23, stock: 1, status: 'active' });

    const res = await request(app)
      .post('/api/my/store/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ store_id: storeId, product_id: productId });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/my/store/products/:id', () => {
  it('updates margin_value and recomputes selling_price', async () => {
    const { token, userId } = createUserAndToken('seller');
    const storeId   = uuid();
    const productId = uuid();
    const spId      = uuid();

    mockDb.stores.push({ id: storeId, owner_id: userId, name: 'Sk', slug: 'sk', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Fotel', price_gross: 100, price_net: 81.3,
      tax_rate: 23, stock: 10, status: 'active', selling_price: 100 });
    mockDb.shop_products.push({ id: spId, store_id: storeId, product_id: productId,
      margin_type: 'percent', margin_value: 10, selling_price: 110, active: true, status: 'active' });

    const res = await request(app)
      .patch(`/api/my/store/products/${spId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ margin_value: 30 });

    expect(res.status).toBe(200);
    // selling_price = 100 * 1.30 = 130
    expect(parseFloat(res.body.selling_price)).toBeCloseTo(130);
    expect(mockDb.audit_logs.length).toBe(1);
    expect(mockDb.audit_logs[0].action).toBe('update');
  });

  it('can update status to inactive', async () => {
    const { token, userId } = createUserAndToken('seller');
    const storeId   = uuid();
    const productId = uuid();
    const spId      = uuid();

    mockDb.stores.push({ id: storeId, owner_id: userId, name: 'Sk', slug: 'sk2', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Fotel', price_gross: 100, price_net: 81.3,
      tax_rate: 23, stock: 10, status: 'active', selling_price: 100 });
    mockDb.shop_products.push({ id: spId, store_id: storeId, product_id: productId,
      margin_type: 'percent', margin_value: 10, selling_price: 110, active: true, status: 'active' });

    const res = await request(app)
      .patch(`/api/my/store/products/${spId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'inactive' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('inactive');
  });

  it('returns 404 for unknown shop product', async () => {
    const { token } = createUserAndToken('seller');
    const res = await request(app)
      .patch(`/api/my/store/products/${uuid()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ active: false });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/my/store/products/:id', () => {
  it('removes product and writes audit log', async () => {
    const { token, userId } = createUserAndToken('seller');
    const storeId   = uuid();
    const productId = uuid();
    const spId      = uuid();

    mockDb.stores.push({ id: storeId, owner_id: userId, name: 'Sk', slug: 'sk3', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Fotel', price_gross: 100, stock: 5, status: 'active' });
    mockDb.shop_products.push({ id: spId, store_id: storeId, product_id: productId, active: true, status: 'active' });

    const res = await request(app)
      .delete(`/api/my/store/products/${spId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(mockDb.shop_products.length).toBe(0);
    expect(mockDb.audit_logs.some((l) => l.action === 'delete')).toBe(true);
  });
});

// ─── Marketplace cart (shop_product_id model) ─────────────────────────────────

describe('GET /api/cart', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('returns null when no cart exists', async () => {
    const { token } = createUserAndToken('buyer');
    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.cart).toBeNull();
  });

  it('returns cart with items', async () => {
    const { token, userId } = createUserAndToken('buyer');
    const storeId   = uuid();
    const productId = uuid();
    const spId      = uuid();
    const cartId    = uuid();
    const itemId    = uuid();

    mockDb.stores.push({ id: storeId, name: 'S', slug: 's', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Fotel', image_url: null });
    mockDb.shop_products.push({ id: spId, store_id: storeId, product_id: productId, custom_title: 'Mój Fotel', active: true, status: 'active' });
    mockDb.carts.push({ id: cartId, user_id: userId, store_id: storeId, status: 'active' });
    mockDb.cart_items.push({ id: itemId, cart_id: cartId, product_id: productId, shop_product_id: spId, quantity: 2, unit_price: 125 });

    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.cart).not.toBeNull();
    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.cart.items[0].product_title).toBe('Mój Fotel');
    expect(res.body.cart.subtotal).toBeCloseTo(250);
  });
});

describe('POST /api/cart', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/cart').send({ shop_product_id: uuid(), quantity: 1 });
    expect(res.status).toBe(401);
  });

  it('rejects missing shop_product_id', async () => {
    const { token } = createUserAndToken('buyer');
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });
    expect(res.status).toBe(422);
  });

  it('returns 404 when shop_product not found or inactive', async () => {
    const { token } = createUserAndToken('buyer');
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ shop_product_id: uuid(), quantity: 1 });
    expect(res.status).toBe(404);
  });

  it('adds product to cart', async () => {
    const { token, userId } = createUserAndToken('buyer');
    const storeId   = uuid();
    const productId = uuid();
    const spId      = uuid();

    mockDb.stores.push({ id: storeId, name: 'S', slug: 's4', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Fotel', price_gross: 100, stock: 10, status: 'active', selling_price: 125 });
    mockDb.shop_products.push({ id: spId, store_id: storeId, product_id: productId,
      active: true, status: 'active', selling_price: 125, margin_type: 'percent', margin_value: 25 });

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ shop_product_id: spId, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.cart.items[0].shop_product_id).toBe(spId);
    expect(res.body.cart.subtotal).toBeCloseTo(250);
  });

  it('returns 422 when stock is insufficient', async () => {
    const { token } = createUserAndToken('buyer');
    const storeId   = uuid();
    const productId = uuid();
    const spId      = uuid();

    mockDb.stores.push({ id: storeId, name: 'S', slug: 's5', status: 'active' });
    mockDb.products.push({ id: productId, name: 'Rzadki', price_gross: 200, stock: 1, status: 'active', selling_price: 200 });
    mockDb.shop_products.push({ id: spId, store_id: storeId, product_id: productId,
      active: true, status: 'active', selling_price: 200 });

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ shop_product_id: spId, quantity: 5 });

    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/cart/items/:itemId', () => {
  it('removes a cart item', async () => {
    const { token, userId } = createUserAndToken('buyer');
    const storeId = uuid();
    const cartId  = uuid();
    const itemId  = uuid();

    mockDb.stores.push({ id: storeId, name: 'S', slug: 's6', status: 'active' });
    mockDb.carts.push({ id: cartId, user_id: userId, store_id: storeId, status: 'active' });
    mockDb.cart_items.push({ id: itemId, cart_id: cartId, product_id: uuid(), quantity: 1, unit_price: 50 });

    const res = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(mockDb.cart_items.length).toBe(0);
  });

  it('returns 403 when item belongs to another user', async () => {
    const { token }           = createUserAndToken('buyer');
    const { userId: otherId } = createUserAndToken('buyer');
    const storeId = uuid();
    const cartId  = uuid();
    const itemId  = uuid();

    mockDb.stores.push({ id: storeId, name: 'S', slug: 's7', status: 'active' });
    mockDb.carts.push({ id: cartId, user_id: otherId, store_id: storeId, status: 'active' });
    mockDb.cart_items.push({ id: itemId, cart_id: cartId, product_id: uuid(), quantity: 1, unit_price: 50 });

    const res = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// ─── Admin order status update ────────────────────────────────────────────────

describe('PATCH /api/admin/orders/:id/status', () => {
  it('requires admin role', async () => {
    const { token } = createUserAndToken('seller');
    const res = await request(app)
      .patch(`/api/admin/orders/${uuid()}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'shipped' });
    expect(res.status).toBe(403);
  });

  it('updates order status', async () => {
    const { token } = createUserAndToken('owner');
    const orderId   = uuid();
    mockDb.orders.push({ id: orderId, status: 'pending', total: 100 });

    const res = await request(app)
      .patch(`/api/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'shipped' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('shipped');
  });

  it('rejects invalid status value', async () => {
    const { token } = createUserAndToken('owner');
    const res = await request(app)
      .patch(`/api/admin/orders/${uuid()}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid_status' });
    expect(res.status).toBe(422);
  });
});

// ─── Admin audit-log filtering ────────────────────────────────────────────────

describe('GET /api/admin/audit-logs', () => {
  it('requires admin role', async () => {
    const { token } = createUserAndToken('seller');
    const res = await request(app).get('/api/admin/audit-logs').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns audit logs', async () => {
    const { token, userId } = createUserAndToken('owner');
    mockDb.audit_logs.push({ id: uuid(), user_id: userId, action: 'create', resource: 'shop_product', resource_id: uuid() });

    const res = await request(app).get('/api/admin/audit-logs').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('logs');
    expect(res.body.total).toBe(1);
  });
});
