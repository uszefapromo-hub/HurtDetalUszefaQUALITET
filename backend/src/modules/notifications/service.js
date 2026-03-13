'use strict'

/**
 * Notifications Module – Service (business-logic layer)
 */

const NotificationsModel = require('./model')

async function listNotifications(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit
  const [total, notifications] = await Promise.all([
    NotificationsModel.countByUserId(userId),
    NotificationsModel.findByUserId(userId, { limit, offset }),
  ])
  return { total, page, limit, notifications }
}

async function createNotification({ userId, title, message }) {
  return NotificationsModel.create({ userId, title, message })
}

async function markRead(id, userId) {
  const notification = await NotificationsModel.markRead(id, userId)
  if (!notification) {
    const err = new Error('Powiadomienie nie znalezione')
    err.status = 404
    throw err
  }
  return notification
}

async function markAllRead(userId) {
  await NotificationsModel.markAllRead(userId)
}

async function deleteNotification(id, userId) {
  const deleted = await NotificationsModel.deleteById(id, userId)
  if (!deleted) {
    const err = new Error('Powiadomienie nie znalezione')
    err.status = 404
    throw err
  }
  return deleted
}

module.exports = { listNotifications, createNotification, markRead, markAllRead, deleteNotification }
