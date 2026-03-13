'use strict'

/**
 * Gamification routes.
 *
 * Public endpoints:
 *   GET  /api/gamification/badges          – list all badge definitions
 *   GET  /api/gamification/leaderboard     – top 20 users by total points
 *
 * Authenticated endpoints:
 *   GET  /api/gamification/my/points       – user's total points, level, and recent log
 *   GET  /api/gamification/my/badges       – user's earned badges
 *
 * Admin endpoints:
 *   POST /api/gamification/award           – award points to a user (admin only)
 */

const express = require('express')
const { body, query } = require('express-validator')
const { v4: uuidv4 } = require('uuid')

const db = require('../config/database')
const { authenticate, requireRole } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

const router = express.Router()

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calculate level from total points.
 * Level = floor(total_points / 100) + 1
 * next_level_points = level * 100
 */
function computeLevel(totalPoints) {
  const level = Math.floor(totalPoints / 100) + 1
  const nextLevelPoints = level * 100
  return { level, next_level_points: nextLevelPoints }
}

// ─── GET /api/gamification/badges ────────────────────────────────────────────
/**
 * List all badge definitions (public).
 */
router.get('/badges', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, slug, name, description, icon,
              requirement_type, requirement_value, points_reward, created_at
       FROM badge_definitions
       ORDER BY points_reward ASC`
    )

    res.json({ badges: result.rows })
  } catch (err) {
    console.error('GET /api/gamification/badges', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/gamification/my/points ─────────────────────────────────────────
/**
 * Get the authenticated user's total points, level, and last 10 log entries.
 * Returns: { total_points, level, next_level_points, recent: [...] }
 */
router.get('/my/points', authenticate, async (req, res) => {
  try {
    const userId = req.user.id

    const [totalResult, recentResult] = await Promise.all([
      db.query(
        'SELECT COALESCE(SUM(points), 0)::TEXT AS total FROM user_points_log WHERE user_id = $1',
        [userId]
      ),
      db.query(
        `SELECT id, points, action, reference_id, created_at
         FROM user_points_log
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId]
      ),
    ])

    const totalPoints = parseInt(totalResult.rows[0].total) || 0
    const { level, next_level_points } = computeLevel(totalPoints)

    res.json({
      total_points: totalPoints,
      level,
      next_level_points,
      recent: recentResult.rows,
    })
  } catch (err) {
    console.error('GET /api/gamification/my/points', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/gamification/my/badges ─────────────────────────────────────────
/**
 * Get the authenticated user's earned badges.
 */
router.get('/my/badges', authenticate, async (req, res) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      `SELECT ub.id, ub.badge_id, bd.slug, bd.name, bd.description, bd.icon,
              bd.points_reward, ub.earned_at
       FROM user_badges ub
       JOIN badge_definitions bd ON bd.id = ub.badge_id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [userId]
    )

    res.json({ badges: result.rows })
  } catch (err) {
    console.error('GET /api/gamification/my/badges', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/gamification/leaderboard ───────────────────────────────────────
/**
 * Top 20 users by total points.
 * Query params: type (buyers|sellers|all, default all)
 */
router.get('/leaderboard', [
  query('type').optional().isIn(['buyers', 'sellers', 'all']),
  validate,
], async (req, res) => {
  try {
    const type = req.query.type || 'all'

    let roleFilter = ''
    const params = []

    if (type === 'buyers') {
      params.push('buyer')
      roleFilter = `JOIN users u ON u.id = upl.user_id WHERE u.role = $${params.length}`
    } else if (type === 'sellers') {
      params.push('seller')
      roleFilter = `JOIN users u ON u.id = upl.user_id WHERE u.role = $${params.length}`
    } else {
      roleFilter = 'LEFT JOIN users u ON u.id = upl.user_id'
    }

    const result = await db.query(
      `SELECT upl.user_id, u.name, u.email,
              SUM(upl.points)::TEXT AS total_points
       FROM user_points_log upl
       ${roleFilter}
       GROUP BY upl.user_id, u.name, u.email
       ORDER BY total_points DESC
       LIMIT 20`,
      params
    )

    res.json({ leaderboard: result.rows })
  } catch (err) {
    console.error('GET /api/gamification/leaderboard', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── POST /api/gamification/award ────────────────────────────────────────────
/**
 * Award points to a user (admin only).
 * Body: { user_id, points, action, reference_id? }
 */
router.post('/award', authenticate, requireRole('admin', 'owner'), [
  body('user_id').isUUID().withMessage('Nieprawidłowy user_id'),
  body('points').isInt({ min: 1 }).withMessage('Punkty muszą być liczbą całkowitą > 0'),
  body('action').trim().notEmpty().withMessage('Akcja jest wymagana'),
  body('reference_id').optional({ nullable: true }).isUUID(),
  validate,
], async (req, res) => {
  try {
    const { user_id, points, action, reference_id = null } = req.body

    const result = await db.query(
      `INSERT INTO user_points_log (id, user_id, points, action, reference_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [uuidv4(), user_id, points, action, reference_id]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('POST /api/gamification/award', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

module.exports = router
