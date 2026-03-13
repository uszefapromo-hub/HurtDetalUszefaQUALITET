'use strict'

/**
 * Analytics Module – Routes
 *
 * POST /api/analytics/events  – track a raw event (public – no auth required)
 * GET  /api/analytics/events  – list events (admin only)
 */

const { Router } = require('express')
const { authenticate, requireRole } = require('../../middleware/auth')
const ctrl = require('./controller')

const router = Router()

// Event tracking is public (no auth required – anonymous users can trigger events)
router.post('/events', ctrl.trackValidators, ctrl.trackEvent)

// Listing events is admin-only
router.get('/events', authenticate, requireRole('owner', 'admin'), ctrl.listValidators, ctrl.listEvents)

module.exports = router
