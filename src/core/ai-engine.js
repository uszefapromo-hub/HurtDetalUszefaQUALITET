'use strict'

const fetch = require('node-fetch')

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai-compatible'
const AI_MODEL = process.env.AI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini'
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '20000', 10)

function isAiEnabled() {
  return process.env.AI_ENABLED !== 'false'
}

function buildMockResponse(messages) {
  const lastUserMessage = [...messages].reverse().find((item) => item.role === 'user')
  const prompt = lastUserMessage ? lastUserMessage.content : 'brak treści'
  return {
    content:
      'Tryb lokalny AI jest aktywny. Oto wersja robocza odpowiedzi dla treści: ' +
      `"${prompt.slice(0, 180)}". Uzupełnij OPENAI_API_KEY, aby włączyć pełne generowanie.`,
    tokensUsed: 0,
    provider: 'mock',
    model: 'mock',
    mock: true,
  }
}

async function completeMessages(messages, options = {}) {
  const {
    temperature = 0.7,
    maxTokens = 900,
    responseFormat = null,
  } = options

  const apiKey = process.env.OPENAI_API_KEY
  if (!isAiEnabled() || !apiKey) {
    return buildMockResponse(messages)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const body = {
      model: AI_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }

    if (responseFormat) {
      body.response_format = responseFormat
    }

    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      const error = new Error(`AI provider error ${response.status}: ${errorBody}`)
      error.status = 502
      throw error
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) {
      const error = new Error('AI provider returned empty content')
      error.status = 502
      throw error
    }

    return {
      content: String(content).trim(),
      tokensUsed: data?.usage?.total_tokens || null,
      provider: AI_PROVIDER,
      model: AI_MODEL,
      mock: false,
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Przekroczono limit czasu odpowiedzi AI')
      timeoutError.status = 504
      throw timeoutError
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

function safeJsonParse(content, fallback = null) {
  try {
    return JSON.parse(content)
  } catch (_error) {
    return fallback
  }
}

module.exports = {
  AI_PROVIDER,
  AI_MODEL,
  AI_TIMEOUT_MS,
  isAiEnabled,
  completeMessages,
  safeJsonParse,
}
