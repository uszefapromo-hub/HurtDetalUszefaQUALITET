'use strict'

/**
 * Notifications Module – Routes
 *
 * GET    /api/notifications           – list user's notifications
 * PATCH  /api/notifications/:id/read  – mark single notification as read
 * POST   /api/notifications/read-all  – mark all as read
 * DELETE /api/notifications/:id       – delete a notification
 * POST   /api/notifications           – admin: send notification to a user
 */

const { Router } = require('express')
const { authenticate, requireRole } = require('../../middleware/auth')
const ctrl = require('./controller')

const router = Router()

router.use(authenticate)

router.get('/', ctrl.listValidators, ctrl.list)
router.post('/read-all', ctrl.markAllRead)
router.patch('/:id/read', ctrl.idValidators, ctrl.markRead)
router.delete('/:id', ctrl.idValidators, ctrl.remove)
router.post('/', requireRole('owner', 'admin'), ctrl.createValidators, ctrl.create)

module.exports = router
