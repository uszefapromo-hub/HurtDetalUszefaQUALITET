'use strict'

/**
 * Analytics Module – Controller (request/response layer)
 */

const { body, query, validationResult } = require('express-validator')
const AnalyticsService = require('./service')
const { VALID_EVENT_TYPES } = require('./model')

function validationErrors(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg })
    return true
  }
  return false
}

// POST /api/analytics/events – track a raw analytics event
const trackValidators = [
  body('event_type').isIn(VALID_EVENT_TYPES).withMessage(`Typ musi być jednym z: ${VALID_EVENT_TYPES.join(', ')}`),
  body('event_data').optional().isObject(),
]

async function trackEvent(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const event = await AnalyticsService.trackEvent({
      userId: req.user ? req.user.id : null,
      eventType: req.body.event_type,
      eventData: req.body.event_data || {},
    })
    res.status(201).json(event)
  } catch (err) {
    next(err)
  }
}

// GET /api/analytics/events – list events (admin only)
const listValidators = [
  query('event_type').optional().isIn(VALID_EVENT_TYPES),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
]

async function listEvents(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10))
    const limit = Math.min(100, parseInt(req.query.limit || '50', 10))
    const result = await AnalyticsService.listEvents({
      eventType: req.query.event_type || null,
      userId: req.query.user_id || null,
      page,
      limit,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  trackValidators,
  trackEvent,
  listValidators,
  listEvents,
}
