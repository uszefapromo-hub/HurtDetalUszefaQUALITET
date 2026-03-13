'use strict'

/**
 * Analytics Module – Service (business-logic layer)
 */

const AnalyticsModel = require('./model')

async function trackEvent({ userId, eventType, eventData }) {
  if (!AnalyticsModel.VALID_EVENT_TYPES.includes(eventType)) {
    const err = new Error(`Nieprawidłowy typ zdarzenia: ${eventType}`)
    err.status = 400
    throw err
  }
  return AnalyticsModel.recordEvent({ userId, eventType, eventData })
}

async function listEvents({ eventType, userId, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit
  const [total, events] = await Promise.all([
    AnalyticsModel.countEvents({ eventType, userId }),
    AnalyticsModel.listEvents({ eventType, userId, limit, offset }),
  ])
  return { total, page, limit, events }
}

module.exports = { trackEvent, listEvents }
