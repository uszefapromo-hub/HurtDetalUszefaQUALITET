'use strict';

/**
 * Gamification module routes – mounted at /api/gamification.
 *
 *   GET  /api/gamification/leaderboard            – public leaderboard (board_type, period query)
 *   GET  /api/gamification/my/level               – current user's levels & progress
 *   GET  /api/gamification/my/badges              – current user's badges
 *   GET  /api/gamification/my/points              – current user's points history
 *   POST /api/gamification/points                 – award points (admin/owner only)
 *   POST /api/gamification/badges/award           – award a badge to a user (admin/owner only)
 *   POST /api/gamification/leaderboard/refresh    – recompute leaderboard snapshot (admin/owner only)
 */

const express = require('express');
const { query, body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_BOARD_TYPES = ['top_creators', 'top_sellers', 'top_stores', 'top_products'];
const VALID_PERIODS = ['week', 'month', 'all_time'];
const VALID_POINT_SOURCES = ['product_sale', 'affiliate_sale', 'creator_promotion', 'live_stream', 'referral'];
const LEVEL_THRESHOLDS = {
  store:   [0, 500, 2000, 5000, 15000],
  creator: [0, 300, 1000, 3000, 10000],
};

// ─── Helper: compute level number from total points ───────────────────────────

function computeLevel(category, totalPoints) {
  const thresholds = LEVEL_THRESHOLDS[category] || LEVEL_THRESHOLDS.store;
  let level = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= thresholds[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

// ─── Helper: build current-period key ─────────────────────────────────────────

function periodKey(period) {
  const now = new Date();
  if (period === 'week') {
    // ISO week: YYYY-Www
    const jan1 = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  if (period === 'month') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  return 'all_time';
}

// ─── GET /api/gamification/leaderboard ────────────────────────────────────────
// Public endpoint – returns top-N entries for a given board_type and period.

router.get(
  '/leaderboard',
  [
    query('board_type').isIn(VALID_BOARD_TYPES).withMessage('Nieprawidłowy typ rankingu'),
    query('period').optional().isIn(VALID_PERIODS).withMessage('Nieprawidłowy okres'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  async (req, res) => {
    const boardType = req.query.board_type;
    const period    = req.query.period || 'month';
    const limit     = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const pKey      = periodKey(period);

    try {
      const result = await db.query(
        `SELECT rank, entity_id, entity_name, score, metadata
           FROM leaderboards
          WHERE board_type = $1
            AND period = $2
            AND period_key = $3
          ORDER BY rank ASC
          LIMIT $4`,
        [boardType, period, pKey, limit]
      );
      return res.json({ board_type: boardType, period, period_key: pKey, entries: result.rows });
    } catch (err) {
      console.error('gamification leaderboard error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── GET /api/gamification/my/level ───────────────────────────────────────────
// Returns the authenticated user's store-level and creator-level with progress.

router.get('/my/level', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT category, level_number, total_points FROM user_levels WHERE user_id = $1`,
      [userId]
    );

    const levels = { store: null, creator: null };
    for (const row of result.rows) {
      const thresholds = LEVEL_THRESHOLDS[row.category] || LEVEL_THRESHOLDS.store;
      const nextThreshold = thresholds[row.level_number] || null; // points needed for next level
      const prevThreshold = thresholds[row.level_number - 1] || 0;
      const progress = nextThreshold
        ? Math.min(100, Math.round(((row.total_points - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
        : 100;
      levels[row.category] = {
        level_number: row.level_number,
        total_points: row.total_points,
        next_level_points: nextThreshold,
        progress_percent: progress,
      };
    }

    // Provide defaults for categories not yet initialised
    for (const cat of ['store', 'creator']) {
      if (!levels[cat]) {
        levels[cat] = { level_number: 1, total_points: 0, next_level_points: LEVEL_THRESHOLDS[cat][1], progress_percent: 0 };
      }
    }

    return res.json({ user_id: userId, levels });
  } catch (err) {
    console.error('gamification my level error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── GET /api/gamification/my/badges ──────────────────────────────────────────
// Returns all badges the authenticated user has earned.

router.get('/my/badges', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT ub.badge_slug, ub.awarded_at,
              bd.name, bd.description, bd.icon
         FROM user_badges ub
         JOIN badge_definitions bd ON bd.slug = ub.badge_slug
        WHERE ub.user_id = $1
        ORDER BY ub.awarded_at DESC`,
      [userId]
    );
    return res.json({ user_id: userId, badges: result.rows });
  } catch (err) {
    console.error('gamification my badges error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── GET /api/gamification/my/points ──────────────────────────────────────────
// Returns the authenticated user's points history.

router.get(
  '/my/points',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  async (req, res) => {
    const userId = req.user.id;
    const page   = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const offset = (page - 1) * limit;

    try {
      const [countResult, rowsResult] = await Promise.all([
        db.query('SELECT COUNT(*) FROM user_points WHERE user_id = $1', [userId]),
        db.query(
          `SELECT id, source, points, reference_id, created_at
             FROM user_points
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3`,
          [userId, limit, offset]
        ),
      ]);

      const total = parseInt(countResult.rows[0].count, 10);
      return res.json({ total, page, limit, points: rowsResult.rows });
    } catch (err) {
      console.error('gamification my points error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/gamification/points ────────────────────────────────────────────
// Award points to a user (admin/owner only). Also updates user_levels.

router.post(
  '/points',
  authenticate,
  requireRole('admin', 'owner'),
  [
    body('user_id').isUUID().withMessage('Wymagane user_id (UUID)'),
    body('source').isIn(VALID_POINT_SOURCES).withMessage('Nieprawidłowe źródło punktów'),
    body('points').isInt({ min: 1, max: 10000 }).withMessage('Punkty muszą być między 1 a 10000'),
    body('reference_id').optional().isUUID(),
    body('category').optional().isIn(['store', 'creator']),
  ],
  validate,
  async (req, res) => {
    const { user_id, source, points, reference_id, category = 'store' } = req.body;

    try {
      // Verify user exists
      const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [user_id]);
      if (!userCheck.rows.length) {
        return res.status(404).json({ error: 'Użytkownik nie istnieje' });
      }

      // Insert points entry
      const insertResult = await db.query(
        `INSERT INTO user_points (id, user_id, source, points, reference_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, source, points, reference_id, created_at`,
        [uuidv4(), user_id, source, points, reference_id || null]
      );
      const pointEntry = insertResult.rows[0];

      // Upsert user_levels
      const levelResult = await db.query(
        `INSERT INTO user_levels (id, user_id, category, level_number, total_points)
         VALUES ($1, $2, $3, 1, $4)
         ON CONFLICT (user_id, category)
         DO UPDATE SET
           total_points = user_levels.total_points + $4,
           level_number = EXCLUDED.level_number,
           updated_at   = NOW()
         RETURNING total_points`,
        [uuidv4(), user_id, category, points]
      );

      const newTotal = levelResult.rows[0].total_points;
      const newLevel = computeLevel(category, newTotal);

      // Sync level_number after computing
      await db.query(
        `UPDATE user_levels SET level_number = $1 WHERE user_id = $2 AND category = $3`,
        [newLevel, user_id, category]
      );

      return res.status(201).json({
        point_entry: pointEntry,
        level: { category, level_number: newLevel, total_points: newTotal },
      });
    } catch (err) {
      console.error('gamification award points error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/gamification/badges/award ──────────────────────────────────────
// Award a badge to a user (admin/owner only).

router.post(
  '/badges/award',
  authenticate,
  requireRole('admin', 'owner'),
  [
    body('user_id').isUUID().withMessage('Wymagane user_id (UUID)'),
    body('badge_slug').isString().notEmpty().withMessage('Wymagany badge_slug'),
  ],
  validate,
  async (req, res) => {
    const { user_id, badge_slug } = req.body;

    try {
      // Verify user and badge exist
      const [userCheck, badgeCheck] = await Promise.all([
        db.query('SELECT id FROM users WHERE id = $1', [user_id]),
        db.query('SELECT slug, name, icon FROM badge_definitions WHERE slug = $1', [badge_slug]),
      ]);

      if (!userCheck.rows.length) return res.status(404).json({ error: 'Użytkownik nie istnieje' });
      if (!badgeCheck.rows.length) return res.status(404).json({ error: 'Odznaka nie istnieje' });

      // Insert (ignore duplicate)
      const result = await db.query(
        `INSERT INTO user_badges (id, user_id, badge_slug)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, badge_slug) DO NOTHING
         RETURNING id, user_id, badge_slug, awarded_at`,
        [uuidv4(), user_id, badge_slug]
      );

      if (!result.rows.length) {
        return res.status(409).json({ error: 'Użytkownik już posiada tę odznakę' });
      }

      return res.status(201).json({
        awarded: result.rows[0],
        badge: badgeCheck.rows[0],
      });
    } catch (err) {
      console.error('gamification award badge error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/gamification/leaderboard/refresh ───────────────────────────────
// Recompute a leaderboard snapshot. (admin/owner only)
// This is a lightweight version that aggregates from user_points and orders.

router.post(
  '/leaderboard/refresh',
  authenticate,
  requireRole('admin', 'owner'),
  [
    body('board_type').isIn(VALID_BOARD_TYPES).withMessage('Nieprawidłowy typ rankingu'),
    body('period').optional().isIn(VALID_PERIODS).withMessage('Nieprawidłowy okres'),
  ],
  validate,
  async (req, res) => {
    const boardType = req.body.board_type;
    const period    = req.body.period || 'month';
    const pKey      = periodKey(period);

    try {
      let rows = [];

      if (boardType === 'top_sellers' || boardType === 'top_stores') {
        // Aggregate from user_points joined with users to avoid N+1 subquery
        const result = await db.query(
          `SELECT up.user_id AS entity_id,
                  COALESCE(u.name, 'Nieznany') AS entity_name,
                  SUM(up.points) AS score
             FROM user_points up
             LEFT JOIN users u ON u.id = up.user_id
            WHERE up.source = 'product_sale'
            GROUP BY up.user_id, u.name
            ORDER BY score DESC
            LIMIT 50`
        );
        rows = result.rows;
      } else if (boardType === 'top_creators') {
        const result = await db.query(
          `SELECT up.user_id AS entity_id,
                  COALESCE(u.name, 'Nieznany') AS entity_name,
                  SUM(up.points) AS score
             FROM user_points up
             LEFT JOIN users u ON u.id = up.user_id
            WHERE up.source IN ('affiliate_sale', 'creator_promotion')
            GROUP BY up.user_id, u.name
            ORDER BY score DESC
            LIMIT 50`
        );
        rows = result.rows;
      } else if (boardType === 'top_products') {
        const result = await db.query(
          `SELECT reference_id AS entity_id,
                  NULL AS entity_name,
                  SUM(points) AS score
             FROM user_points
            WHERE source = 'product_sale'
              AND reference_id IS NOT NULL
            GROUP BY reference_id
            ORDER BY score DESC
            LIMIT 50`
        );
        rows = result.rows;
      }

      // Delete old snapshot for this board + period key
      await db.query(
        `DELETE FROM leaderboards WHERE board_type = $1 AND period = $2 AND period_key = $3`,
        [boardType, period, pKey]
      );

      // Bulk-insert new snapshot in parallel
      await Promise.all(
        rows.map((row, i) =>
          db.query(
            `INSERT INTO leaderboards (id, board_type, period, period_key, rank, entity_id, entity_name, score)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (board_type, period_key, rank) DO UPDATE
               SET entity_id = EXCLUDED.entity_id,
                   entity_name = EXCLUDED.entity_name,
                   score = EXCLUDED.score,
                   created_at = NOW()`,
            [uuidv4(), boardType, period, pKey, i + 1, row.entity_id, row.entity_name, row.score]
          )
        )
      );

      return res.json({ refreshed: true, board_type: boardType, period, period_key: pKey, entries_written: rows.length });
    } catch (err) {
      console.error('gamification leaderboard refresh error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

module.exports = router;
