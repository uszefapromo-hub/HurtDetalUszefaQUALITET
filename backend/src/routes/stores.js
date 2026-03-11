'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// ─── List stores ───────────────────────────────────────────────────────────────

router.get('/', authenticate, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
  const offset = (page - 1) * limit;

  // Sellers see only their own store; owner/admin see all
  const isAdmin = ['owner', 'admin'].includes(req.user.role);
  try {
    const countResult = isAdmin
      ? await db.query('SELECT COUNT(*) FROM stores')
      : await db.query('SELECT COUNT(*) FROM stores WHERE owner_id = $1', [req.user.id]);

    const total = parseInt(countResult.rows[0].count, 10);

    const result = isAdmin
      ? await db.query(
          'SELECT * FROM stores ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        )
      : await db.query(
          'SELECT * FROM stores WHERE owner_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
          [req.user.id, limit, offset]
        );

    return res.json({ total, page, limit, stores: result.rows });
  } catch (err) {
    console.error('list stores error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── Get single store ──────────────────────────────────────────────────────────

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM stores WHERE id = $1', [req.params.id]);
    const store = result.rows[0];
    if (!store) return res.status(404).json({ error: 'Sklep nie znaleziony' });

    const isAdmin = ['owner', 'admin'].includes(req.user.role);
    if (!isAdmin && store.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    return res.json(store);
  } catch (err) {
    console.error('get store error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── Create store ──────────────────────────────────────────────────────────────

router.post(
  '/',
  authenticate,
  requireRole('seller', 'owner', 'admin'),
  [
    body('name').trim().notEmpty(),
    body('slug').trim().matches(/^[a-z0-9-]+$/i).isLength({ max: 80 }),
    body('description').optional().trim(),
    body('margin').optional().isFloat({ min: 0, max: 100 }),
    body('plan').optional().isIn(['basic', 'pro', 'elite']),
  ],
  validate,
  async (req, res) => {
    const {
      name,
      slug,
      description = '',
      margin = parseFloat(process.env.PLATFORM_MARGIN_DEFAULT || '15'),
      plan = 'basic',
    } = req.body;

    try {
      const slugCheck = await db.query('SELECT id FROM stores WHERE slug = $1', [slug]);
      if (slugCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Adres sklepu jest już zajęty' });
      }

      const id = uuidv4();
      const ownerId = req.user.id;

      const result = await db.query(
        `INSERT INTO stores (id, owner_id, name, slug, description, margin, plan, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW())
         RETURNING *`,
        [id, ownerId, name, slug, description, margin, plan]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('create store error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── Update store ──────────────────────────────────────────────────────────────

router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('margin').optional().isFloat({ min: 0, max: 100 }),
    body('status').optional().isIn(['active', 'inactive', 'suspended']),
  ],
  validate,
  async (req, res) => {
    try {
      const storeResult = await db.query('SELECT owner_id FROM stores WHERE id = $1', [req.params.id]);
      const store = storeResult.rows[0];
      if (!store) return res.status(404).json({ error: 'Sklep nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && store.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień' });
      }

      const { name, description, margin, status } = req.body;
      const result = await db.query(
        `UPDATE stores SET
           name        = COALESCE($1, name),
           description = COALESCE($2, description),
           margin      = COALESCE($3, margin),
           status      = COALESCE($4, status),
           updated_at  = NOW()
         WHERE id = $5
         RETURNING *`,
        [name || null, description !== undefined ? description : null, margin !== undefined ? margin : null, status || null, req.params.id]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('update store error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── Delete store (admin only) ─────────────────────────────────────────────────

router.delete('/:id', authenticate, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const result = await db.query('DELETE FROM stores WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Sklep nie znaleziony' });
    return res.json({ message: 'Sklep usunięty' });
  } catch (err) {
    console.error('delete store error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
