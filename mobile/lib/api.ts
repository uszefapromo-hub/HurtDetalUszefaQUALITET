import * as SecureStore from 'expo-secure-store'

const API_BASE: string =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? ''

const RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000
const TOKEN_STORAGE_KEY = 'qm_auth_token'
const USERS_STORAGE_KEY = 'qm_users'
const USER_STORAGE_KEY = 'qm_user'

let authToken: string | null = null

async function persistToken(token: string | null): Promise<void> {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token)
    } else {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY)
    }
  } catch {
    // ignore storage failures
  }
}

export async function loadPersistedToken(): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY)
    if (stored) authToken = stored
    return stored
  } catch {
    return null
  }
}

export function setAuthToken(token: string | null) {
  authToken = token
  persistToken(token)
}

export function getApiBase(): string {
  return API_BASE
}

function getBrowserStorage(): Storage | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      return globalThis.localStorage
    }
  } catch {
    return null
  }
  return null
}

async function getStoredValue(key: string): Promise<string | null> {
  const browserStorage = getBrowserStorage()
  if (browserStorage) {
    return browserStorage.getItem(key)
  }
  try {
    return await SecureStore.getItemAsync(key)
  } catch {
    return null
  }
}

async function setStoredValue(key: string, value: string): Promise<void> {
  const browserStorage = getBrowserStorage()
  if (browserStorage) {
    browserStorage.setItem(key, value)
    return
  }
  try {
    await SecureStore.setItemAsync(key, value)
  } catch {
    // ignore storage failures
  }
}

async function removeStoredValue(key: string): Promise<void> {
  const browserStorage = getBrowserStorage()
  if (browserStorage) {
    browserStorage.removeItem(key)
    return
  }
  try {
    await SecureStore.deleteItemAsync(key)
  } catch {
    // ignore storage failures
  }
}

function normalizeEmail(value: string): string {
  return String(value || '').trim().toLowerCase()
}

function parseUsers(value: string | null): Array<{ email: string; name: string; password: string }> {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function getLocalUsers() {
  const raw = await getStoredValue(USERS_STORAGE_KEY)
  return parseUsers(raw)
}

async function setLocalUsers(users: Array<{ email: string; name: string; password: string }>) {
  await setStoredValue(USERS_STORAGE_KEY, JSON.stringify(users))
}

async function setCurrentUser(user: { email: string; name: string }) {
  await setStoredValue(USER_STORAGE_KEY, JSON.stringify(user))
}

async function getCurrentUser() {
  const raw = await getStoredValue(USER_STORAGE_KEY)
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function request<T>(path: string, options?: RequestInit, attempt = 1): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...((options?.headers || {}) as Record<string, string>),
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(err.error || 'Request failed')
    }
    return res.json()
  } catch (error) {
    const isNetworkError = error instanceof TypeError && error.message.toLowerCase().includes('network')
    if (isNetworkError && attempt < RETRY_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS * attempt)
      return request<T>(path, options, attempt + 1)
    }
    if (isNetworkError) {
      throw new Error('Brak połączenia z siecią. Sprawdź internet i spróbuj ponownie.')
    }
    throw error
  }
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const cleanEmail = normalizeEmail(email)
      const cleanPassword = String(password || '')
      if (!cleanEmail || !cleanPassword) {
        throw new Error('Podaj adres e-mail i hasło.')
      }

      const users = await getLocalUsers()
      const match = users.find((user) => normalizeEmail(user.email) === cleanEmail && String(user.password) === cleanPassword)
      if (!match) {
        throw new Error('Nieprawidłowy email lub hasło.')
      }

      const currentUser = { email: cleanEmail, name: String(match.name || '') }
      await setCurrentUser(currentUser)
      setAuthToken(null)
      return { token: null, user: currentUser }
    },
    register: async (data: { email?: string; password?: string; name?: string }) => {
      const cleanEmail = normalizeEmail(data?.email || '')
      const cleanPassword = String(data?.password || '')
      const cleanName = String(data?.name || '').trim()
      if (!cleanEmail || !cleanPassword || !cleanName) {
        throw new Error('Uzupełnij wszystkie pola.')
      }

      const users = await getLocalUsers()
      const exists = users.some((user) => normalizeEmail(user.email) === cleanEmail)
      if (exists) {
        throw new Error('Email już istnieje.')
      }

      users.push({
        email: cleanEmail,
        name: cleanName,
        password: cleanPassword,
      })
      await setLocalUsers(users)

      const currentUser = { email: cleanEmail, name: cleanName }
      await setCurrentUser(currentUser)
      setAuthToken(null)
      return { token: null, user: currentUser }
    },
    refresh: async () => {
      const user = await getCurrentUser()
      return { token: null, user }
    },
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : ''
      return request(`/products${qs}`)
    },
    trending: () => request('/products?sort=trending&limit=20'),
  },
  stores: {
    list: () => request('/stores'),
    get: (id: string) => request(`/stores/${id}`),
  },
  affiliate: {
    stats: () => request('/affiliate/stats'),
    links: () => request('/affiliate/links'),
  },
  ai: {
    chat: (payload: { message: string; conversation_id?: string; context_type?: string; context_id?: string }) => request('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
    generateProductDescription: (data: { name: string; category?: string; keywords?: string; language?: string }) => request('/ai/product-description', { method: 'POST', body: JSON.stringify(data) }),
    supportChat: (data: { customer_message: string; order_status?: string; context?: string; tone?: string }) => request('/ai/support-chat', { method: 'POST', body: JSON.stringify(data) }),
    repairHelper: (data: { area?: string; symptoms: string; code_snippet?: string }) => request('/ai/repair-helper', { method: 'POST', body: JSON.stringify(data) }),
  },
  seller: {
    dashboard: () => request('/my/dashboard'),
    orders: () => request('/my/orders'),
  },
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} PLN`
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
