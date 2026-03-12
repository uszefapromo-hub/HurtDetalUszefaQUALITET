'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const VALID_TYPES      = ['analytics', 'tracking', 'chat', 'pixel', 'custom'];
const VALID_PLACEMENTS = ['head', 'body_start', 'body_end'];

// ─── GET /api/scripts – list scripts for the current seller's stores ──────────

router.get('/', authenticate, async (req, res) => {
  const isAdmin = ['owner', 'admin'].includes(req.user.role);
  try {
    const result = isAdmin
      ? await db.query(
          `SELECT sc.*, st.name AS store_name, st.slug AS store_slug
           FROM scripts sc
           JOIN stores st ON sc.store_id = st.id
           ORDER BY st.name, sc.name`
        )
      : await db.query(
          `SELECT sc.*, st.name AS store_name, st.slug AS store_slug
           FROM scripts sc
           JOIN stores st ON sc.store_id = st.id
           WHERE st.owner_id = $1
           ORDER BY st.name, sc.name`,
          [req.user.id]
        );
    return res.json(result.rows);
  } catch (err) {
    console.error('list scripts error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── GET /api/scripts/store/:storeId – scripts for a specific store ───────────
// Public-facing endpoint used by the storefront to inject active scripts.

router.get(
  '/store/:storeId',
  [param('storeId').isUUID()],
  validate,
  async (req, res) => {
    try {
      const result = await db.query(
        `SELECT id, name, type, placement, content
         FROM scripts
         WHERE store_id = $1 AND active = TRUE
         ORDER BY placement, name`,
        [req.params.storeId]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('list store scripts error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── GET /api/scripts/:id – get single script ─────────────────────────────────

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const result = await db.query(
        `SELECT sc.*, st.owner_id
         FROM scripts sc
         JOIN stores st ON sc.store_id = st.id
         WHERE sc.id = $1`,
        [req.params.id]
      );
      const script = result.rows[0];
      if (!script) return res.status(404).json({ error: 'Skrypt nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && script.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień' });
      }
      return res.json(script);
    } catch (err) {
      console.error('get script error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/scripts – create a script ─────────────────────────────────────

router.post(
  '/',
  authenticate,
  [
    body('store_id').isUUID(),
    body('name').trim().notEmpty().isLength({ max: 255 }),
    body('type').isIn(VALID_TYPES),
    body('placement').isIn(VALID_PLACEMENTS),
    body('content').trim().notEmpty(),
    body('active').optional().isBoolean(),
  ],
  validate,
  async (req, res) => {
    const { store_id, name, type, placement, content, active = true } = req.body;

    try {
      const storeResult = await db.query(
        'SELECT owner_id FROM stores WHERE id = $1',
        [store_id]
      );
      const store = storeResult.rows[0];
      if (!store) return res.status(404).json({ error: 'Sklep nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && store.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień do tego sklepu' });
      }

      const id = uuidv4();
      const result = await db.query(
        `INSERT INTO scripts (id, store_id, name, type, placement, content, active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [id, store_id, name, type, placement, content, active]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('create script error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── PATCH /api/scripts/:id – update a script ────────────────────────────────

router.patch(
  '/:id',
  authenticate,
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty().isLength({ max: 255 }),
    body('type').optional().isIn(VALID_TYPES),
    body('placement').optional().isIn(VALID_PLACEMENTS),
    body('content').optional().trim().notEmpty(),
    body('active').optional().isBoolean(),
  ],
  validate,
  async (req, res) => {
    const { name, type, placement, content, active } = req.body;

    try {
      const existing = await db.query(
        `SELECT sc.id, st.owner_id
         FROM scripts sc
         JOIN stores st ON sc.store_id = st.id
         WHERE sc.id = $1`,
        [req.params.id]
      );
      if (!existing.rows[0]) return res.status(404).json({ error: 'Skrypt nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && existing.rows[0].owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień' });
      }

      const result = await db.query(
        `UPDATE scripts SET
           name       = COALESCE($1, name),
           type       = COALESCE($2, type),
           placement  = COALESCE($3, placement),
           content    = COALESCE($4, content),
           active     = COALESCE($5, active),
           updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          name !== undefined ? name : null,
          type || null,
          placement || null,
          content !== undefined ? content : null,
          active !== undefined ? active : null,
          req.params.id,
        ]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('update script error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── DELETE /api/scripts/:id – delete a script ───────────────────────────────

router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    try {
      const existing = await db.query(
        `SELECT sc.id, st.owner_id
         FROM scripts sc
         JOIN stores st ON sc.store_id = st.id
         WHERE sc.id = $1`,
        [req.params.id]
      );
      if (!existing.rows[0]) return res.status(404).json({ error: 'Skrypt nie znaleziony' });

      const isAdmin = ['owner', 'admin'].includes(req.user.role);
      if (!isAdmin && existing.rows[0].owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Brak uprawnień' });
      }

      await db.query('DELETE FROM scripts WHERE id = $1', [req.params.id]);
      return res.status(204).end();
    } catch (err) {
      console.error('delete script error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

module.exports = router;
