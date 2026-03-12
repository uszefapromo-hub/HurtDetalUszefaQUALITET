'use strict';

const express = require('express');
const { param, query } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const VALID_PERIODS = ['daily', 'weekly', 'monthly'];

// ─── GET /api/analytics – list snapshots ─────────────────────────────────────
// Admins get platform-wide snapshots (store_id IS NULL).
// Sellers get snapshots for their own stores.

router.get(
  '/',
  authenticate,
  [
    query('period').optional().isIn(VALID_PERIODS),
    query('store_id').optional().isUUID(),
    query('limit').optional().isInt({ min: 1, max: 365 }),
  ],
  validate,
  async (req, res) => {
    const isAdmin = ['owner', 'admin'].includes(req.user.role);
    const period   = req.query.period || 'daily';
    const limit    = Math.min(365, parseInt(req.query.limit || '30', 10));
    const store_id = req.query.store_id || null;

    try {
      let result;

      if (isAdmin && !store_id) {
        // Platform-wide snapshots
        result = await db.query(
          `SELECT * FROM analytics_snapshots
           WHERE store_id IS NULL AND period = $1
           ORDER BY snapshot_date DESC
           LIMIT $2`,
          [period, limit]
        );
      } else if (store_id) {
        // Specific store – verify ownership
        if (!isAdmin) {
          const storeCheck = await db.query(
            'SELECT owner_id FROM stores WHERE id = $1',
            [store_id]
          );
          if (!storeCheck.rows[0] || storeCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Brak uprawnień do tego sklepu' });
          }
        }
        result = await db.query(
          `SELECT * FROM analytics_snapshots
           WHERE store_id = $1 AND period = $2
           ORDER BY snapshot_date DESC
           LIMIT $3`,
          [store_id, period, limit]
        );
      } else {
        // Seller: all their stores' snapshots
        result = await db.query(
          `SELECT an.*
           FROM analytics_snapshots an
           JOIN stores st ON an.store_id = st.id
           WHERE st.owner_id = $1 AND an.period = $2
           ORDER BY an.snapshot_date DESC
           LIMIT $3`,
          [req.user.id, period, limit]
        );
      }

      return res.json(result.rows);
    } catch (err) {
      console.error('list analytics snapshots error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── GET /api/analytics/latest – most recent snapshot ────────────────────────

router.get(
  '/latest',
  authenticate,
  [query('store_id').optional().isUUID()],
  validate,
  async (req, res) => {
    const isAdmin  = ['owner', 'admin'].includes(req.user.role);
    const store_id = req.query.store_id || null;

    try {
      let result;

      if (isAdmin && !store_id) {
        result = await db.query(
          `SELECT * FROM analytics_snapshots
           WHERE store_id IS NULL
           ORDER BY snapshot_date DESC
           LIMIT 1`
        );
      } else if (store_id) {
        if (!isAdmin) {
          const storeCheck = await db.query(
            'SELECT owner_id FROM stores WHERE id = $1',
            [store_id]
          );
          if (!storeCheck.rows[0] || storeCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Brak uprawnień do tego sklepu' });
          }
        }
        result = await db.query(
          `SELECT * FROM analytics_snapshots
           WHERE store_id = $1
           ORDER BY snapshot_date DESC
           LIMIT 1`,
          [store_id]
        );
      } else {
        // Seller's primary store
        result = await db.query(
          `SELECT an.*
           FROM analytics_snapshots an
           JOIN stores st ON an.store_id = st.id
           WHERE st.owner_id = $1
           ORDER BY an.snapshot_date DESC
           LIMIT 1`,
          [req.user.id]
        );
      }

      return res.json(result.rows[0] || null);
    } catch (err) {
      console.error('get latest analytics snapshot error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/analytics/capture – capture a snapshot now ────────────────────
// Admin-only endpoint. Creates or updates today's snapshot for the entire
// platform (store_id = NULL) or for a specific store.

router.post(
  '/capture',
  authenticate,
  requireRole('owner', 'admin'),
  async (req, res) => {
    const { store_id = null, period = 'daily' } = req.body;

    if (!VALID_PERIODS.includes(period)) {
      return res.status(422).json({ error: `Nieprawidłowy okres: ${period}` });
    }

    try {
      const today = new Date().toISOString().slice(0, 10);
      let metrics;

      if (store_id) {
        const storeCheck = await db.query(
          'SELECT id FROM stores WHERE id = $1',
          [store_id]
        );
        if (!storeCheck.rows[0]) {
          return res.status(404).json({ error: 'Sklep nie znaleziony' });
        }

        const [orderStats, productCount] = await Promise.all([
          db.query(
            `SELECT
               COUNT(*)                                               AS total_orders,
               COALESCE(SUM(total), 0)                               AS total_revenue,
               COALESCE(SUM(platform_commission), 0)                 AS platform_commission,
               COALESCE(AVG(NULLIF(total, 0)), 0)                    AS avg_order_value,
               COUNT(*) FILTER (WHERE DATE(created_at) = $2)        AS new_orders,
               COALESCE(SUM(total) FILTER (WHERE DATE(created_at) = $2), 0) AS new_revenue
             FROM orders
             WHERE store_id = $1 AND status != 'cancelled'`,
            [store_id, today]
          ),
          db.query(
            `SELECT COUNT(*) AS total_products
             FROM shop_products
             WHERE store_id = $1 AND active = TRUE`,
            [store_id]
          ),
        ]);

        metrics = {
          total_orders:        parseInt(orderStats.rows[0].total_orders, 10),
          total_revenue:       parseFloat(orderStats.rows[0].total_revenue),
          platform_commission: parseFloat(orderStats.rows[0].platform_commission),
          avg_order_value:     parseFloat(orderStats.rows[0].avg_order_value),
          new_orders:          parseInt(orderStats.rows[0].new_orders, 10),
          new_revenue:         parseFloat(orderStats.rows[0].new_revenue),
          total_products:      parseInt(productCount.rows[0].total_products, 10),
          total_users:         0,
          new_users:           0,
        };
      } else {
        // Platform-wide
        const [orderStats, userStats, productCount] = await Promise.all([
          db.query(
            `SELECT
               COUNT(*)                                               AS total_orders,
               COALESCE(SUM(total), 0)                               AS total_revenue,
               COALESCE(SUM(platform_commission), 0)                 AS platform_commission,
               COALESCE(AVG(NULLIF(total, 0)), 0)                    AS avg_order_value,
               COUNT(*) FILTER (WHERE DATE(created_at) = $1)        AS new_orders,
               COALESCE(SUM(total) FILTER (WHERE DATE(created_at) = $1), 0) AS new_revenue
             FROM orders
             WHERE status != 'cancelled'`,
            [today]
          ),
          db.query(
            `SELECT
               COUNT(*)                                                   AS total_users,
               COUNT(*) FILTER (WHERE DATE(created_at) = $1)            AS new_users
             FROM users`,
            [today]
          ),
          db.query(
            `SELECT COUNT(*) AS total_products FROM products WHERE is_central = TRUE`
          ),
        ]);

        metrics = {
          total_orders:        parseInt(orderStats.rows[0].total_orders, 10),
          total_revenue:       parseFloat(orderStats.rows[0].total_revenue),
          platform_commission: parseFloat(orderStats.rows[0].platform_commission),
          avg_order_value:     parseFloat(orderStats.rows[0].avg_order_value),
          new_orders:          parseInt(orderStats.rows[0].new_orders, 10),
          new_revenue:         parseFloat(orderStats.rows[0].new_revenue),
          total_users:         parseInt(userStats.rows[0].total_users, 10),
          new_users:           parseInt(userStats.rows[0].new_users, 10),
          total_products:      parseInt(productCount.rows[0].total_products, 10),
        };
      }

      const id = uuidv4();
      const result = await db.query(
        `INSERT INTO analytics_snapshots
           (id, store_id, period, snapshot_date,
            total_orders, total_revenue, total_products, total_users,
            new_orders, new_revenue, new_users, avg_order_value, platform_commission,
            created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
         ON CONFLICT (store_id, period, snapshot_date)
         DO UPDATE SET
           total_orders        = EXCLUDED.total_orders,
           total_revenue       = EXCLUDED.total_revenue,
           total_products      = EXCLUDED.total_products,
           total_users         = EXCLUDED.total_users,
           new_orders          = EXCLUDED.new_orders,
           new_revenue         = EXCLUDED.new_revenue,
           new_users           = EXCLUDED.new_users,
           avg_order_value     = EXCLUDED.avg_order_value,
           platform_commission = EXCLUDED.platform_commission
         RETURNING *`,
        [
          id, store_id, period, today,
          metrics.total_orders, metrics.total_revenue, metrics.total_products, metrics.total_users,
          metrics.new_orders, metrics.new_revenue, metrics.new_users,
          metrics.avg_order_value, metrics.platform_commission,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('capture analytics snapshot error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

module.exports = router;
