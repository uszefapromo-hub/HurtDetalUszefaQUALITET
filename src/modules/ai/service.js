'use strict'

const AiModel = require('./model')
const { completeMessages, safeJsonParse, isAiEnabled, AI_MODEL, AI_PROVIDER } = require('./engine')

const CHAT_SYSTEM_PROMPT = [
  'Jesteś centralnym asystentem AI platformy Qualitet Market.',
  'Odpowiadasz po polsku, jasno, praktycznie i sprzedażowo.',
  'Pomagasz sprzedawcom, operatorom i supportowi w tworzeniu treści, obsłudze klientów oraz porządkowaniu danych produktowych.',
  'Jeśli brakuje danych, nie zmyślaj parametrów technicznych — zaznacz brak i zaproponuj bezpieczną wersję treści.',
].join(' ')

function withContext(contextType, contextId) {
  if (!contextType) return ''
  return `\nKontekst rozmowy: ${contextType}${contextId ? ` (${contextId})` : ''}.`
}

async function runGeneration({ userId, type, systemPrompt, userPrompt, temperature = 0.7, maxTokens = 700, parseJson = false }) {
  const startedAt = Date.now()
  const { content, tokensUsed, mock, model, provider } = await completeMessages(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      temperature,
      maxTokens,
      responseFormat: parseJson ? { type: 'json_object' } : null,
    }
  )

  const durationMs = Date.now() - startedAt
  await AiModel.logGeneration({ userId, type, prompt: userPrompt, result: content, tokensUsed, durationMs })

  return {
    content,
    parsed: parseJson ? safeJsonParse(content, null) : null,
    tokensUsed,
    durationMs,
    meta: {
      aiEnabled: isAiEnabled(),
      provider,
      model,
      mock,
    },
  }
}

async function chat({ userId, conversationId, userMessage, contextType, contextId }) {
  let conversation
  if (conversationId) {
    conversation = await AiModel.getConversation(conversationId, userId)
    if (!conversation) {
      const error = new Error('Rozmowa nie istnieje lub brak dostępu')
      error.status = 404
      throw error
    }
  } else {
    const title = userMessage.length > 80 ? `${userMessage.slice(0, 77)}…` : userMessage
    conversation = await AiModel.createConversation({ userId, title, contextType, contextId })
  }

  await AiModel.addMessage({ conversationId: conversation.id, role: 'user', content: userMessage })
  const history = await AiModel.listMessages(conversation.id, { limit: 20 })

  const messages = [
    { role: 'system', content: `${CHAT_SYSTEM_PROMPT}${withContext(contextType || conversation.context_type, contextId || conversation.context_id)}` },
    ...history.map((message) => ({ role: message.role, content: message.content })),
  ]

  const { content, tokensUsed, mock, model, provider } = await completeMessages(messages, {
    temperature: 0.7,
    maxTokens: 900,
  })

  const assistantMessage = await AiModel.addMessage({
    conversationId: conversation.id,
    role: 'assistant',
    content,
    tokensUsed,
  })

  await AiModel.touchConversation(conversation.id)

  return {
    conversationId: conversation.id,
    message: assistantMessage,
    meta: {
      provider,
      model,
      mock,
    },
  }
}

async function generateProductDescription({ userId, name, category = '', keywords = '', language = 'pl' }) {
  const languageLabel = language === 'pl' ? 'po polsku' : `w języku ${language}`
  const result = await runGeneration({
    userId,
    type: 'generate_product_description',
    systemPrompt: 'Jesteś ekspertem e-commerce. Tworzysz atrakcyjne opisy produktów, bez lania wody, z naciskiem na korzyści i wiarygodność.',
    userPrompt: [
      `Przygotuj sprzedażowy opis produktu ${languageLabel}.`,
      `Nazwa produktu: ${name}`,
      category ? `Kategoria: ${category}` : '',
      keywords ? `Słowa kluczowe: ${keywords}` : '',
      'Wymagania: 4-6 zdań, konkretne korzyści, naturalny styl, bez emotikonów.',
    ].filter(Boolean).join('\n'),
    temperature: 0.78,
    maxTokens: 420,
  })

  return {
    description: result.content,
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function generateShortDescription({ userId, name, description = '', category = '' }) {
  const result = await runGeneration({
    userId,
    type: 'generate_short_description',
    systemPrompt: 'Tworzysz krótkie i czytelne skróty ofert produktowych do kart katalogowych, listingu i feedów.',
    userPrompt: [
      'Skróć opis produktu do maksymalnie 240 znaków.',
      `Nazwa produktu: ${name}`,
      category ? `Kategoria: ${category}` : '',
      description ? `Opis źródłowy: ${description}` : '',
      'Zwróć jeden gotowy krótki opis bez dodatkowych komentarzy.',
    ].filter(Boolean).join('\n'),
    temperature: 0.55,
    maxTokens: 180,
  })

  return {
    shortDescription: result.content,
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function generateCta({ userId, name, audience = '', tone = 'sprzedażowy' }) {
  const result = await runGeneration({
    userId,
    type: 'generate_cta',
    systemPrompt: 'Tworzysz krótkie CTA do e-commerce. CTA ma być konkretne, naturalne i gotowe do przycisku lub sekcji hero.',
    userPrompt: [
      'Wygeneruj 3 krótkie wezwania do działania dla produktu.',
      `Produkt: ${name}`,
      audience ? `Grupa docelowa: ${audience}` : '',
      `Ton: ${tone}`,
      'Zwróć JSON: {"primary":"...","secondary":"...","remarketing":"..."}',
    ].filter(Boolean).join('\n'),
    temperature: 0.7,
    maxTokens: 200,
    parseJson: true,
  })

  const parsed = result.parsed || {}
  return {
    primary: parsed.primary || result.content,
    secondary: parsed.secondary || '',
    remarketing: parsed.remarketing || '',
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function generateSeoTitle({ userId, name, category = '', description = '' }) {
  const result = await runGeneration({
    userId,
    type: 'generate_seo_title',
    systemPrompt: 'Jesteś specjalistą SEO dla marketplace. Tworzysz tytuły i meta opisy, które są naturalne, klikalne i zgodne z intencją zakupową.',
    userPrompt: [
      'Przygotuj pakiet SEO dla produktu.',
      `Nazwa produktu: ${name}`,
      category ? `Kategoria: ${category}` : '',
      description ? `Opis źródłowy: ${description}` : '',
      'Zwróć JSON: {"seo_title":"...","meta_description":"...","keywords":["...","..."]}',
    ].filter(Boolean).join('\n'),
    temperature: 0.62,
    maxTokens: 260,
    parseJson: true,
  })

  const parsed = result.parsed || {}
  return {
    seoTitle: parsed.seo_title || name,
    metaDescription: parsed.meta_description || '',
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function generateSocialPost({ userId, productName, audience = '', platform = 'instagram', tone = 'dynamiczny', price = null }) {
  const result = await runGeneration({
    userId,
    type: 'generate_social_post',
    systemPrompt: 'Tworzysz treści marketingowe dla social media marketplace: hook, post, caption i hashtagi. Tekst ma brzmieć nowocześnie, ale nie infantylnie.',
    userPrompt: [
      'Przygotuj gotowy post promocyjny.',
      `Produkt: ${productName}`,
      price ? `Cena: ${price} zł` : '',
      audience ? `Odbiorcy: ${audience}` : '',
      `Platforma: ${platform}`,
      `Ton: ${tone}`,
      'Zwróć JSON: {"hook":"...","post":"...","caption":"...","hashtags":["...","..."]}',
    ].filter(Boolean).join('\n'),
    temperature: 0.82,
    maxTokens: 360,
    parseJson: true,
  })

  const parsed = result.parsed || {}
  return {
    hook: parsed.hook || '',
    post: parsed.post || result.content,
    caption: parsed.caption || '',
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function supportChat({ userId, customerMessage, orderStatus = '', context = '', tone = 'empatyczny' }) {
  const result = await runGeneration({
    userId,
    type: 'support_chat',
    systemPrompt: 'Jesteś konsultantem obsługi klienta marketplace. Odpowiedzi mają być uprzejme, rzeczowe, bez obiecywania rzeczy których system nie potwierdził.',
    userPrompt: [
      'Przygotuj odpowiedź dla klienta.',
      `Wiadomość klienta: ${customerMessage}`,
      orderStatus ? `Status zamówienia: ${orderStatus}` : '',
      context ? `Dodatkowy kontekst: ${context}` : '',
      `Ton: ${tone}`,
      'Zwróć JSON: {"reply":"...","recommended_status":"...","faq_hint":"..."}',
    ].filter(Boolean).join('\n'),
    temperature: 0.55,
    maxTokens: 260,
    parseJson: true,
  })

  const parsed = result.parsed || {}
  return {
    reply: parsed.reply || result.content,
    recommendedStatus: parsed.recommended_status || '',
    faqHint: parsed.faq_hint || '',
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function rewriteSupplierDescription({ userId, supplierName = '', name = '', rawDescription = '', category = '' }) {
  const result = await runGeneration({
    userId,
    type: 'rewrite_supplier_description',
    systemPrompt: 'Czyścisz surowe opisy z hurtowni. Usuwasz chaos, powtórzenia, HTML-owe śmieci i tworzysz z nich gotową treść sprzedażową po polsku.',
    userPrompt: [
      'Przepisz surowy opis dostawcy na gotową ofertę sprzedażową.',
      supplierName ? `Hurtownia: ${supplierName}` : '',
      name ? `Produkt: ${name}` : '',
      category ? `Kategoria: ${category}` : '',
      `Surowy opis: ${rawDescription}`,
      'Zwróć JSON: {"clean_description":"...","bullet_points":["...","..."],"short_summary":"..."}',
    ].filter(Boolean).join('\n'),
    temperature: 0.68,
    maxTokens: 420,
    parseJson: true,
  })

  const parsed = result.parsed || {}
  return {
    cleanDescription: parsed.clean_description || result.content,
    bulletPoints: Array.isArray(parsed.bullet_points) ? parsed.bullet_points : [],
    shortSummary: parsed.short_summary || '',
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function suggestProductTags({ userId, name, category = '', description = '' }) {
  const result = await runGeneration({
    userId,
    type: 'suggest_product_tags',
    systemPrompt: 'Tworzysz praktyczne tagi produktowe dla marketplace, filtrowania i kampanii. Unikaj ogólników.',
    userPrompt: [
      'Zaproponuj 12 tagów dla produktu.',
      `Nazwa: ${name}`,
      category ? `Kategoria: ${category}` : '',
      description ? `Opis: ${description}` : '',
      'Zwróć JSON: {"tags":["...","..."]}',
    ].filter(Boolean).join('\n'),
    temperature: 0.58,
    maxTokens: 180,
    parseJson: true,
  })

  const parsed = result.parsed || {}
  return {
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function generateLiveScript({ userId, productName, audience = '', angle = '', durationSeconds = 45 }) {
  const result = await runGeneration({
    userId,
    type: 'generate_live_script',
    systemPrompt: 'Piszesz krótkie skrypty sprzedażowe do live commerce. Struktura ma być dynamiczna: hook, demo, korzyści, CTA.',
    userPrompt: [
      'Przygotuj skrypt live sprzedażowego.',
      `Produkt: ${productName}`,
      audience ? `Odbiorcy: ${audience}` : '',
      angle ? `Główny kąt sprzedażowy: ${angle}` : '',
      `Docelowa długość: około ${durationSeconds} sekund.`,
      'Zwróć JSON: {"hook":"...","script":"...","segments":["...","..."]}',
    ].filter(Boolean).join('\n'),
    temperature: 0.8,
    maxTokens: 420,
    parseJson: true,
  })

  const parsed = result.parsed || {}
  return {
    hook: parsed.hook || '',
    script: parsed.script || result.content,
    segments: Array.isArray(parsed.segments) ? parsed.segments : [],
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function repairHelper({ userId, area = '', symptoms = '', codeSnippet = '' }) {
  const result = await runGeneration({
    userId,
    type: 'repair_helper',
    systemPrompt: 'Jesteś technicznym operatorem naprawczym projektu marketplace. Diagnozujesz problemy, priorytetyzujesz i proponujesz najkrótszą ścieżkę naprawy.',
    userPrompt: [
      'Przeanalizuj problem techniczny i zaproponuj naprawę.',
      area ? `Obszar: ${area}` : '',
      symptoms ? `Objawy: ${symptoms}` : '',
      codeSnippet ? `Fragment kodu: ${codeSnippet}` : '',
      'Zwróć JSON: {"diagnosis":"...","priority":"niski|średni|wysoki","fixes":["...","..."],"warning":"..."}',
    ].filter(Boolean).join('\n'),
    temperature: 0.35,
    maxTokens: 340,
    parseJson: true,
  })

  const parsed = result.parsed || {}
  return {
    diagnosis: parsed.diagnosis || result.content,
    priority: parsed.priority || 'średni',
    fixes: Array.isArray(parsed.fixes) ? parsed.fixes : [],
    warning: parsed.warning || '',
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function generateStoreDescription({ userId, storeName, category = '', tone = 'profesjonalny' }) {
  const result = await runGeneration({
    userId,
    type: 'store_description',
    systemPrompt: 'Tworzysz opisy sklepów i marek dla platformy marketplace. Tekst ma budować zaufanie i pozycjonować ofertę.',
    userPrompt: [
      'Przygotuj opis sklepu internetowego po polsku.',
      `Nazwa sklepu: ${storeName}`,
      category ? `Branża: ${category}` : '',
      `Ton komunikacji: ${tone}`,
      'Opis ma mieć 2-4 zdania.',
    ].filter(Boolean).join('\n'),
    temperature: 0.72,
    maxTokens: 240,
  })

  return {
    description: result.content,
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function generateStore({ userId, niche, targetAudience = '', style = 'nowoczesny' }) {
  const result = await runGeneration({
    userId,
    type: 'generate_store',
    systemPrompt: 'Tworzysz koncepty sklepów internetowych i zwracasz poprawny JSON gotowy do użycia w panelu operatora.',
    userPrompt: [
      `Wygeneruj kompletny koncept sklepu dla niszy: ${niche}.`,
      targetAudience ? `Grupa docelowa: ${targetAudience}` : '',
      `Styl: ${style}`,
      'Zwróć JSON: {"store_name":"...","slogan":"...","description":"...","categories":["..."],"product_ideas":[{"name":"...","description":"...","price_range":"..."}]}'
    ].filter(Boolean).join('\n'),
    temperature: 0.88,
    maxTokens: 800,
    parseJson: true,
  })

  return {
    store: result.parsed || { raw: result.content },
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function generateMarketingPack({ userId, productName, price = null, audience = '', platform = 'general' }) {
  const result = await runGeneration({
    userId,
    type: 'marketing_pack',
    systemPrompt: 'Tworzysz gotowe pakiety marketingowe dla marketplace i sklepów online. Zwracasz uporządkowany JSON.',
    userPrompt: [
      'Przygotuj pakiet marketingowy dla produktu.',
      `Produkt: ${productName}`,
      price ? `Cena: ${price} zł` : '',
      audience ? `Grupa odbiorców: ${audience}` : '',
      `Platforma: ${platform}`,
      'Zwróć JSON: {"social_post":"...","email_subject":"...","ad_headline":"...","ad_copy":"...","hashtags":["...","..."]}',
    ].filter(Boolean).join('\n'),
    temperature: 0.84,
    maxTokens: 520,
    parseJson: true,
  })

  return {
    marketing: result.parsed || { raw: result.content },
    ...result.meta,
    tokensUsed: result.tokensUsed,
  }
}

async function normalizeSupplierProducts(userId, products, { supplierName = '', enabled = false } = {}) {
  if (!enabled || !Array.isArray(products) || products.length === 0) {
    return products
  }

  const limit = Math.min(parseInt(process.env.AI_SUPPLIER_ENRICH_LIMIT || '5', 10), products.length)
  const normalized = [...products]

  for (let index = 0; index < limit; index += 1) {
    const item = normalized[index]
    if (!item?.description) continue
    try {
      const enhanced = await rewriteSupplierDescription({
        userId,
        supplierName,
        name: item.name || '',
        rawDescription: item.description,
        category: item.category || '',
      })
      normalized[index] = {
        ...item,
        description: enhanced.cleanDescription || item.description,
      }
    } catch (_error) {
      normalized[index] = item
    }
  }

  return normalized
}

module.exports = {
  AI_MODEL,
  AI_PROVIDER,
  chat,
  generateProductDescription,
  generateShortDescription,
  generateCta,
  generateSeoTitle,
  generateSocialPost,
  supportChat,
  rewriteSupplierDescription,
  suggestProductTags,
  generateLiveScript,
  repairHelper,
  generateStoreDescription,
  generateStore,
  generateMarketingPack,
  normalizeSupplierProducts,
}
