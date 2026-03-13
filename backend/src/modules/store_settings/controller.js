'use strict'

/**
 * Store Settings Module – Controller (request/response layer)
 */

const { body, param, validationResult } = require('express-validator')
const StoreSettingsService = require('./service')

function validationErrors(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg })
    return true
  }
  return false
}

// GET /api/stores/:id/settings
const storeIdValidators = [
  param('id').isUUID().withMessage('Nieprawidłowy format id sklepu'),
]

async function getSettings(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const settings = await StoreSettingsService.getSettings(req.params.id, req.user.id)
    res.json(settings)
  } catch (err) {
    next(err)
  }
}

// PUT /api/stores/:id/settings
const updateValidators = [
  param('id').isUUID().withMessage('Nieprawidłowy format id sklepu'),
  body('theme').optional().isLength({ max: 50 }),
  body('primary_color').optional().matches(/^#[0-9a-fA-F]{3,8}$/).withMessage('Nieprawidłowy kolor hex'),
  body('secondary_color').optional().matches(/^#[0-9a-fA-F]{3,8}$/).withMessage('Nieprawidłowy kolor hex'),
  body('currency').optional().isLength({ min: 3, max: 10 }),
]

async function updateSettings(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const settings = await StoreSettingsService.updateSettings(req.params.id, req.user.id, {
      theme: req.body.theme,
      primaryColor: req.body.primary_color,
      secondaryColor: req.body.secondary_color,
      currency: req.body.currency,
    })
    res.json(settings)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  storeIdValidators,
  getSettings,
  updateValidators,
  updateSettings,
}
