const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Nike Air Max",
    price: 299,
    image: "https://via.placeholder.com/300",
  },
  {
    id: "2",
    name: "Bluza Streetwear",
    price: 149,
    image: "https://via.placeholder.com/300",
  }
]

const MOCK_CART = []

export const api = {
  products: {
    list: async () => MOCK_PRODUCTS,
    get: async (id) => MOCK_PRODUCTS.find(p => p.id === id),
    trending: async () => MOCK_PRODUCTS,
  },

  cart: {
    get: async () => MOCK_CART,
    add: async (productId, quantity) => {
      const product = MOCK_PRODUCTS.find(p => p.id === productId)
      if (!product) return

      MOCK_CART.push({ ...product, quantity })
      return true
    },
    update: async () => true,
    remove: async () => true,
  },

  orders: {
    create: async (data) => {
      const storageKey = "qm_orders"

      let existingOrders = []
      try {
        existingOrders = JSON.parse(localStorage.getItem(storageKey) || "[]")
      } catch {
        existingOrders = []
      }

      const order = {
        id: `QM-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...data,
      }

      existingOrders.unshift(order)
      localStorage.setItem(storageKey, JSON.stringify(existingOrders))

      console.log("ZAMÓWIENIE:", order)
      return order
    },

    list: async () => {
      const storageKey = "qm_orders"

      try {
        return JSON.parse(localStorage.getItem(storageKey) || "[]")
      } catch {
        return []
      }
    },
  },

  stores: {
    list: async () => [],
    get: async () => null,
  },

  seller: {
    dashboard: async () => ({ stats: {} }),
    products: async () => MOCK_PRODUCTS,
    orders: async () => [],
  },

  auth: {
    login: async () => ({ token: "demo" }),
    register: async () => ({ success: true }),
  }
}
