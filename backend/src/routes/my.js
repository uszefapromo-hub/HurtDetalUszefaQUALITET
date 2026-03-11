'use strict';

/**
 * "My" routes – user-facing endpoints for the currently authenticated user.
 *
 * GET    /api/my/orders                – buyer's order history
 * GET    /api/my/store/products        – list my store's shop products
 * POST   /api/my/store/products        – add a product to my store
 * PATCH  /api/my/store/products/:id   – update a shop product in my store
 * DELETE /api/my/store/products/:id   – remove a product from my store
 */

const express = require('express');
const { body, param } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { auditLog } = require('../helpers/audit');

// ─── Helper: compute selling price from base gross price + margin ──────────────

function computeSellingPrice(priceGross, marginType, marginValue) {
  const base = parseFloat(priceGross) || 0;
  const mv   = parseFloat(marginValue) || 0;
  if (marginType === 'fixed') return parseFloat((base + mv).toFixed(2));
  // default: percent
  return parseFloat((base * (1 + mv / 100)).toFixed(2));
}

const router = express.Router();



router.get('/orders', authenticate, async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page  || '1',  10));
  const limit  = Math.min(100, parseInt(req.query.limit || '20', 10));
  const offset = (page - 1) * limit;

  try {
    const countResult = await db.query(
      'SELECT COUNT(*) FROM orders WHERE buyer_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await db.query(
      `SELECT * FROM orders
       WHERE buyer_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.json({ total, page, limit, orders: result.rows });
  } catch (err) {
    console.error('my orders error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── GET /api/my/store/products – list my store's shop products ────────────────

router.get(
  '/store/products',
  authenticate,
  requireRole('seller', 'owner', 'admin'),
  async (req, res) => {
    const { store_id } = req.query;
    if (!store_id) return res.status(422).json({ error: 'Wymagany parametr: store_id' });

    const page   = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit  = Math.min(100, parseInt(req.query.limit || '20', 10));
    const offset = (page - 1) * limit;

    try {
      const storeResult = await db.query('SELECT owner_id FROM stores WHERE id = $1', [store_id]);
      const store = storeResult.rows[0];
      if (!store) return res.status(404).json({ error: 'Sklep nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && store.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień do tego sklepu' });
      }

      const countResult = await db.query(
        'SELECT COUNT(*) FROM shop_products WHERE store_id = $1',
        [store_id]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await db.query(
        `SELECT sp.id, sp.store_id, sp.product_id, sp.active, sp.sort_order,
                sp.custom_title, sp.custom_description, sp.margin_type,
                sp.margin_value, sp.selling_price, sp.status,
                sp.price_override, sp.created_at, sp.updated_at,
                p.name, p.sku, p.description, p.category, p.image_url, p.stock,
                p.price_gross, p.selling_price AS base_price, p.margin AS base_margin
         FROM shop_products sp
         JOIN products p ON sp.product_id = p.id
         WHERE sp.store_id = $1
         ORDER BY sp.sort_order ASC, sp.created_at DESC
         LIMIT $2 OFFSET $3`,
        [store_id, limit, offset]
      );

      return res.json({ total, page, limit, products: result.rows });
    } catch (err) {
      console.error('my store products list error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/my/store/products – add product to my store ────────────────────

router.post(
  '/store/products',
  authenticate,
  requireRole('seller', 'owner', 'admin'),
  [
    body('store_id').isUUID(),
    body('product_id').isUUID(),
    body('custom_title').optional().trim(),
    body('custom_description').optional().trim(),
    body('margin_type').optional().isIn(['percent', 'fixed']),
    body('margin_value').optional().isFloat({ min: 0 }),
    body('price_override').optional().isFloat({ min: 0 }),
    body('active').optional().isBoolean(),
    body('sort_order').optional().isInt({ min: 0 }),
  ],
  validate,
  async (req, res) => {
    const {
      store_id,
      product_id,
      custom_title       = null,
      custom_description = null,
      margin_type        = 'percent',
      margin_value       = 0,
      price_override     = null,
      active             = true,
      sort_order         = 0,
    } = req.body;

    try {
      const storeResult = await db.query('SELECT owner_id FROM stores WHERE id = $1', [store_id]);
      const store = storeResult.rows[0];
      if (!store) return res.status(404).json({ error: 'Sklep nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && store.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień do tego sklepu' });
      }

      const productResult = await db.query(
        'SELECT id, name, sku, price_gross, price_net, tax_rate FROM products WHERE id = $1',
        [product_id]
      );
      const product = productResult.rows[0];
      if (!product) return res.status(404).json({ error: 'Produkt nie znaleziony' });

      // Compute selling_price from gross price and margin
      const effectivePrice = price_override !== null
        ? parseFloat(price_override)
        : computeSellingPrice(product.price_gross, margin_type, margin_value);

      // Snapshot of the global product at listing time
      const sourceSnapshot = JSON.stringify({
        name:       product.name,
        sku:        product.sku,
        price_gross: product.price_gross,
        price_net:  product.price_net,
        tax_rate:   product.tax_rate,
      });

      const id = uuidv4();
      const result = await db.query(
        `INSERT INTO shop_products
           (id, store_id, product_id, custom_title, custom_description, margin_type,
            margin_value, selling_price, source_snapshot, price_override, active, sort_order, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         ON CONFLICT (store_id, product_id) DO UPDATE SET
           custom_title       = EXCLUDED.custom_title,
           custom_description = EXCLUDED.custom_description,
           margin_type        = EXCLUDED.margin_type,
           margin_value       = EXCLUDED.margin_value,
           selling_price      = EXCLUDED.selling_price,
           source_snapshot    = EXCLUDED.source_snapshot,
           price_override     = EXCLUDED.price_override,
           active             = EXCLUDED.active,
           sort_order         = EXCLUDED.sort_order,
           updated_at         = NOW()
         RETURNING *`,
        [id, store_id, product_id, custom_title, custom_description, margin_type,
         margin_value, effectivePrice, sourceSnapshot, price_override, active, sort_order]
      );

      auditLog({
        actorUserId: req.user.id,
        entityType:  'shop_product',
        entityId:    result.rows[0].id,
        action:      'create',
        payload:     { store_id, product_id, margin_type, margin_value },
      });

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('my store add product error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── PATCH /api/my/store/products/:id – update a shop product ─────────────────

router.patch(
  '/store/products/:id',
  authenticate,
  requireRole('seller', 'owner', 'admin'),
  [
    param('id').isUUID(),
    body('custom_title').optional().trim(),
    body('custom_description').optional().trim(),
    body('margin_type').optional().isIn(['percent', 'fixed']),
    body('margin_value').optional().isFloat({ min: 0 }),
    body('price_override').optional().isFloat({ min: 0 }),
    body('active').optional().isBoolean(),
    body('sort_order').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['active', 'inactive', 'suspended']),
  ],
  validate,
  async (req, res) => {
    try {
      const spResult = await db.query(
        `SELECT sp.*, s.owner_id, p.price_gross
         FROM shop_products sp
         JOIN stores s ON sp.store_id = s.id
         JOIN products p ON sp.product_id = p.id
         WHERE sp.id = $1`,
        [req.params.id]
      );
      const sp = spResult.rows[0];
      if (!sp) return res.status(404).json({ error: 'Produkt sklepu nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && sp.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień' });
      }

      const {
        custom_title, custom_description, margin_type,
        margin_value, price_override, active, sort_order, status,
      } = req.body;

      // Recompute selling_price when margin fields change (unless price_override given)
      let newSellingPrice = null;
      const effectiveMarginType  = margin_type  ?? sp.margin_type  ?? 'percent';
      const effectiveMarginValue = margin_value !== undefined ? margin_value : (sp.margin_value ?? 0);
      if (price_override !== undefined) {
        newSellingPrice = parseFloat(price_override);
      } else if (margin_type !== undefined || margin_value !== undefined) {
        newSellingPrice = computeSellingPrice(sp.price_gross, effectiveMarginType, effectiveMarginValue);
      }

      const result = await db.query(
        `UPDATE shop_products SET
           custom_title       = COALESCE($1, custom_title),
           custom_description = COALESCE($2, custom_description),
           margin_type        = COALESCE($3, margin_type),
           margin_value       = COALESCE($4, margin_value),
           selling_price      = COALESCE($5, selling_price),
           price_override     = COALESCE($6, price_override),
           active             = COALESCE($7, active),
           sort_order         = COALESCE($8, sort_order),
           status             = COALESCE($9, status),
           updated_at         = NOW()
         WHERE id = $10
         RETURNING *`,
        [
          custom_title       ?? null,
          custom_description ?? null,
          margin_type        ?? null,
          margin_value       !== undefined ? margin_value : null,
          newSellingPrice,
          price_override     !== undefined ? price_override : null,
          active             ?? null,
          sort_order         ?? null,
          status             ?? null,
          req.params.id,
        ]
      );

      auditLog({
        actorUserId: req.user.id,
        entityType:  'shop_product',
        entityId:    req.params.id,
        action:      'update',
        payload:     req.body,
      });

      return res.json(result.rows[0]);
    } catch (err) {
      console.error('my store update product error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── DELETE /api/my/store/products/:id – remove product from my store ─────────

router.delete(
  '/store/products/:id',
  authenticate,
  requireRole('seller', 'owner', 'admin'),
  async (req, res) => {
    try {
      const spResult = await db.query(
        `SELECT sp.id, s.owner_id
         FROM shop_products sp
         JOIN stores s ON sp.store_id = s.id
         WHERE sp.id = $1`,
        [req.params.id]
      );
      const sp = spResult.rows[0];
      if (!sp) return res.status(404).json({ error: 'Produkt sklepu nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && sp.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień' });
      }

      await db.query('DELETE FROM shop_products WHERE id = $1', [req.params.id]);

      auditLog({
        actorUserId: req.user.id,
        entityType:  'shop_product',
        entityId:    req.params.id,
        action:      'delete',
      });

      return res.json({ message: 'Produkt usunięty ze sklepu' });
    } catch (err) {
      console.error('my store delete product error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

module.exports = router;
