'use strict'

/**
 * Users Module – Controller (request/response layer)
 */

const { body, validationResult } = require('express-validator')
const UsersService = require('./service')

function validationErrors(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg })
    return true
  }
  return false
}

// GET /api/users/profile
async function getProfile(req, res, next) {
  try {
    const profile = await UsersService.getProfile(req.user.id)
    res.json(profile)
  } catch (err) {
    next(err)
  }
}

// PUT /api/users/profile
const updateProfileValidators = [
  body('name').optional().trim().notEmpty().withMessage('Imię nie może być puste'),
  body('phone').optional().isMobilePhone().withMessage('Nieprawidłowy numer telefonu'),
  body('bio').optional().trim(),
  body('country').optional().trim(),
  body('language').optional().isLength({ min: 2, max: 10 }),
  body('social_links').optional().isObject(),
]

async function updateProfile(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await UsersService.updateProfile(req.user.id, {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio,
      country: req.body.country,
      language: req.body.language,
      socialLinks: req.body.social_links,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getProfile,
  updateProfileValidators,
  updateProfile,
}
