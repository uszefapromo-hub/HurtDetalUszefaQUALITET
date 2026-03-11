'use strict';

/**
 * Integration tests for the REST API.
 *
 * These tests use an in-memory mock of the database layer (src/config/database.js)
 * so no real PostgreSQL connection is required to run them.
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');

// ─── Mock database ─────────────────────────────────────────────────────────────
const mockDb = {
  users: [],
  stores: [],
  products: [],
  orders: [],
  order_items: [],
  subscriptions: [],
  suppliers: [],
};

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));

const db = require('../src/config/database');

// Helper: make db.query return rows from our in-memory store
function setupDbMock() {
  db.query.mockImplementation(async (sql, params = []) => {
    const s = sql.trim().replace(/\s+/g, ' ').toLowerCase();

    // ── users ──
    if (s.startsWith('select') && s.includes('from users where email')) {
      const email = params[0];
      const row = mockDb.users.find((u) => u.email === email);
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('select') && s.includes('from users where id')) {
      const id = params[0];
      const row = mockDb.users.find((u) => u.id === id);
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('select count(*)') && s.includes('from users')) {
      return { rows: [{ count: String(mockDb.users.length) }] };
    }
    if (s.startsWith('select') && s.includes('from users order by')) {
      return { rows: mockDb.users.slice(params[1], params[1] + params[0]) };
    }
    if (s.startsWith('insert into users')) {
      const [id, email, password_hash, name, role] = params;
      const user = { id, email, password_hash, name, role, plan: 'trial' };
      mockDb.users.push(user);
      return { rows: [user] };
    }
    if (s.startsWith('update users set') && s.includes('where id')) {
      const id = params[params.length - 1];
      const user = mockDb.users.find((u) => u.id === id);
      if (user) {
        if (params[0] !== null) user.name = params[0];
        if (params[1] !== null) user.phone = params[1];
      }
      return { rows: user ? [user] : [] };
    }

    // ── stores ──
    if (s.startsWith('select count(*)') && s.includes('from stores')) {
      return { rows: [{ count: String(mockDb.stores.length) }] };
    }
    if (s.startsWith('select') && s.includes('from stores where id')) {
      const id = params[0];
      const row = mockDb.stores.find((st) => st.id === id);
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('select') && s.includes('from stores where slug')) {
      const slug = params[0];
      const row = mockDb.stores.find((st) => st.slug === slug);
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('select') && s.includes('from stores')) {
      return { rows: mockDb.stores };
    }
    if (s.startsWith('insert into stores')) {
      const [id, owner_id, name, slug, description, margin, plan] = params;
      const store = { id, owner_id, name, slug, description, margin, plan, status: 'active' };
      mockDb.stores.push(store);
      return { rows: [store] };
    }
    if (s.startsWith('delete from stores where id')) {
      const id = params[0];
      const idx = mockDb.stores.findIndex((st) => st.id === id);
      if (idx !== -1) mockDb.stores.splice(idx, 1);
      return { rows: idx !== -1 ? [{ id }] : [] };
    }

    // ── products ──
    if (s.startsWith('select count(*)') && s.includes('from products')) {
      return { rows: [{ count: String(mockDb.products.length) }] };
    }
    if (s.startsWith('select') && s.includes('from products where id')) {
      const id = params[0];
      const row = mockDb.products.find((p) => p.id === id);
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('select') && s.includes('from products')) {
      return { rows: mockDb.products };
    }
    if (s.startsWith('insert into products')) {
      const product = { id: params[0], store_id: params[1], name: params[3], price_net: params[5] };
      mockDb.products.push(product);
      return { rows: [product] };
    }
    if (s.startsWith('delete from products where id')) {
      const id = params[0];
      const idx = mockDb.products.findIndex((p) => p.id === id);
      if (idx !== -1) mockDb.products.splice(idx, 1);
      return { rows: [] };
    }

    // ── orders ──
    if (s.startsWith('select count(*)') && s.includes('from orders')) {
      return { rows: [{ count: String(mockDb.orders.length) }] };
    }
    if (s.startsWith('select') && s.includes('from orders where id')) {
      const id = params[0];
      const row = mockDb.orders.find((o) => o.id === id);
      return { rows: row ? [row] : [] };
    }
    if (s.startsWith('select') && s.includes('from orders')) {
      return { rows: mockDb.orders };
    }
    if (s.startsWith('select') && s.includes('from order_items')) {
      const orderId = params[0];
      return { rows: mockDb.order_items.filter((i) => i.order_id === orderId) };
    }

    // ── subscriptions ──
    if (s.startsWith('select') && s.includes('from subscriptions where user_id')) {
      const userId = params[0];
      return { rows: mockDb.subscriptions.filter((sub) => sub.user_id === userId) };
    }
    if (s.startsWith('select') && s.includes('from subscriptions')) {
      return { rows: mockDb.subscriptions };
    }
    if (s.startsWith('update subscriptions set status') && s.includes("'superseded'")) {
      return { rows: [] };
    }
    if (s.startsWith('insert into subscriptions')) {
      const sub = { id: params[0], user_id: params[1], plan: params[2], status: 'active' };
      mockDb.subscriptions.push(sub);
      return { rows: [sub] };
    }

    // ── suppliers ──
    if (s.startsWith('select') && s.includes('from suppliers')) {
      return { rows: mockDb.suppliers };
    }
    if (s.startsWith('insert into suppliers')) {
      const sup = { id: params[0], name: params[1], integration_type: params[2], active: true };
      mockDb.suppliers.push(sup);
      return { rows: [sup] };
    }

    // Catch-all
    return { rows: [] };
  });

  db.transaction.mockImplementation(async (callback) => {
    const fakeClient = { query: db.query };
    return callback(fakeClient);
  });
}

// ─── Test setup ────────────────────────────────────────────────────────────────

let app;
let sellerToken;
let adminToken;
const SELLER_ID = 'a0000000-0000-4000-8000-000000000001';
const ADMIN_ID = 'a0000000-0000-4000-8000-000000000002';
const STORE_ID = 'a0000000-0000-4000-8000-000000000003';

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.NODE_ENV = 'test';

  setupDbMock();

  app = require('../src/app');

  const { signToken } = require('../src/middleware/auth');
  sellerToken = signToken({ id: SELLER_ID, email: 'seller@test.pl', role: 'seller' });
  adminToken = signToken({ id: ADMIN_ID, email: 'admin@test.pl', role: 'owner' });

  // Pre-seed users
  const hash = await bcrypt.hash('Password123!', 12);
  mockDb.users.push({ id: SELLER_ID, email: 'seller@test.pl', password_hash: hash, name: 'Seller', role: 'seller', plan: 'basic' });
  mockDb.users.push({ id: ADMIN_ID, email: 'admin@test.pl', password_hash: hash, name: 'Admin', role: 'owner', plan: 'elite' });

  // Pre-seed a store
  mockDb.stores.push({ id: STORE_ID, owner_id: SELLER_ID, name: 'Mój Sklep', slug: 'moj-sklep', margin: 15, plan: 'basic', status: 'active' });
});

afterEach(() => {
  jest.resetAllMocks();
  setupDbMock();
});

// ─── Health check ──────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── Users ─────────────────────────────────────────────────────────────────────

describe('POST /api/users/register', () => {
  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/users/register').send({
      email: 'not-an-email',
      password: 'Password123!',
      name: 'Test',
    });
    expect(res.status).toBe(422);
  });

  it('rejects short password', async () => {
    const res = await request(app).post('/api/users/register').send({
      email: 'new@test.pl',
      password: 'abc',
      name: 'Test',
    });
    expect(res.status).toBe(422);
  });

  it('registers a new user and returns token', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })  // SELECT – no duplicate
      .mockResolvedValueOnce({ rows: [{ id: 'new-id', email: 'new@test.pl', name: 'New', role: 'buyer', plan: 'trial' }] }); // INSERT

    const res = await request(app).post('/api/users/register').send({
      email: 'new@test.pl',
      password: 'Password123!',
      name: 'New User',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('rejects duplicate email with 409', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 'existing' }] });
    const res = await request(app).post('/api/users/register').send({
      email: 'seller@test.pl',
      password: 'Password123!',
      name: 'Dup',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/users/login', () => {
  it('returns 401 for wrong email', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).post('/api/users/login').send({ email: 'nobody@test.pl', password: 'x' });
    expect(res.status).toBe(401);
  });

  it('returns token for correct credentials', async () => {
    const hash = await bcrypt.hash('Password123!', 12);
    db.query.mockResolvedValueOnce({
      rows: [{ id: SELLER_ID, email: 'seller@test.pl', password_hash: hash, name: 'Seller', role: 'seller', plan: 'basic' }],
    });

    const res = await request(app).post('/api/users/login').send({ email: 'seller@test.pl', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

describe('GET /api/users/me', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('returns user profile when authenticated', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: SELLER_ID, email: 'seller@test.pl', name: 'Seller', role: 'seller', plan: 'basic' }],
    });
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${sellerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('seller@test.pl');
  });
});

// ─── Stores ────────────────────────────────────────────────────────────────────

describe('GET /api/stores', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/stores');
    expect(res.status).toBe(401);
  });

  it('returns stores for seller', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: '1' }] })
      .mockResolvedValueOnce({ rows: [{ id: STORE_ID, name: 'Mój Sklep', owner_id: SELLER_ID }] });

    const res = await request(app).get('/api/stores').set('Authorization', `Bearer ${sellerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.stores).toHaveLength(1);
  });
});

describe('POST /api/stores', () => {
  it('requires seller role', async () => {
    const { signToken } = require('../src/middleware/auth');
    const buyerToken = signToken({ id: 'buyer-id', email: 'buyer@test.pl', role: 'buyer' });
    const res = await request(app)
      .post('/api/stores')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ name: 'Shop', slug: 'shop' });
    expect(res.status).toBe(403);
  });

  it('creates a store for seller', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })  // slug check
      .mockResolvedValueOnce({ rows: [{ id: 'new-store', name: 'New Store', slug: 'new-store', owner_id: SELLER_ID }] });

    const res = await request(app)
      .post('/api/stores')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'New Store', slug: 'new-store' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Store');
  });
});

// ─── Products ──────────────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  it('is public and returns product list', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
  });
});

describe('POST /api/products', () => {
  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Produkt' }); // missing store_id and price_net
    expect(res.status).toBe(422);
  });

  it('creates a product when store is owned by user', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ owner_id: SELLER_ID, margin: 15 }] }) // store lookup
      .mockResolvedValueOnce({ rows: [{ id: 'prod-1', name: 'Fotel', store_id: STORE_ID }] }); // insert

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ store_id: STORE_ID, name: 'Fotel', price_net: 100 });
    expect(res.status).toBe(201);
  });
});

// ─── Subscriptions ─────────────────────────────────────────────────────────────

describe('POST /api/subscriptions', () => {
  it('rejects invalid plan', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ plan: 'diamond' });
    expect(res.status).toBe(422);
  });

  it('creates a subscription', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })  // deactivate old
      .mockResolvedValueOnce({ rows: [{ id: 'sub-1', user_id: SELLER_ID, plan: 'pro', status: 'active' }] }) // insert
      .mockResolvedValueOnce({ rows: [] }); // update user plan

    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ plan: 'pro' });
    expect(res.status).toBe(201);
    expect(res.body.plan).toBe('pro');
  });
});

// ─── Suppliers ─────────────────────────────────────────────────────────────────

describe('POST /api/suppliers', () => {
  it('requires owner/admin role', async () => {
    const res = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'HurtX', integration_type: 'csv' });
    expect(res.status).toBe(403);
  });

  it('creates a supplier as admin', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 'sup-1', name: 'HurtX', integration_type: 'csv' }] });

    const res = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'HurtX', integration_type: 'csv' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('HurtX');
  });
});

// ─── 404 ───────────────────────────────────────────────────────────────────────

describe('Unknown route', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
