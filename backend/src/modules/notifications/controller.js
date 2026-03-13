'use strict'

/**
 * Notifications Module – Controller (request/response layer)
 */

const { body, param, query, validationResult } = require('express-validator')
const NotificationsService = require('./service')

function validationErrors(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg })
    return true
  }
  return false
}

// GET /api/notifications
const listValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
]

async function list(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10))
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10))
    const result = await NotificationsService.listNotifications(req.user.id, { page, limit })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// PATCH /api/notifications/:id/read
const idValidators = [
  param('id').isUUID().withMessage('Nieprawidłowy format id'),
]

async function markRead(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const notification = await NotificationsService.markRead(req.params.id, req.user.id)
    res.json(notification)
  } catch (err) {
    next(err)
  }
}

// POST /api/notifications/read-all
async function markAllRead(req, res, next) {
  try {
    await NotificationsService.markAllRead(req.user.id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/notifications/:id
async function remove(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    await NotificationsService.deleteNotification(req.params.id, req.user.id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

// POST /api/notifications (admin: send to a user)
const createValidators = [
  body('user_id').isUUID().withMessage('user_id jest wymagany'),
  body('title').notEmpty().withMessage('Tytuł jest wymagany').isLength({ max: 255 }),
  body('message').notEmpty().withMessage('Treść jest wymagana'),
]

async function create(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const notification = await NotificationsService.createNotification({
      userId: req.body.user_id,
      title: req.body.title,
      message: req.body.message,
    })
    res.status(201).json(notification)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listValidators,
  list,
  idValidators,
  markRead,
  markAllRead,
  createValidators,
  create,
  remove,
}
