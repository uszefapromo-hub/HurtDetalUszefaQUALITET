'use strict'

/**
 * Collaboration routes – team stores, invitations, revenue sharing.
 *
 * Authenticated endpoints:
 *   GET    /api/collaboration/stores                          – list my collaborative stores
 *   POST   /api/collaboration/stores                          – create collaborative store
 *   GET    /api/collaboration/stores/:id/team                 – list team members
 *   POST   /api/collaboration/stores/:id/invite               – invite a user by email
 *   POST   /api/collaboration/invite/accept                   – accept an invitation by token
 *   DELETE /api/collaboration/stores/:id/members/:userId      – remove a team member
 *   GET    /api/collaboration/stores/:id/activity             – get activity log
 *   GET    /api/collaboration/stores/:id/revenue              – get revenue sharing rules
 *   PUT    /api/collaboration/stores/:id/revenue/:userId      – set revenue share for a user
 */

const crypto = require('crypto')
const express = require('express')
const { body, param, query } = require('express-validator')
const { v4: uuidv4 } = require('uuid')

const db = require('../config/database')
const { authenticate } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

const router = express.Router()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateInviteToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Verify the requesting user is a member of a collaborative store.
 * Returns the membership row or null.
 */
async function getMembership(collaborativeStoreId, userId) {
  const result = await db.query(
    `SELECT tm.role FROM team_members tm
     JOIN collaborative_stores cs ON cs.store_id = tm.store_id
     WHERE cs.id = $1 AND tm.user_id = $2`,
    [collaborativeStoreId, userId]
  )
  return result.rows[0] || null
}

/**
 * Log a team activity (fire-and-forget).
 */
function logActivity(storeId, actorId, action, resource = null, resourceId = null, metadata = {}) {
  db.query(
    `INSERT INTO team_activity_logs (id, store_id, actor_id, action, resource, resource_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [uuidv4(), storeId, actorId, action, resource, resourceId, JSON.stringify(metadata)]
  ).catch((err) => console.error('logActivity error:', err))
}

// ─── GET /api/collaboration/stores ────────────────────────────────────────────
/**
 * List all collaborative stores the authenticated user belongs to.
 */
router.get('/stores', authenticate, async (req, res) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      `SELECT cs.id, cs.store_id, cs.name, cs.description, cs.is_active,
              cs.created_at, cs.updated_at, tm.role AS my_role
       FROM collaborative_stores cs
       JOIN team_members tm ON tm.store_id = cs.store_id AND tm.user_id = $1
       WHERE cs.is_active = TRUE
       ORDER BY cs.created_at DESC`,
      [userId]
    )

    res.json({ stores: result.rows })
  } catch (err) {
    console.error('GET /api/collaboration/stores', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── POST /api/collaboration/stores ───────────────────────────────────────────
/**
 * Create a new collaborative store. The user must own the store_id provided.
 * Body: { store_id, name, description? }
 */
router.post('/stores', authenticate, [
  body('store_id').isUUID().withMessage('Nieprawidłowy store_id'),
  body('name').trim().notEmpty().withMessage('Nazwa jest wymagana'),
  body('description').optional({ nullable: true }).isString(),
  validate,
], async (req, res) => {
  try {
    const userId = req.user.id
    const { store_id, name, description = null } = req.body

    // Verify that the user owns the store
    const ownerCheck = await db.query(
      'SELECT id, owner_id FROM stores WHERE id = $1',
      [store_id]
    )
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Sklep nie znaleziony' })
    }
    if (ownerCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: 'Brak uprawnień do tego sklepu' })
    }

    // Create the collaborative store
    const insertResult = await db.query(
      `INSERT INTO collaborative_stores (id, store_id, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [uuidv4(), store_id, name, description]
    )
    const colStore = insertResult.rows[0]

    // Add the creator as owner in team_members
    await db.query(
      `INSERT INTO team_members (id, store_id, user_id, role)
       VALUES ($1, $2, $3, 'owner')
       ON CONFLICT (store_id, user_id) DO NOTHING`,
      [uuidv4(), store_id, userId]
    )

    res.status(201).json(colStore)
  } catch (err) {
    console.error('POST /api/collaboration/stores', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/collaboration/stores/:id/team ───────────────────────────────────
/**
 * List all team members of a collaborative store.
 * The requesting user must be a member.
 */
router.get('/stores/:id/team', authenticate, [
  param('id').isUUID(),
  validate,
], async (req, res) => {
  try {
    const userId = req.user.id
    const colStoreId = req.params.id

    const membership = await getMembership(colStoreId, userId)
    if (!membership) {
      return res.status(403).json({ error: 'Brak dostępu do tego sklepu' })
    }

    const result = await db.query(
      `SELECT tm.id, tm.user_id, tm.role, tm.joined_at,
              u.name, u.email
       FROM team_members tm
       JOIN collaborative_stores cs ON cs.store_id = tm.store_id
       LEFT JOIN users u ON u.id = tm.user_id
       WHERE cs.id = $1
       ORDER BY tm.joined_at ASC`,
      [colStoreId]
    )

    res.json({ members: result.rows })
  } catch (err) {
    console.error('GET /api/collaboration/stores/:id/team', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── POST /api/collaboration/stores/:id/invite ────────────────────────────────
/**
 * Invite a user by email to the collaborative store.
 * Requires admin or owner role in the team.
 * Body: { email, role? }
 */
router.post('/stores/:id/invite', authenticate, [
  param('id').isUUID(),
  body('email').isEmail().withMessage('Nieprawidłowy adres e-mail'),
  body('role').optional().isIn(['admin', 'member', 'viewer']).withMessage('Nieprawidłowa rola'),
  validate,
], async (req, res) => {
  try {
    const userId = req.user.id
    const colStoreId = req.params.id
    const { email, role = 'member' } = req.body

    const membership = await getMembership(colStoreId, userId)
    if (!membership) {
      return res.status(403).json({ error: 'Brak dostępu do tego sklepu' })
    }
    if (!['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Tylko właściciel lub admin może zapraszać' })
    }

    // Resolve actual store_id from collaborative store
    const csResult = await db.query('SELECT store_id FROM collaborative_stores WHERE id = $1', [colStoreId])
    if (csResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sklep nie znaleziony' })
    }
    const storeId = csResult.rows[0].store_id

    const token = generateInviteToken()

    const result = await db.query(
      `INSERT INTO team_invitations (id, store_id, invited_email, token, role, invited_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, store_id, invited_email, role, status, created_at, expires_at`,
      [uuidv4(), storeId, email, token, role, userId]
    )

    logActivity(storeId, userId, 'invite_sent', 'team_invitation', result.rows[0].id, { email, role })

    res.status(201).json({ invitation: result.rows[0], token })
  } catch (err) {
    console.error('POST /api/collaboration/stores/:id/invite', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── POST /api/collaboration/invite/accept ────────────────────────────────────
/**
 * Accept a team invitation using the token from the invitation email.
 * Body: { token }
 */
router.post('/invite/accept', [
  body('token').trim().notEmpty().withMessage('Token jest wymagany'),
  validate,
], async (req, res) => {
  try {
    const { token } = req.body

    // Find valid pending invitation
    const invResult = await db.query(
      `SELECT id, store_id, invited_email, role, status, expires_at
       FROM team_invitations
       WHERE token = $1`,
      [token]
    )

    if (invResult.rows.length === 0) {
      return res.status(404).json({ error: 'Zaproszenie nie znalezione' })
    }

    const invitation = invResult.rows[0]

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: `Zaproszenie jest już ${invitation.status}` })
    }
    if (new Date(invitation.expires_at) < new Date()) {
      await db.query('UPDATE team_invitations SET status = $1 WHERE id = $2', ['expired', invitation.id])
      return res.status(400).json({ error: 'Zaproszenie wygasło' })
    }

    // Accept invitation
    await db.query('UPDATE team_invitations SET status = $1 WHERE id = $2', ['accepted', invitation.id])

    // Find user by invited_email (optional – they may not be registered)
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [invitation.invited_email])
    if (userResult.rows.length > 0) {
      const joinedUserId = userResult.rows[0].id
      await db.query(
        `INSERT INTO team_members (id, store_id, user_id, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (store_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
        [uuidv4(), invitation.store_id, joinedUserId, invitation.role]
      )
    }

    res.json({ message: 'Zaproszenie zaakceptowane', store_id: invitation.store_id })
  } catch (err) {
    console.error('POST /api/collaboration/invite/accept', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── DELETE /api/collaboration/stores/:id/members/:userId ─────────────────────
/**
 * Remove a team member from a collaborative store.
 * Requires admin or owner role in the team.
 */
router.delete('/stores/:id/members/:userId', authenticate, [
  param('id').isUUID(),
  param('userId').isUUID(),
  validate,
], async (req, res) => {
  try {
    const actorId = req.user.id
    const colStoreId = req.params.id
    const targetUserId = req.params.userId

    const membership = await getMembership(colStoreId, actorId)
    if (!membership) {
      return res.status(403).json({ error: 'Brak dostępu do tego sklepu' })
    }
    if (!['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Tylko właściciel lub admin może usuwać członków' })
    }

    const csResult = await db.query('SELECT store_id FROM collaborative_stores WHERE id = $1', [colStoreId])
    if (csResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sklep nie znaleziony' })
    }
    const storeId = csResult.rows[0].store_id

    await db.query(
      'DELETE FROM team_members WHERE store_id = $1 AND user_id = $2',
      [storeId, targetUserId]
    )

    logActivity(storeId, actorId, 'member_removed', 'user', targetUserId)

    res.json({ message: 'Członek usunięty' })
  } catch (err) {
    console.error('DELETE /api/collaboration/stores/:id/members/:userId', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/collaboration/stores/:id/activity ───────────────────────────────
/**
 * Get activity log for a collaborative store.
 * The requesting user must be a member.
 * Query params: limit (default 20, max 100), offset (default 0)
 */
router.get('/stores/:id/activity', authenticate, [
  param('id').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
], async (req, res) => {
  try {
    const userId = req.user.id
    const colStoreId = req.params.id
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const offset = parseInt(req.query.offset) || 0

    const membership = await getMembership(colStoreId, userId)
    if (!membership) {
      return res.status(403).json({ error: 'Brak dostępu do tego sklepu' })
    }

    const csResult = await db.query('SELECT store_id FROM collaborative_stores WHERE id = $1', [colStoreId])
    if (csResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sklep nie znaleziony' })
    }
    const storeId = csResult.rows[0].store_id

    const result = await db.query(
      `SELECT id, actor_id, action, resource, resource_id, metadata, created_at
       FROM team_activity_logs
       WHERE store_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [storeId, limit, offset]
    )

    res.json({ activity: result.rows })
  } catch (err) {
    console.error('GET /api/collaboration/stores/:id/activity', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── GET /api/collaboration/stores/:id/revenue ────────────────────────────────
/**
 * Get revenue sharing rules for a collaborative store.
 * Requires admin or owner role.
 */
router.get('/stores/:id/revenue', authenticate, [
  param('id').isUUID(),
  validate,
], async (req, res) => {
  try {
    const userId = req.user.id
    const colStoreId = req.params.id

    const membership = await getMembership(colStoreId, userId)
    if (!membership) {
      return res.status(403).json({ error: 'Brak dostępu do tego sklepu' })
    }
    if (!['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Tylko właściciel lub admin może zobaczyć podział przychodów' })
    }

    const csResult = await db.query('SELECT store_id FROM collaborative_stores WHERE id = $1', [colStoreId])
    if (csResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sklep nie znaleziony' })
    }
    const storeId = csResult.rows[0].store_id

    const result = await db.query(
      `SELECT rsr.id, rsr.user_id, u.name, u.email, rsr.share_percent, rsr.created_at
       FROM revenue_sharing_rules rsr
       LEFT JOIN users u ON u.id = rsr.user_id
       WHERE rsr.store_id = $1
       ORDER BY rsr.share_percent DESC`,
      [storeId]
    )

    res.json({ rules: result.rows })
  } catch (err) {
    console.error('GET /api/collaboration/stores/:id/revenue', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

// ─── PUT /api/collaboration/stores/:id/revenue/:userId ────────────────────────
/**
 * Set or update revenue share for a specific team member.
 * Owner role only.
 * Body: { share_percent }
 */
router.put('/stores/:id/revenue/:userId', authenticate, [
  param('id').isUUID(),
  param('userId').isUUID(),
  body('share_percent').isFloat({ min: 0, max: 100 }).withMessage('share_percent musi być liczbą od 0 do 100'),
  validate,
], async (req, res) => {
  try {
    const actorId = req.user.id
    const colStoreId = req.params.id
    const targetUserId = req.params.userId
    const { share_percent } = req.body

    const membership = await getMembership(colStoreId, actorId)
    if (!membership) {
      return res.status(403).json({ error: 'Brak dostępu do tego sklepu' })
    }
    if (membership.role !== 'owner') {
      return res.status(403).json({ error: 'Tylko właściciel może ustawiać podział przychodów' })
    }

    const csResult = await db.query('SELECT store_id FROM collaborative_stores WHERE id = $1', [colStoreId])
    if (csResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sklep nie znaleziony' })
    }
    const storeId = csResult.rows[0].store_id

    const result = await db.query(
      `INSERT INTO revenue_sharing_rules (id, store_id, user_id, share_percent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (store_id, user_id) DO UPDATE SET share_percent = EXCLUDED.share_percent
       RETURNING *`,
      [uuidv4(), storeId, targetUserId, share_percent]
    )

    logActivity(storeId, actorId, 'revenue_share_updated', 'user', targetUserId, { share_percent })

    res.json(result.rows[0])
  } catch (err) {
    console.error('PUT /api/collaboration/stores/:id/revenue/:userId', err)
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
  }
})

module.exports = router
