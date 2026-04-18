const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token') || localStorage.getItem('qm_token') || localStorage.getItem('qm_auth_token')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers || {}) as Record<string, string>),
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: object) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : ''
      return request(`/products${qs}`)
    },
    get: (id: string) => request(`/products/${id}`),
    trending: () => request('/products?sort=trending&limit=20'),
  },
  stores: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params).toString()}` : ''
      return request(`/stores${qs}`)
    },
    get: (id: string) => request(`/stores/${id}`),
  },
  orders: {
    list: () => request('/orders'),
    create: (data: object) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  },
  cart: {
    get: () => request('/cart'),
    add: (productId: string, quantity: number) => request('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    update: (itemId: string, quantity: number) => request(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    remove: (itemId: string) => request(`/cart/items/${itemId}`, { method: 'DELETE' }),
  },
  seller: {
    dashboard: () => request('/my/dashboard'),
    products: () => request('/my/products'),
    orders: () => request('/my/orders'),
  },
  affiliate: {
    stats: () => request('/affiliate/stats'),
    links: () => request('/affiliate/links'),
    createLink: (productId: string) => request('/affiliate/links', { method: 'POST', body: JSON.stringify({ productId }) }),
  },
  ai: {
    chat: (payload: Record<string, unknown>) => request('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
    conversations: () => request('/ai/conversations'),
    conversation: (id: string) => request(`/ai/conversations/${id}`),
    generateProductDescription: (data: Record<string, unknown>) => request('/ai/product-description', { method: 'POST', body: JSON.stringify(data) }),
    generateShortDescription: (data: Record<string, unknown>) => request('/ai/generate-short-description', { method: 'POST', body: JSON.stringify(data) }),
    generateCta: (data: Record<string, unknown>) => request('/ai/generate-cta', { method: 'POST', body: JSON.stringify(data) }),
    generateSeoTitle: (data: Record<string, unknown>) => request('/ai/generate-seo-title', { method: 'POST', body: JSON.stringify(data) }),
    generateSocialPost: (data: Record<string, unknown>) => request('/ai/generate-social-post', { method: 'POST', body: JSON.stringify(data) }),
    supportChat: (data: Record<string, unknown>) => request('/ai/support-chat', { method: 'POST', body: JSON.stringify(data) }),
    rewriteSupplierDescription: (data: Record<string, unknown>) => request('/ai/rewrite-supplier-description', { method: 'POST', body: JSON.stringify(data) }),
    suggestProductTags: (data: Record<string, unknown>) => request('/ai/suggest-product-tags', { method: 'POST', body: JSON.stringify(data) }),
    generateLiveScript: (data: Record<string, unknown>) => request('/ai/live-script', { method: 'POST', body: JSON.stringify(data) }),
    repairHelper: (data: Record<string, unknown>) => request('/ai/repair-helper', { method: 'POST', body: JSON.stringify(data) }),
    generateStoreDescription: (data: Record<string, unknown>) => request('/ai/store-description', { method: 'POST', body: JSON.stringify(data) }),
    generateStore: (data: Record<string, unknown>) => request('/ai/generate-store', { method: 'POST', body: JSON.stringify(data) }),
    generateMarketingPack: (data: Record<string, unknown>) => request('/ai/marketing-pack', { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    analytics: () => request('/admin/analytics'),
    users: () => request('/admin/users'),
    stores: () => request('/admin/stores'),
  },
}
