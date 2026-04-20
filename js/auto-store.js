(function () {
  const DEFAULT_MARGIN = 35;
  const STORE_CACHE_KEY = 'qm_operator_store';
  const STORES_KEY = 'qm_ai_stores';
  const CURRENT_STORE_KEY = 'qm_ai_current_store';
  const AUTO_SYNC_MS = 30000;

  const state = {
    store: null,
    syncTimer: null,
    lastSyncAt: null,
  };

  function safeParse(raw, fallback) {
    try {
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }

  function asNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function firstPositiveNumber(values) {
    for (let i = 0; i < values.length; i += 1) {
      const num = asNumber(values[i]);
      if (num > 0) return num;
    }
    return 0;
  }

  function toSlug(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  function getCentralFeedProducts() {
    const merged = [];
    const fromProducts = safeParse(localStorage.getItem('products') || '[]', []);
    const fromBySupplier = safeParse(localStorage.getItem('qm_products_by_supplier_v1') || '[]', []);

    if (Array.isArray(fromProducts)) {
      merged.push(...fromProducts);
    }

    if (Array.isArray(fromBySupplier)) {
      fromBySupplier.forEach((item) => {
        if (item && Array.isArray(item.products)) {
          merged.push(...item.products);
          return;
        }
        if (item && typeof item === 'object') {
          merged.push(item);
        }
      });
    }

    if (!merged.length) {
      return [
        { id: 'demo-1', name: 'Słuchawki bezprzewodowe', category: 'elektronika', supplier: 'Katalog centralny', price: 129, stock: 100 },
        { id: 'demo-2', name: 'Lampka biurkowa LED', category: 'dom', supplier: 'Katalog centralny', price: 89, stock: 70 },
        { id: 'demo-3', name: 'Organizer podróżny', category: 'akcesoria', supplier: 'Katalog centralny', price: 59, stock: 120 },
      ];
    }

    const unique = [];
    const seen = new Set();

    merged.forEach((item, index) => {
      if (!item || typeof item !== 'object') return;
      const key = String(item.id || item.sku || item.code || item.name || `idx-${index}`);
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(item);
    });

    return unique;
  }

  function mapFeedToStoreProducts(products, marginPercent, fallbackCategory) {
    return products.slice(0, 60).map((product, index) => {
      const basePrice = firstPositiveNumber([
        product.basePrice,
        product.base_price,
        product.wholesalePrice,
        product.cost,
        product.priceNet,
        product.price_gross,
        product.selling_price,
        product.platform_price,
        product.recommended_reseller_price,
        product.supplier_price,
        product.price,
      ]);

      const storePrice = Number((basePrice * (1 + marginPercent / 100)).toFixed(2));

      return {
        id: String(product.id || product.sku || `auto-product-${Date.now()}-${index}`),
        name: product.name || product.title || `Produkt ${index + 1}`,
        image: product.image || product.image_url || product.img || product.thumbnail || product.photo || '',
        category: product.category || fallbackCategory || 'oferta',
        basePrice: Number(basePrice.toFixed(2)),
        storePrice,
        finalPrice: storePrice,
        margin: Number(marginPercent),
        supplierName: product.supplierName || product.supplier || product.sourceName || 'Katalog centralny',
        supplierShipping: product.supplierShipping || 'Standard',
        stock: asNumber(product.stock || product.quantity || 0),
        isNew: true,
      };
    });
  }

  function persistOperatorStore() {
    localStorage.setItem(
      STORE_CACHE_KEY,
      JSON.stringify({
        store: state.store,
        lastSyncAt: state.lastSyncAt,
      })
    );
  }

  function restoreOperatorStore() {
    const raw = localStorage.getItem(STORE_CACHE_KEY);
    if (!raw) return;

    const parsed = safeParse(raw, null);
    if (!parsed || typeof parsed !== 'object') return;

    state.store = parsed.store || null;
    state.lastSyncAt = parsed.lastSyncAt || null;
  }

  function upsertAiStore(store) {
    const stores = safeParse(localStorage.getItem(STORES_KEY) || '[]', []);
    const list = Array.isArray(stores) ? stores : [];
    const filtered = list.filter((item) => item && item.slug !== store.slug);
    localStorage.setItem(STORES_KEY, JSON.stringify([store].concat(filtered)));
    localStorage.setItem(CURRENT_STORE_KEY, store.slug);
  }

  function extractCategoryFromDescription(description) {
    const text = String(description || '').trim();
    if (!text) return 'oferta';
    const match = text.toLowerCase().match(/([a-ząćęłńóśźż0-9]{3,})/i);
    return match ? match[1] : 'oferta';
  }

  function createStoreFromDescription({ description, margin = DEFAULT_MARGIN }) {
    const category = extractCategoryFromDescription(description);
    const stamp = Date.now();
    const storeName = `Auto Sklep ${category.charAt(0).toUpperCase()}${category.slice(1)}`;
    const slug = `${toSlug(storeName)}-${String(stamp).slice(-5)}`;

    const store = {
      id: `store-${stamp}`,
      slug,
      storeName,
      brandName: storeName,
      headline: 'Twój sklep dropshippingowy gotowy do sprzedaży',
      subheadline: description || 'Automatyczny sklep z produktami z katalogu centralnego.',
      description: description || '',
      category,
      marginPercent: Number(margin),
      margin: Number(margin),
      createdAt: new Date().toISOString(),
      products: [],
      colors: {
        background: '#0b1220',
      },
      policy: {
        shipping: 'Wysyłka 24-72h',
        returns: 'Zwrot do 14 dni',
      },
      faq: [
        { q: 'Jak szybko realizowane są zamówienia?', a: 'Standardowy czas realizacji wynosi 24-72h.' },
        { q: 'Czy można zwrócić produkt?', a: 'Tak, zwrot jest możliwy do 14 dni.' },
      ],
    };

    state.store = store;
    persistOperatorStore();
    return store;
  }

  function importNewestProductsIntoStore() {
    if (!state.store) throw new Error('Brak sklepu');

    const rawProducts = getCentralFeedProducts();
    const normalized = mapFeedToStoreProducts(rawProducts, state.store.marginPercent || DEFAULT_MARGIN, state.store.category);

    state.store.products = normalized;
    state.lastSyncAt = new Date().toISOString();

    upsertAiStore(state.store);
    persistOperatorStore();
    renderAll();
  }

  function syncOnlyNewProducts() {
    if (!state.store) return;

    const rawProducts = getCentralFeedProducts();
    const incoming = mapFeedToStoreProducts(rawProducts, state.store.marginPercent || DEFAULT_MARGIN, state.store.category);

    const existingIds = new Set((state.store.products || []).map((p) => String(p.id)));
    const newOnes = incoming.filter((p) => !existingIds.has(String(p.id)));

    if (newOnes.length) {
      state.store.products = newOnes.concat(state.store.products || []);
    }

    state.lastSyncAt = new Date().toISOString();
    upsertAiStore(state.store);
    persistOperatorStore();
    renderAll();
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderStoreStatus() {
    const el = document.getElementById('qm-store-status');
    if (!el) return;

    if (!state.store) {
      el.innerHTML = 'Sklep jeszcze nie został utworzony.';
      return;
    }

    const launchUrl = `/launch/${encodeURIComponent(state.store.slug)}`;
    el.innerHTML = `
      <strong>Sklep:</strong> ${escapeHtml(state.store.storeName || state.store.brandName || 'Sklep')}<br>
      <strong>Slug:</strong> ${escapeHtml(String(state.store.slug || ''))}<br>
      <strong>Marża:</strong> ${escapeHtml(String(state.store.marginPercent || state.store.margin || DEFAULT_MARGIN))}%<br>
      <strong>Produktów:</strong> ${(state.store.products || []).length}<br>
      <strong>Ostatnia synchronizacja:</strong> ${escapeHtml(state.lastSyncAt || 'jeszcze nie było')}<br>
      <strong>Storefront:</strong> <a href="${escapeHtml(launchUrl)}">${escapeHtml(window.location.origin + launchUrl)}</a>
    `;
  }

  function renderProducts() {
    const grid = document.getElementById('qm-products-grid');
    if (!grid) return;

    const products = state.store && Array.isArray(state.store.products) ? state.store.products : [];

    grid.innerHTML = products.map((p) => `
      <article class="product-card">
        <div class="product-img">
          ${p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">` : '📦'}
        </div>
        <div class="product-body">
          <h4 class="product-title">${escapeHtml(p.name)}</h4>
          <div class="price">${escapeHtml(String(p.storePrice || p.finalPrice || 0))} zł</div>
          <div class="meta">
            Hurt: ${escapeHtml(String(p.basePrice || 0))} zł<br>
            Marża: ${escapeHtml(String(p.margin || state.store.marginPercent || DEFAULT_MARGIN))}%<br>
            Źródło: ${escapeHtml(p.supplierName || 'Katalog centralny')}<br>
            ${p.isNew ? 'Nowość' : 'Produkt'}
          </div>
        </div>
      </article>
    `).join('');
  }

  function renderAll() {
    renderStoreStatus();
    renderProducts();
  }

  function bootstrapAutoStore() {
    restoreOperatorStore();
    renderAll();

    const openBtn = document.getElementById('qm-open-store-btn');
    const syncBtn = document.getElementById('qm-sync-btn');
    const descInput = document.getElementById('qm-store-description');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        try {
          openBtn.disabled = true;

          if (!state.store) {
            createStoreFromDescription({
              description:
                (descInput && descInput.value && descInput.value.trim()) ||
                'Automatyczny sklep z nowościami z hurtowni i cenami z marżą',
              margin: DEFAULT_MARGIN,
            });
          }

          importNewestProductsIntoStore();

          if (state.store && state.store.slug) {
            const launchUrl = `/launch/${encodeURIComponent(state.store.slug)}`;
            setTimeout(() => {
              window.location.assign(launchUrl);
            }, 350);
          }
        } catch (err) {
          console.error(err);
          alert('Nie udało się utworzyć sklepu lokalnie.');
        } finally {
          openBtn.disabled = false;
        }
      });
    }

    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        try {
          syncBtn.disabled = true;
          syncOnlyNewProducts();
        } catch (err) {
          console.error(err);
          alert('Synchronizacja nowości nie powiodła się.');
        } finally {
          syncBtn.disabled = false;
        }
      });
    }

    state.syncTimer = setInterval(() => {
      try {
        syncOnlyNewProducts();
      } catch (err) {
        console.error('AUTO SYNC ERROR', err);
      }
    }, AUTO_SYNC_MS);

    window.addEventListener('beforeunload', () => {
      if (state.syncTimer) {
        clearInterval(state.syncTimer);
        state.syncTimer = null;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', bootstrapAutoStore);
})();
