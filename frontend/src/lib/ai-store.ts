import { calculateStorePrice, getGlobalProducts } from '@/lib/global-products'

export type AiStoreFaqItem = {
  q: string
  a: string
}

export type AiStorePolicy = {
  shipping: string
  returns: string
}

export type AiStoreColors = {
  primary: string
  secondary: string
  background: string
}

export type AiStoreProduct = {
  id: string
  name: string
  readonly basePrice: number
  storePrice: number
  image: string
  category: string
  supplierName: string
  supplierShipping: string
}

export type AiStore = {
  slug: string
  storeName: string
  category: string
  audience: string
  style: string
  marginPercent: number
  autoImportProducts: boolean
  brandName: string
  headline: string
  subheadline: string
  colors: AiStoreColors
  faq: AiStoreFaqItem[]
  policy: AiStorePolicy
  createdAt: string
  products: AiStoreProduct[]
}

const AI_STORES_KEY = 'qm_ai_stores'
const CURRENT_AI_STORE_KEY = 'qm_ai_current_store'

const isBrowser = () => typeof window !== 'undefined'

const normalizeProduct = (product: Partial<AiStoreProduct>, marginPercent: number): AiStoreProduct | null => {
  const feedProduct = getGlobalProducts().find((item) => item.id === product.id)
  const basePrice = feedProduct?.basePrice ?? Number(product.basePrice)

  if (!Number.isFinite(basePrice)) {
    return null
  }

  return {
    id: String(feedProduct?.id ?? product.id ?? ''),
    name: String(feedProduct?.name ?? product.name ?? ''),
    basePrice,
    storePrice: calculateStorePrice(basePrice, marginPercent),
    image: String(feedProduct?.image ?? product.image ?? ''),
    category: String(feedProduct?.category ?? product.category ?? ''),
    supplierName: String(feedProduct?.supplierName ?? product.supplierName ?? ''),
    supplierShipping: String(feedProduct?.supplierShipping ?? product.supplierShipping ?? ''),
  }
}

const normalizeStore = (store: Partial<AiStore>): AiStore | null => {
  if (!store || typeof store !== 'object') {
    return null
  }

  const slug = String(store.slug ?? '').trim()
  if (!slug) {
    return null
  }

  const marginPercent = Number.isFinite(store.marginPercent) ? Number(store.marginPercent) : 0
  const rawProducts = Array.isArray(store.products) ? store.products : []
  const products = rawProducts
    .map((product) => normalizeProduct(product as Partial<AiStoreProduct>, marginPercent))
    .filter((product): product is AiStoreProduct => Boolean(product && product.id && product.name))

  return {
    slug,
    storeName: String(store.storeName ?? ''),
    category: String(store.category ?? ''),
    audience: String(store.audience ?? ''),
    style: String(store.style ?? ''),
    marginPercent,
    autoImportProducts: Boolean(store.autoImportProducts),
    brandName: String(store.brandName ?? store.storeName ?? ''),
    headline: String(store.headline ?? ''),
    subheadline: String(store.subheadline ?? ''),
    colors: {
      primary: String(store.colors?.primary ?? '#7c3aed'),
      secondary: String(store.colors?.secondary ?? '#00d4ff'),
      background: String(store.colors?.background ?? '#070b1a'),
    },
    faq: Array.isArray(store.faq)
      ? store.faq
          .map((item) => ({ q: String(item?.q ?? ''), a: String(item?.a ?? '') }))
          .filter((item) => item.q && item.a)
      : [],
    policy: {
      shipping: String(store.policy?.shipping ?? ''),
      returns: String(store.policy?.returns ?? ''),
    },
    createdAt: String(store.createdAt ?? new Date().toISOString()),
    products,
  }
}

export const getAiStores = (): AiStore[] => {
  if (!isBrowser()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(AI_STORES_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((store) => normalizeStore(store as Partial<AiStore>))
      .filter((store): store is AiStore => Boolean(store))
  } catch {
    return []
  }
}

export const saveAiStores = (stores: AiStore[]): void => {
  if (!isBrowser()) {
    return
  }

  try {
    const normalizedStores = stores
      .map((store) => normalizeStore(store))
      .filter((store): store is AiStore => Boolean(store))

    window.localStorage.setItem(AI_STORES_KEY, JSON.stringify(normalizedStores))
  } catch (error) {
    console.error('Failed to save AI stores:', error)
  }
}

export const saveAiStore = (store: AiStore): void => {
  if (!isBrowser()) {
    return
  }

  const normalizedStore = normalizeStore(store)
  if (!normalizedStore) {
    return
  }

  const stores = getAiStores()
  const next = [normalizedStore, ...stores.filter((item) => item.slug !== normalizedStore.slug)]
  saveAiStores(next)
}

export const getAiStoreBySlug = (slug: string): AiStore | null => {
  if (!slug) {
    return null
  }

  const stores = getAiStores()
  return stores.find((store) => store.slug === slug) || null
}

export const setCurrentAiStore = (slug: string): void => {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.setItem(CURRENT_AI_STORE_KEY, slug)
  } catch (error) {
    console.error('Failed to save current AI store slug:', error)
  }
}

export const getCurrentAiStore = (): AiStore | null => {
  if (!isBrowser()) {
    return null
  }

  let slug = ''
  try {
    slug = window.localStorage.getItem(CURRENT_AI_STORE_KEY) || ''
  } catch {
    return null
  }

  if (!slug) {
    return null
  }

  return getAiStoreBySlug(slug)
}
