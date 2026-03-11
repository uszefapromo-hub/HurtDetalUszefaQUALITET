'use strict';

const express = require('express');
const { body, param, query: qv } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// ─── List products ─────────────────────────────────────────────────────────────
// Public endpoint – anyone can browse products for a given store.

router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
  const offset = (page - 1) * limit;
  const storeId = req.query.store_id || null;
  const category = req.query.category || null;
  const search = req.query.search || null;

  try {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (storeId) { conditions.push(`store_id = $${idx++}`); params.push(storeId); }
    if (category) { conditions.push(`category = $${idx++}`); params.push(category); }
    if (search) {
      conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM products ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await db.query(
      `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return res.json({ total, page, limit, products: result.rows });
  } catch (err) {
    console.error('list products error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── Get single product ────────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Produkt nie znaleziony' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('get product error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── Create product ────────────────────────────────────────────────────────────

router.post(
  '/',
  authenticate,
  requireRole('seller', 'owner', 'admin'),
  [
    body('store_id').isUUID(),
    body('name').trim().notEmpty(),
    body('sku').optional().trim(),
    body('price_net').isFloat({ min: 0 }),
    body('tax_rate').optional().isFloat({ min: 0, max: 100 }),
    body('category').optional().trim(),
    body('description').optional().trim(),
    body('stock').optional().isInt({ min: 0 }),
    body('image_url').optional().isURL(),
    body('supplier_id').optional().isUUID(),
  ],
  validate,
  async (req, res) => {
    const {
      store_id,
      name,
      sku = null,
      price_net,
      tax_rate = 23,
      category = null,
      description = '',
      stock = 0,
      image_url = null,
      supplier_id = null,
    } = req.body;

    try {
      // Verify store ownership
      const storeResult = await db.query('SELECT owner_id, margin FROM stores WHERE id = $1', [store_id]);
      const store = storeResult.rows[0];
      if (!store) return res.status(404).json({ error: 'Sklep nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && store.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień do tego sklepu' });
      }

      // Apply store margin to compute selling price
      const margin = store.margin || parseFloat(process.env.PLATFORM_MARGIN_DEFAULT || '15');
      const price_gross = parseFloat(price_net) * (1 + parseFloat(tax_rate) / 100);
      const selling_price = price_gross * (1 + margin / 100);

      const id = uuidv4();
      const result = await db.query(
        `INSERT INTO products
           (id, store_id, supplier_id, name, sku, price_net, tax_rate, price_gross, selling_price, margin,
            category, description, stock, image_url, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
         RETURNING *`,
        [id, store_id, supplier_id, name, sku, price_net, tax_rate,
         price_gross.toFixed(2), selling_price.toFixed(2), margin,
         category, description, stock, image_url]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('create product error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── Update product ────────────────────────────────────────────────────────────

router.put(
  '/:id',
  authenticate,
  requireRole('seller', 'owner', 'admin'),
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty(),
    body('price_net').optional().isFloat({ min: 0 }),
    body('tax_rate').optional().isFloat({ min: 0, max: 100 }),
    body('stock').optional().isInt({ min: 0 }),
    body('category').optional().trim(),
    body('description').optional().trim(),
    body('image_url').optional().isURL(),
  ],
  validate,
  async (req, res) => {
    try {
      // Fetch product + store to check ownership
      const productResult = await db.query(
        `SELECT p.*, s.owner_id, s.margin
         FROM products p JOIN stores s ON p.store_id = s.id
         WHERE p.id = $1`,
        [req.params.id]
      );
      const product = productResult.rows[0];
      if (!product) return res.status(404).json({ error: 'Produkt nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && product.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień' });
      }

      const { name, price_net, tax_rate, stock, category, description, image_url } = req.body;

      // Recalculate prices if price_net or tax_rate changes
      let newPriceGross = null;
      let newSellingPrice = null;
      if (price_net !== undefined || tax_rate !== undefined) {
        const pn = parseFloat(price_net !== undefined ? price_net : product.price_net);
        const tr = parseFloat(tax_rate !== undefined ? tax_rate : product.tax_rate);
        const margin = parseFloat(product.margin);
        newPriceGross = (pn * (1 + tr / 100)).toFixed(2);
        newSellingPrice = (pn * (1 + tr / 100) * (1 + margin / 100)).toFixed(2);
      }

      const result = await db.query(
        `UPDATE products SET
           name          = COALESCE($1, name),
           price_net     = COALESCE($2, price_net),
           tax_rate      = COALESCE($3, tax_rate),
           price_gross   = COALESCE($4, price_gross),
           selling_price = COALESCE($5, selling_price),
           stock         = COALESCE($6, stock),
           category      = COALESCE($7, category),
           description   = COALESCE($8, description),
           image_url     = COALESCE($9, image_url),
           updated_at    = NOW()
         WHERE id = $10
         RETURNING *`,
        [
          name || null,
          price_net !== undefined ? price_net : null,
          tax_rate !== undefined ? tax_rate : null,
          newPriceGross,
          newSellingPrice,
          stock !== undefined ? stock : null,
          category || null,
          description !== undefined ? description : null,
          image_url || null,
          req.params.id,
        ]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('update product error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── Delete product ────────────────────────────────────────────────────────────

router.delete('/:id', authenticate, requireRole('seller', 'owner', 'admin'), async (req, res) => {
  try {
    const productResult = await db.query(
      'SELECT p.id, s.owner_id FROM products p JOIN stores s ON p.store_id = s.id WHERE p.id = $1',
      [req.params.id]
    );
    const product = productResult.rows[0];
    if (!product) return res.status(404).json({ error: 'Produkt nie znaleziony' });

    const isAdmin = ['owner', 'admin'].includes(req.user.role);
    if (!isAdmin && product.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    return res.json({ message: 'Produkt usunięty' });
  } catch (err) {
    console.error('delete product error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
