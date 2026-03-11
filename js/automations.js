/* automations.js – automated background tasks for HurtDetal Uszefa QUALITET
 * Depends on window.Platform (js/platform.js).
 */
(function (global) {
  'use strict';

  var _syncCallCount = 0;

  var Automations = {

    /**
     * Forward a single paid order to its supplier(s).
     * @param {string} orderId
     * @returns {boolean}
     */
    forwardOrderToSupplier: function (orderId) {
      try {
        if (!global.Platform) return false;

        var order = global.Platform.getOrderById(orderId);
        if (!order) return false;

        var products  = global.Platform.getProducts();
        var suppliers = global.Platform.getSuppliers();

        // Collect unique suppliers referenced by order items
        var items = Array.isArray(order.items) ? order.items : [];
        var supplierIds = [];
        items.forEach(function (item) {
          var product = products.find(function (p) { return p.id === item.productId; });
          if (product && product.supplierId && supplierIds.indexOf(product.supplierId) === -1) {
            supplierIds.push(product.supplierId);
          }
        });

        var supplierNames = supplierIds.map(function (sid) {
          var s = suppliers.find(function (s) { return s.id === sid; });
          return s ? (s.name || sid) : sid;
        });

        var label = supplierNames.length ? supplierNames.join(', ') : 'hurtownię';
        var orderNum = order.orderNumber || order.id;
        global.Platform.addNotification(
          'Zamówienie ' + orderNum + ' przekazane do hurtowni ' + label,
          'info'
        );

        // Advance status from 'paid' → 'processing'
        if (order.status === 'paid') {
          global.Platform.updateOrderStatus(orderId, 'processing');
        }

        return true;
      } catch (e) {
        console.warn('[Automations] forwardOrderToSupplier error:', e);
        return false;
      }
    },

    /**
     * Sync prices from a specific supplier (simulated ±2-5% variation).
     * @param {string} supplierId
     * @returns {number} count of updated products
     */
    syncPricesFromSupplier: function (supplierId) {
      try {
        if (!global.Platform) return 0;

        var products  = global.Platform.getProducts();
        var suppliers = global.Platform.getSuppliers();
        var supplier  = suppliers.find(function (s) { return s.id === supplierId; });
        var supplierName = supplier ? (supplier.name || supplierId) : supplierId;

        var count = 0;
        products.forEach(function (product) {
          if (product.supplierId !== supplierId) return;
          var sign = Math.random() < 0.5 ? -1 : 1;
          var variation = 1 + sign * (0.02 + Math.random() * 0.03); // ±2-5%
          var newPrice  = Math.round(product.price * variation * 100) / 100;
          var newCost   = product.costPrice
            ? Math.round(product.costPrice * variation * 100) / 100
            : product.costPrice;
          global.Platform.saveProduct(Object.assign({}, product, {
            price:     newPrice,
            costPrice: newCost,
          }));
          count++;
        });

        if (count > 0) {
          global.Platform.addNotification(
            'Zaktualizowano ceny ' + count + ' produktów z hurtowni ' + supplierName,
            'info'
          );
        }

        return count;
      } catch (e) {
        console.warn('[Automations] syncPricesFromSupplier error:', e);
        return 0;
      }
    },

    /**
     * Simulate stock level sync across all products.
     * @returns {{ updated: number, outOfStock: number }}
     */
    syncStockLevels: function () {
      try {
        if (!global.Platform) return { updated: 0, outOfStock: 0 };

        var products = global.Platform.getProducts();
        var updated = 0;
        var outOfStock = 0;

        products.forEach(function (product) {
          // ~15% chance a product goes out of stock, otherwise ±10 units
          var newStock;
          if (Math.random() < 0.15) {
            newStock = 0;
          } else {
            var delta = Math.floor(Math.random() * 21) - 10; // -10 to +10
            newStock = Math.max(0, (product.stock || 0) + delta);
          }
          if (newStock !== product.stock) {
            global.Platform.saveProduct(Object.assign({}, product, { stock: newStock }));
            updated++;
            if (newStock === 0) {
              outOfStock++;
              global.Platform.addNotification(
                'Produkt "' + (product.name || product.id) + '" – brak w magazynie',
                'warning'
              );
            }
          }
        });

        return { updated: updated, outOfStock: outOfStock };
      } catch (e) {
        console.warn('[Automations] syncStockLevels error:', e);
        return { updated: 0, outOfStock: 0 };
      }
    },

    /**
     * Forward all newly paid orders to their suppliers.
     * @returns {number} count of processed orders
     */
    processNewOrders: function () {
      try {
        if (!global.Platform) return 0;

        var orders = global.Platform.getOrders();
        var paid   = orders.filter(function (o) { return o.status === 'paid'; });
        var self   = this;
        paid.forEach(function (o) { self.forwardOrderToSupplier(o.id); });
        return paid.length;
      } catch (e) {
        console.warn('[Automations] processNewOrders error:', e);
        return 0;
      }
    },

    /**
     * Add a status-based notification for an order.
     * @param {string} orderId
     * @param {string} status
     */
    sendOrderNotification: function (orderId, status) {
      try {
        if (!global.Platform) return;

        var order = global.Platform.getOrderById(orderId);
        if (!order) return;

        var num = order.orderNumber || order.id;
        var messages = {
          paid:       'Zamówienie ' + num + ' opłacone. Dziękujemy!',
          processing: 'Zamówienie ' + num + ' przekazane do realizacji',
          shipped:    'Zamówienie ' + num + ' zostało wysłane',
          delivered:  'Zamówienie ' + num + ' dostarczone pomyślnie',
          cancelled:  'Zamówienie ' + num + ' anulowane',
        };

        var msg = messages[status];
        if (msg) {
          var type = status === 'cancelled' ? 'warning' : 'info';
          global.Platform.addNotification(msg, type);
        }
      } catch (e) {
        console.warn('[Automations] sendOrderNotification error:', e);
      }
    },

    /**
     * Run all periodic sync tasks. Call this on a schedule.
     * Every 4th call also syncs stock levels.
     * @returns {{ ordersProcessed: number, stockSynced: boolean }}
     */
    runAutoSync: function () {
      _syncCallCount++;
      var ordersProcessed = this.processNewOrders();
      var stockSynced = false;

      if (_syncCallCount % 4 === 0) {
        this.syncStockLevels();
        stockSynced = true;
      }

      return { ordersProcessed: ordersProcessed, stockSynced: stockSynced };
    },

    /**
     * Initialize periodic auto-sync (every 30 seconds).
     * @returns {number|null} interval ID, or null if Platform unavailable
     */
    init: function () {
      if (!global.Platform) {
        console.warn('[Automations] Platform not available – auto-sync disabled.');
        return null;
      }
      var self = this;
      var intervalId = setInterval(function () {
        self.runAutoSync();
      }, 30000);
      return intervalId;
    },
  };

  global.Automations = Automations;

}(window));
