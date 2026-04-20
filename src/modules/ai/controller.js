'use strict'

const { body, param, query, validationResult } = require('express-validator')
const AiService = require('./service')
const AiModel = require('./model')

function validationErrors(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg })
    return true
  }
  return false
}

const chatValidators = [
  body('message').notEmpty().withMessage('Wiadomość jest wymagana').isLength({ max: 4000 }).withMessage('Wiadomość jest za długa (max 4000 znaków)'),
  body('conversation_id').optional().isUUID().withMessage('Nieprawidłowy format conversation_id'),
  body('context_type').optional().isIn(['product', 'store', 'support', 'general']).withMessage('Nieprawidłowy typ kontekstu'),
  body('context_id').optional().isUUID().withMessage('Nieprawidłowy format context_id'),
]

async function postChat(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.chat({
      userId: req.user.id,
      conversationId: req.body.conversation_id || null,
      userMessage: req.body.message,
      contextType: req.body.context_type || null,
      contextId: req.body.context_id || null,
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const listConversationsValidators = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit musi być liczbą 1–100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset musi być liczbą nieujemną'),
]

async function listConversations(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20)
    const offset = parseInt(req.query.offset, 10) || 0
    const conversations = await AiModel.listConversations(req.user.id, { limit, offset })
    res.json({ conversations })
  } catch (error) {
    next(error)
  }
}

const getConversationValidators = [param('id').isUUID().withMessage('Nieprawidłowy format id')]

async function getConversation(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const conversation = await AiModel.getConversation(req.params.id, req.user.id)
    if (!conversation) return res.status(404).json({ error: 'Rozmowa nie istnieje' })
    const messages = await AiModel.listMessages(req.params.id)
    res.json({ conversation, messages })
  } catch (error) {
    next(error)
  }
}

async function deleteConversation(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const deleted = await AiModel.deleteConversation(req.params.id, req.user.id)
    if (!deleted) return res.status(404).json({ error: 'Rozmowa nie istnieje' })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

const productDescriptionValidators = [
  body('name').notEmpty().withMessage('Nazwa produktu jest wymagana').isLength({ max: 200 }),
  body('category').optional().isLength({ max: 100 }),
  body('keywords').optional().isLength({ max: 250 }),
  body('language').optional().isIn(['pl', 'en', 'de', 'fr']).withMessage('Obsługiwane języki: pl, en, de, fr'),
]

async function postProductDescription(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.generateProductDescription({
      userId: req.user.id,
      name: req.body.name,
      category: req.body.category || '',
      keywords: req.body.keywords || '',
      language: req.body.language || 'pl',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const shortDescriptionValidators = [
  body('name').notEmpty().withMessage('Nazwa produktu jest wymagana').isLength({ max: 200 }),
  body('description').optional().isLength({ max: 5000 }),
  body('category').optional().isLength({ max: 100 }),
]

async function postShortDescription(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.generateShortDescription({
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description || '',
      category: req.body.category || '',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const ctaValidators = [
  body('name').notEmpty().withMessage('Nazwa produktu jest wymagana').isLength({ max: 200 }),
  body('audience').optional().isLength({ max: 200 }),
  body('tone').optional().isLength({ max: 50 }),
]

async function postGenerateCta(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.generateCta({
      userId: req.user.id,
      name: req.body.name,
      audience: req.body.audience || '',
      tone: req.body.tone || 'sprzedażowy',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const seoValidators = [
  body('name').notEmpty().withMessage('Nazwa produktu jest wymagana').isLength({ max: 200 }),
  body('category').optional().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 5000 }),
]

async function postGenerateSeo(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.generateSeoTitle({
      userId: req.user.id,
      name: req.body.name,
      category: req.body.category || '',
      description: req.body.description || '',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const socialPostValidators = [
  body('product_name').notEmpty().withMessage('Nazwa produktu jest wymagana').isLength({ max: 200 }),
  body('audience').optional().isLength({ max: 200 }),
  body('platform').optional().isLength({ max: 50 }),
  body('tone').optional().isLength({ max: 50 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Cena musi być liczbą nieujemną'),
]

async function postSocialPost(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.generateSocialPost({
      userId: req.user.id,
      productName: req.body.product_name,
      audience: req.body.audience || '',
      platform: req.body.platform || 'instagram',
      tone: req.body.tone || 'dynamiczny',
      price: req.body.price || null,
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const supportChatValidators = [
  body('customer_message').notEmpty().withMessage('Treść wiadomości klienta jest wymagana').isLength({ max: 4000 }),
  body('order_status').optional().isLength({ max: 100 }),
  body('context').optional().isLength({ max: 2000 }),
  body('tone').optional().isLength({ max: 50 }),
]

async function postSupportChat(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.supportChat({
      userId: req.user.id,
      customerMessage: req.body.customer_message,
      orderStatus: req.body.order_status || '',
      context: req.body.context || '',
      tone: req.body.tone || 'empatyczny',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const rewriteSupplierDescriptionValidators = [
  body('raw_description').notEmpty().withMessage('Surowy opis jest wymagany').isLength({ max: 10000 }),
  body('supplier_name').optional().isLength({ max: 200 }),
  body('name').optional().isLength({ max: 200 }),
  body('category').optional().isLength({ max: 100 }),
]

async function postRewriteSupplierDescription(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.rewriteSupplierDescription({
      userId: req.user.id,
      supplierName: req.body.supplier_name || '',
      name: req.body.name || '',
      rawDescription: req.body.raw_description,
      category: req.body.category || '',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const suggestProductTagsValidators = [
  body('name').notEmpty().withMessage('Nazwa produktu jest wymagana').isLength({ max: 200 }),
  body('category').optional().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 5000 }),
]

async function postSuggestProductTags(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.suggestProductTags({
      userId: req.user.id,
      name: req.body.name,
      category: req.body.category || '',
      description: req.body.description || '',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const liveScriptValidators = [
  body('product_name').notEmpty().withMessage('Nazwa produktu jest wymagana').isLength({ max: 200 }),
  body('audience').optional().isLength({ max: 200 }),
  body('angle').optional().isLength({ max: 200 }),
  body('duration_seconds').optional().isInt({ min: 10, max: 300 }).withMessage('Długość musi mieścić się w zakresie 10–300 sekund'),
]

async function postLiveScript(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.generateLiveScript({
      userId: req.user.id,
      productName: req.body.product_name,
      audience: req.body.audience || '',
      angle: req.body.angle || '',
      durationSeconds: req.body.duration_seconds || 45,
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const repairHelperValidators = [
  body('area').optional().isLength({ max: 100 }),
  body('symptoms').notEmpty().withMessage('Opis problemu jest wymagany').isLength({ max: 4000 }),
  body('code_snippet').optional().isLength({ max: 12000 }),
]

async function postRepairHelper(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.repairHelper({
      userId: req.user.id,
      area: req.body.area || '',
      symptoms: req.body.symptoms,
      codeSnippet: req.body.code_snippet || '',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const storeDescriptionValidators = [
  body('store_name').notEmpty().withMessage('Nazwa sklepu jest wymagana').isLength({ max: 200 }),
  body('category').optional().isLength({ max: 100 }),
  body('tone').optional().isIn(['profesjonalny', 'przyjazny', 'luksusowy', 'casualowy']).withMessage('Nieprawidłowy ton'),
]

async function postStoreDescription(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.generateStoreDescription({
      userId: req.user.id,
      storeName: req.body.store_name,
      category: req.body.category || '',
      tone: req.body.tone || 'profesjonalny',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const generateStoreValidators = [
  body('niche').notEmpty().withMessage('Nisza sklepu jest wymagana').isLength({ max: 200 }),
  body('target_audience').optional().isLength({ max: 200 }),
  body('style').optional().isIn(['nowoczesny', 'elegancki', 'minimalistyczny', 'kolorowy', 'profesjonalny']).withMessage('Nieprawidłowy styl'),
]

async function postGenerateStore(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.generateStore({
      userId: req.user.id,
      niche: req.body.niche,
      targetAudience: req.body.target_audience || '',
      style: req.body.style || 'nowoczesny',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const marketingPackValidators = [
  body('product_name').notEmpty().withMessage('Nazwa produktu jest wymagana').isLength({ max: 200 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Cena musi być liczbą nieujemną'),
  body('audience').optional().isLength({ max: 200 }),
  body('platform').optional().isLength({ max: 50 }),
]

async function postMarketingPack(req, res, next) {
  if (validationErrors(req, res)) return
  try {
    const result = await AiService.generateMarketingPack({
      userId: req.user.id,
      productName: req.body.product_name,
      price: req.body.price || null,
      audience: req.body.audience || '',
      platform: req.body.platform || 'general',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  chatValidators,
  postChat,
  listConversationsValidators,
  listConversations,
  getConversationValidators,
  getConversation,
  deleteConversation,
  productDescriptionValidators,
  postProductDescription,
  shortDescriptionValidators,
  postShortDescription,
  ctaValidators,
  postGenerateCta,
  seoValidators,
  postGenerateSeo,
  socialPostValidators,
  postSocialPost,
  supportChatValidators,
  postSupportChat,
  rewriteSupplierDescriptionValidators,
  postRewriteSupplierDescription,
  suggestProductTagsValidators,
  postSuggestProductTags,
  liveScriptValidators,
  postLiveScript,
  repairHelperValidators,
  postRepairHelper,
  storeDescriptionValidators,
  postStoreDescription,
  generateStoreValidators,
  postGenerateStore,
  marketingPackValidators,
  postMarketingPack,
}
