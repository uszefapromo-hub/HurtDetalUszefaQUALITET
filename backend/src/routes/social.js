'use strict'

/**
 * Social Commerce routes.
 *
 * Public endpoints:
 *   GET  /api/social/feed                     – paginated public feed of posts
 *   GET  /api/social/posts/:id                – single post with counts
 *   GET  /api/social/posts/:id/comments       – list comments for a post
 *   GET  /api/social/trending                 – top posts by likes in last 7 days
 *   GET  /api/social/rankings                 – top products by score (period param)
 *
 * Authenticated endpoints:
 *   POST /api/social/posts                    – create a post
 *   POST /api/social/posts/:id/like           – toggle like on a post
 *   POST /api/social/posts/:id/comments       – add a comment to a post
 */

const express = require('express')
const { body, query, param } = require('express-validator')
const { v4: uuidv4 } = require('uuid')

const db = require('../config/database')
const { authenticate } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

const router = express.Router()

// ─── GET /api/social/feed ─────────────────────────────────────────────────────
/**
 * Public feed of social posts, paginated.
 * Query params: limit (default 20, max 100), offset (default 0)
 */
router.get('/feed', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
], async (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const offset = parseInt(req.query.offset) || 0

    const result = await db.query(
      `SELECT sp.id, sp.user_id, sp.post_type, sp.reference_id, sp.content,
              sp.media_url, sp.created_at, sp.updated_at,
              COUNT(DISTINCT pl.id)::TEXT AS like_count,
              COUNT(DISTINCT pc.id)::TEXT AS comment_count
       FROM social_posts sp
       LEFT JOIN post_likes pl ON pl.post_id = sp.id
       LEFT JOIN post_comments pc ON pc.post_id = sp.id AND pc.is_active = TRUE
       WHERE sp.is_active = TRUE
       GROUP BY sp.id
       ORDER BY sp.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    res.json({ posts: result.rows })
  } catch (err) {
    console.error('GET /api/social/feed', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── POST /api/social/posts ───────────────────────────────────────────────────
/**
 * Create a new social post. Requires authentication.
 * Body: { content, post_type, reference_id?, media_url? }
 */
router.post('/posts', authenticate, [
  body('content').trim().notEmpty().withMessage('Treść jest wymagana').isLength({ max: 500 }).withMessage('Treść może mieć maksymalnie 500 znaków'),
  body('post_type').isIn(['product', 'store', 'general']).withMessage('Nieprawidłowy typ posta'),
  body('reference_id').optional({ nullable: true }).isUUID(),
  body('media_url').optional({ nullable: true }).isURL(),
  validate,
], async (req, res) => {
  try {
    const userId = req.user.id
    const { content, post_type, reference_id = null, media_url = null } = req.body

    const result = await db.query(
      `INSERT INTO social_posts (id, user_id, post_type, reference_id, content, media_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uuidv4(), userId, post_type, reference_id, content, media_url]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('POST /api/social/posts', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/social/posts/:id ────────────────────────────────────────────────
/**
 * Get a single post with like count and comment count.
 */
router.get('/posts/:id', [
  param('id').isUUID(),
  validate,
], async (req, res) => {
  try {
    const result = await db.query(
      `SELECT sp.id, sp.user_id, sp.post_type, sp.reference_id, sp.content,
              sp.media_url, sp.created_at, sp.updated_at,
              COUNT(DISTINCT pl.id)::TEXT AS like_count,
              COUNT(DISTINCT pc.id)::TEXT AS comment_count
       FROM social_posts sp
       LEFT JOIN post_likes pl ON pl.post_id = sp.id
       LEFT JOIN post_comments pc ON pc.post_id = sp.id AND pc.is_active = TRUE
       WHERE sp.id = $1 AND sp.is_active = TRUE
       GROUP BY sp.id`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post nie znaleziony' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('GET /api/social/posts/:id', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── POST /api/social/posts/:id/like ─────────────────────────────────────────
/**
 * Toggle like on a post. Requires authentication.
 * Returns 201 when liked, 200 when unliked.
 */
router.post('/posts/:id/like', authenticate, [
  param('id').isUUID(),
  validate,
], async (req, res) => {
  try {
    const userId = req.user.id
    const postId = req.params.id

    // Verify post exists
    const postCheck = await db.query(
      'SELECT id FROM social_posts WHERE id = $1 AND is_active = TRUE',
      [postId]
    )
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post nie znaleziony' })
    }

    // Check for existing like
    const existing = await db.query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    )

    if (existing.rows.length > 0) {
      // Unlike
      await db.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId])
      return res.json({ liked: false })
    }

    // Like
    await db.query(
      'INSERT INTO post_likes (id, post_id, user_id) VALUES ($1, $2, $3)',
      [uuidv4(), postId, userId]
    )
    res.status(201).json({ liked: true })
  } catch (err) {
    console.error('POST /api/social/posts/:id/like', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/social/posts/:id/comments ──────────────────────────────────────
/**
 * List comments for a post, paginated.
 * Query params: limit (default 20, max 100), offset (default 0)
 */
router.get('/posts/:id/comments', [
  param('id').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
], async (req, res) => {
  try {
    const postId = req.params.id
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const offset = parseInt(req.query.offset) || 0

    const result = await db.query(
      `SELECT id, post_id, user_id, content, created_at
       FROM post_comments
       WHERE post_id = $1 AND is_active = TRUE
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    )

    res.json({ comments: result.rows })
  } catch (err) {
    console.error('GET /api/social/posts/:id/comments', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── POST /api/social/posts/:id/comments ─────────────────────────────────────
/**
 * Add a comment to a post. Requires authentication.
 * Body: { content }
 */
router.post('/posts/:id/comments', authenticate, [
  param('id').isUUID(),
  body('content').trim().notEmpty().withMessage('Treść komentarza jest wymagana').isLength({ max: 300 }).withMessage('Komentarz może mieć maksymalnie 300 znaków'),
  validate,
], async (req, res) => {
  try {
    const userId = req.user.id
    const postId = req.params.id
    const { content } = req.body

    // Verify post exists
    const postCheck = await db.query(
      'SELECT id FROM social_posts WHERE id = $1 AND is_active = TRUE',
      [postId]
    )
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post nie znaleziony' })
    }

    const result = await db.query(
      `INSERT INTO post_comments (id, post_id, user_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [uuidv4(), postId, userId, content]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('POST /api/social/posts/:id/comments', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/social/trending ─────────────────────────────────────────────────
/**
 * Top posts by likes in the last 7 days, up to 20.
 */
router.get('/trending', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT sp.id, sp.user_id, sp.post_type, sp.content, sp.media_url, sp.created_at,
              COUNT(pl.id)::TEXT AS like_count
       FROM social_posts sp
       LEFT JOIN post_likes pl ON pl.post_id = sp.id AND pl.created_at >= NOW() - INTERVAL '7 days'
       WHERE sp.is_active = TRUE AND sp.created_at >= NOW() - INTERVAL '7 days'
       GROUP BY sp.id
       ORDER BY like_count DESC, sp.created_at DESC
       LIMIT 20`
    )

    res.json({ posts: result.rows })
  } catch (err) {
    console.error('GET /api/social/trending', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/social/rankings ─────────────────────────────────────────────────
/**
 * Top products by score.
 * Query params: period (daily|weekly|monthly, default weekly), limit (default 20, max 100)
 */
router.get('/rankings', [
  query('period').optional().isIn(['daily', 'weekly', 'monthly']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
], async (req, res) => {
  try {
    const period = req.query.period || 'weekly'
    const limit = Math.min(100, parseInt(req.query.limit) || 20)

    const result = await db.query(
      `SELECT product_id, store_id, score, period, computed_at
       FROM product_rankings
       WHERE period = $1
       ORDER BY score DESC
       LIMIT $2`,
      [period, limit]
    )

    res.json({ rankings: result.rows })
  } catch (err) {
    console.error('GET /api/social/rankings', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

module.exports = router
