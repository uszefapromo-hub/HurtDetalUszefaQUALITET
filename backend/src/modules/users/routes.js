'use strict'

/**
 * Users Module – Routes
 *
 * GET  /api/users/profile  – get full user profile (user + user_profiles row)
 * PUT  /api/users/profile  – update user and extended profile
 */

const { Router } = require('express')
const { authenticate } = require('../../middleware/auth')
const ctrl = require('./controller')

const router = Router()

router.use(authenticate)

router.get('/profile', ctrl.getProfile)
router.put('/profile', ctrl.updateProfileValidators, ctrl.updateProfile)

module.exports = router
