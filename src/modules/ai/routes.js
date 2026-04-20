'use strict'

const { Router } = require('express')
const { authenticate } = require('../../middleware/auth')
const ctrl = require('./controller')

const router = Router()

router.use(authenticate)

router.post('/chat', ctrl.chatValidators, ctrl.postChat)
router.get('/conversations', ctrl.listConversationsValidators, ctrl.listConversations)
router.get('/conversations/:id', ctrl.getConversationValidators, ctrl.getConversation)
router.delete('/conversations/:id', ctrl.getConversationValidators, ctrl.deleteConversation)

router.post('/product-description', ctrl.productDescriptionValidators, ctrl.postProductDescription)
router.post('/generate-product-description', ctrl.productDescriptionValidators, ctrl.postProductDescription)
router.post('/generate-short-description', ctrl.shortDescriptionValidators, ctrl.postShortDescription)
router.post('/generate-cta', ctrl.ctaValidators, ctrl.postGenerateCta)
router.post('/generate-seo-title', ctrl.seoValidators, ctrl.postGenerateSeo)
router.post('/generate-social-post', ctrl.socialPostValidators, ctrl.postSocialPost)
router.post('/support-chat', ctrl.supportChatValidators, ctrl.postSupportChat)
router.post('/rewrite-supplier-description', ctrl.rewriteSupplierDescriptionValidators, ctrl.postRewriteSupplierDescription)
router.post('/suggest-product-tags', ctrl.suggestProductTagsValidators, ctrl.postSuggestProductTags)
router.post('/live-script', ctrl.liveScriptValidators, ctrl.postLiveScript)
router.post('/repair-helper', ctrl.repairHelperValidators, ctrl.postRepairHelper)

router.post('/store-description', ctrl.storeDescriptionValidators, ctrl.postStoreDescription)
router.post('/generate-store', ctrl.generateStoreValidators, ctrl.postGenerateStore)
router.post('/marketing-pack', ctrl.marketingPackValidators, ctrl.postMarketingPack)

module.exports = router
