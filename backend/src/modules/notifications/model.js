'use strict'

/**
 * Notifications Module – Model (data-access layer)
 */

const db = require('../../config/database')
const { v4: uuidv4 } = require('uuid')

async function create({ userId, title, message }) {
  const result = await db.query(
    `INSERT INTO notifications (id, user_id, title, message, status, created_at)
     VALUES ($1, $2, $3, $4, 'unread', NOW())
     RETURNING *`,
    [uuidv4(), userId, title, message]
  )
  return result.rows[0]
}

async function findByUserId(userId, { limit = 20, offset = 0 } = {}) {
  const result = await db.query(
    `SELECT id, title, message, status, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )
  return result.rows
}

async function countByUserId(userId) {
  const result = await db.query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1',
    [userId]
  )
  return parseInt(result.rows[0].count, 10)
}

async function markRead(id, userId) {
  const result = await db.query(
    `UPDATE notifications SET status = 'read' WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  )
  return result.rows[0] || null
}

async function markAllRead(userId) {
  await db.query(
    `UPDATE notifications SET status = 'read' WHERE user_id = $1 AND status = 'unread'`,
    [userId]
  )
}

async function deleteById(id, userId) {
  const result = await db.query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  )
  return result.rows[0] || null
}

module.exports = { create, findByUserId, countByUserId, markRead, markAllRead, deleteById }
