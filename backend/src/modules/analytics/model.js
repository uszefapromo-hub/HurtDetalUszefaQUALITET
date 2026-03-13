'use strict'

/**
 * Analytics Module – Model (data-access layer)
 *
 * Manages the analytics_events table for raw event tracking.
 * (analytics_snapshots is handled by routes/analytics.js)
 */

const db = require('../../config/database')
const { v4: uuidv4 } = require('uuid')

const VALID_EVENT_TYPES = ['product_view', 'product_click', 'add_to_cart', 'purchase']

async function recordEvent({ userId, eventType, eventData }) {
  const result = await db.query(
    `INSERT INTO analytics_events (id, user_id, event_type, event_data, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, event_type, created_at`,
    [uuidv4(), userId || null, eventType, JSON.stringify(eventData || {})]
  )
  return result.rows[0]
}

async function listEvents({ eventType, userId, limit = 50, offset = 0 } = {}) {
  const conditions = []
  const params = []

  if (eventType) {
    params.push(eventType)
    conditions.push(`event_type = $${params.length}`)
  }
  if (userId) {
    params.push(userId)
    conditions.push(`user_id = $${params.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  params.push(limit)
  params.push(offset)

  const result = await db.query(
    `SELECT id, user_id, event_type, event_data, created_at
     FROM analytics_events
     ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )
  return result.rows
}

async function countEvents({ eventType, userId } = {}) {
  const conditions = []
  const params = []

  if (eventType) {
    params.push(eventType)
    conditions.push(`event_type = $${params.length}`)
  }
  if (userId) {
    params.push(userId)
    conditions.push(`user_id = $${params.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await db.query(
    `SELECT COUNT(*) FROM analytics_events ${where}`,
    params
  )
  return parseInt(result.rows[0].count, 10)
}

module.exports = { recordEvent, listEvents, countEvents, VALID_EVENT_TYPES }
