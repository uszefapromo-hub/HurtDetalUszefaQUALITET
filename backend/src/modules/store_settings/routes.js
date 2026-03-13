'use strict'

/**
 * Store Settings Module – Routes
 *
 * GET /api/stores/:id/settings  – get store appearance settings
 * PUT /api/stores/:id/settings  – update store appearance settings (owner only)
 */

const { Router } = require('express')
const { authenticate } = require('../../middleware/auth')
const ctrl = require('./controller')

const router = Router({ mergeParams: true })

router.use(authenticate)

router.get('/', ctrl.storeIdValidators, ctrl.getSettings)
router.put('/', ctrl.updateValidators, ctrl.updateSettings)

module.exports = router
