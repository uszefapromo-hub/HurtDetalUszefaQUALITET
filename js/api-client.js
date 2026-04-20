/**
 * Qualitet Platform – API Client (backward-compat shim)
 * ========================================================
 * This file is kept for backward compatibility.
 * The canonical API client is js/api.js (window.QMApi).
 *
 * window.QualitetAPI is now a thin adapter that maps to window.QMApi so that
 * any existing code referencing QualitetAPI continues to work without changes.
 *
 * Load js/api.js BEFORE this file.
 */
(function (global) {
  'use strict';

  // Wait for QMApi to be available (loaded by js/api.js).
  function buildShim() {
    const api = global.QMApi;
    if (!api) {
      return null;
    }

    // ─── auth shim ───────────────────────────────────────────────────────────
    const auth = {
      register: (email, password, name, role) => api.Auth.register(email, password, name, role),
      login:    (email, password)             => api.Auth.login(email, password),
      logout:   ()                            => api.Auth.logout(),
      me:       ()                            => api.Auth.me(),
      updateProfile: (data)                   => api.Auth.updateProfile(data),
      changePassword: (cur, next)             => api.Auth.changePassword(cur, next),
      getToken:  ()                           => { try { return localStorage.getItem('qm_token'); } catch { return null; } },
      getUser:   ()                           => api.Auth.currentUser(),
      isLoggedIn: ()                          => api.Auth.isLoggedIn(),
    };

    // ─── stores shim ─────────────────────────────────────────────────────────
    const stores = {
      list:   (params)     => api.Stores.list(params),
      get:    (id)         => api.Stores.get(id),
      create: (data)       => api.Stores.create(data),
      update: (id, data)   => api.Stores.update(id, data),
      delete: (id)         => api.Stores.remove(id),
    };

    // ─── products shim ───────────────────────────────────────────────────────
    const products = {
      list:   (params)     => api.Products.list(params),
      get:    (id)         => api.Products.get(id),
      create: (data)       => api.Products.create(data),
      update: (id, data)   => api.Products.update(id, data),
      delete: (id)         => api.Products.remove(id),
    };

    // ─── shopProducts shim ───────────────────────────────────────────────────
    const shopProducts = {
      list:   (storeId, params)               => api.ShopProducts.list(storeId, params),
      add:    (storeId, productId, overrides) => api.ShopProducts.add({ store_id: storeId, product_id: productId, ...overrides }),
      update: (id, data)                      => api.ShopProducts.update(id, data),
      remove: (id)                            => api.ShopProducts.remove(id),
    };

    // ─── orders shim ─────────────────────────────────────────────────────────
    const orders = {
      list:         (params)                                    => api.Orders.list(params),
      get:          (id)                                        => api.Orders.get(id),
      create:       (storeId, items, shippingAddress, notes)    =>
        api.Orders.create({ store_id: storeId, items, shipping_address: shippingAddress, notes }),
      updateStatus: (id, status)                                => api.Orders.updateStatus(id, status),
    };

    // ─── cart shim ───────────────────────────────────────────────────────────
    const cart = {
      get:        (storeId)                 => api.Cart.get(storeId),
      addItem:    (storeId, productId, qty) => api.Cart.addItem(storeId, productId, qty),
      updateItem: (storeId, productId, qty) => api.Cart.setItem(storeId, productId, qty),
      removeItem: (storeId, productId)      => api.Cart.removeItem(storeId, productId),
      clear:      (storeId)                 => api.Cart.clear(storeId),
    };

    // ─── subscriptions shim ──────────────────────────────────────────────────
    const subscriptions = {
      list:   ()                     => api.Subscriptions.list(),
      active: ()                     => api.Subscriptions.active(),
      create: (plan, ref, days)      => api.Subscriptions.create(plan, { payment_reference: ref, duration_days: days }),
      cancel: (id)                   => api.Subscriptions.cancel(id),
    };

    // ─── suppliers shim ──────────────────────────────────────────────────────
    const suppliers = {
      list:   ()                          => api.Suppliers.list(),
      get:    (id)                        => api.Suppliers.get(id),
      create: (data)                      => api.Suppliers.create(data),
      update: (id, data)                  => api.Suppliers.update(id, data),
      import: (id, file, storeId)         => api.Suppliers.importFile(id, storeId, file),
      sync:   (id, storeId)               => api.Suppliers.sync(id, storeId),
    };

    // ─── categories shim ─────────────────────────────────────────────────────
    const categories = {
      list: () => api.Categories.list(),
      get:  (id) => api.Categories.get(id),
    };

    // ─── payments shim ───────────────────────────────────────────────────────
    const payments = {
      list: (params) => api.Payments.list(params),
      get:  (id)     => api.Payments.get(id),
    };

    // ─── admin shim ──────────────────────────────────────────────────────────
    const admin = {
      stats:             ()          => api.Admin.stats(),
      listUsers:         (params)    => api.Admin.users(params),
      updateUser:        (id, data)  => api.Admin.updateUser(id, data),
      listOrders:        (params)    => api.Admin.orders(params),
      listStores:        (params)    => api.Admin.stores(params),
      updateStore:       (id, data)  => api.Admin.updateStoreStatus(id, data.status || data),
      listSubscriptions: (params)    => api.Admin.subscriptions(params),
      listCatalogue:     (params)    => api.Admin.products(params),
      auditLogs:         (params)    => api.Admin.auditLogs(params),
    };

    return { auth, stores, products, shopProducts, orders, cart, subscriptions, suppliers, categories, payments, admin };
  }

  // Expose as QualitetAPI; if QMApi isn't loaded yet, defer until DOMContentLoaded.
  function expose() {
    const shim = buildShim();
    if (shim) {
      global.QualitetAPI = shim;
    }
  }

  expose();
  if (!global.QualitetAPI) {
    if (typeof document !== 'undefined') {
      document.addEventListener('DOMContentLoaded', expose);
    }
  }

}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this));
