(function(){
  const manager = window.StoreManager;
  const STORAGE_KEYS = {
    suppliers: 'warehouse_suppliers',
    products: 'warehouse_products'
  };
  const CURRENCY_FORMATTER = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  });
  const CATEGORY_STYLES = {
    'Elektronika': {label: 'EL', color: '#35d9ff'},
    'Dom i ogród': {label: 'DOM', color: '#54ffb0'},
    'Moda': {label: 'MOD', color: '#ff9d4a'},
    'Dziecko': {label: 'KID', color: '#ff6fa9'},
    'Auto': {label: 'AUTO', color: '#ffd84d'},
    'Beauty': {label: 'BEA', color: '#9e77ff'}
  };
  const DEFAULT_MARGIN = 15;

  function formatCurrency(value){
    return CURRENCY_FORMATTER.format(value);
  }

  function parseNumber(value, fallback = 0){
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function safeParse(raw){
    if(!raw){
      return null;
    }
    try{
      return JSON.parse(raw);
    } catch (_error){
      return null;
    }
  }

  function buildImage(label, color){
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#0b1224" stop-opacity="0.95"/>
          </linearGradient>
        </defs>
        <rect width="320" height="220" rx="28" fill="url(#g)"/>
        <text x="50%" y="52%" text-anchor="middle" fill="#ffffff" font-size="56" font-family="Arial, sans-serif" font-weight="700">
          ${label}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }

  function getCategoryStyle(category){
    return CATEGORY_STYLES[category] || {label: 'HQ', color: '#3a4a6b'};
  }

  function buildCategoryImage(category){
    const style = getCategoryStyle(category);
    return buildImage(style.label, style.color);
  }

  const demoSuppliers = [
    {
      id: 'elektronika',
      name: 'ElektroNova',
      category: 'Elektronika',
      description: 'Sprzęt smart, audio oraz akcesoria premium.',
      rating: 4.8,
      leadTime: '24h',
      minOrder: '250 zł',
      productCount: 540,
      logo: buildCategoryImage('Elektronika')
    },
    {
      id: 'dom-ogrod',
      name: 'Zielony Magazyn',
      category: 'Dom i ogród',
      description: 'Wyposażenie wnętrz i akcesoria ogrodowe.',
      rating: 4.6,
      leadTime: '48h',
      minOrder: '200 zł',
      productCount: 410,
      logo: buildCategoryImage('Dom i ogród')
    },
    {
      id: 'moda',
      name: 'Moda Avenue',
      category: 'Moda',
      description: 'Odzież miejska, obuwie i dodatki sezonowe.',
      rating: 4.7,
      leadTime: '24-48h',
      minOrder: '300 zł',
      productCount: 620,
      logo: buildCategoryImage('Moda')
    },
    {
      id: 'dziecko',
      name: 'Maluch Planet',
      category: 'Dziecko',
      description: 'Artykuły dla niemowląt i kreatywne zabawki.',
      rating: 4.9,
      leadTime: '24h',
      minOrder: '180 zł',
      productCount: 350,
      logo: buildCategoryImage('Dziecko')
    },
    {
      id: 'auto',
      name: 'AutoPro Logistics',
      category: 'Auto',
      description: 'Akcesoria samochodowe i elektronika pokładowa.',
      rating: 4.5,
      leadTime: '72h',
      minOrder: '400 zł',
      productCount: 280,
      logo: buildCategoryImage('Auto')
    },
    {
      id: 'beauty',
      name: 'BeautyWave',
      category: 'Beauty',
      description: 'Kosmetyki, urządzenia beauty i eko linie.',
      rating: 4.8,
      leadTime: '24h',
      minOrder: '220 zł',
      productCount: 480,
      logo: buildCategoryImage('Beauty')
    }
  ];

  const demoProducts = [
    {
      id: 'el-001',
      name: 'Słuchawki Quantum Pro',
      cost: 120,
      image: buildCategoryImage('Elektronika'),
      description: 'Redukcja szumów i dźwięk HD dla klientów premium.',
      supplier: 'ElektroNova',
      category: 'Elektronika'
    },
    {
      id: 'el-002',
      name: 'Smartwatch Vertex',
      cost: 210,
      image: buildCategoryImage('Elektronika'),
      description: 'Monitoring zdrowia i tryby sportowe 24/7.',
      supplier: 'ElektroNova',
      category: 'Elektronika'
    },
    {
      id: 'dom-001',
      name: 'Zestaw narzędzi smart',
      cost: 89,
      image: buildCategoryImage('Dom i ogród'),
      description: 'Kompletny zestaw do domowych napraw i majsterkowania.',
      supplier: 'Zielony Magazyn',
      category: 'Dom i ogród'
    },
    {
      id: 'dom-002',
      name: 'Lampy ogrodowe Solar Glow',
      cost: 48,
      image: buildCategoryImage('Dom i ogród'),
      description: 'Energooszczędne oświetlenie tarasu i ogrodu.',
      supplier: 'Zielony Magazyn',
      category: 'Dom i ogród'
    },
    {
      id: 'mod-001',
      name: 'Kurtka Softshell City',
      cost: 130,
      image: buildCategoryImage('Moda'),
      description: 'Lekka kurtka miejska na sezon przejściowy.',
      supplier: 'Moda Avenue',
      category: 'Moda'
    },
    {
      id: 'mod-002',
      name: 'Sneakersy StreetFlow',
      cost: 155,
      image: buildCategoryImage('Moda'),
      description: 'Najpopularniejszy model wśród klientów streetwear.',
      supplier: 'Moda Avenue',
      category: 'Moda'
    },
    {
      id: 'kid-001',
      name: 'Wózek spacerowy Aero',
      cost: 320,
      image: buildCategoryImage('Dziecko'),
      description: 'Lekki wózek z amortyzacją i regulowanym oparciem.',
      supplier: 'Maluch Planet',
      category: 'Dziecko'
    },
    {
      id: 'kid-002',
      name: 'Zestaw kreatywny 3D',
      cost: 45,
      image: buildCategoryImage('Dziecko'),
      description: 'Zabawka rozwijająca kreatywność i zdolności manualne.',
      supplier: 'Maluch Planet',
      category: 'Dziecko'
    },
    {
      id: 'auto-001',
      name: 'Komplet dywaników premium',
      cost: 70,
      image: buildCategoryImage('Auto'),
      description: 'Dopasowane dywaniki z powłoką ochronną.',
      supplier: 'AutoPro Logistics',
      category: 'Auto'
    },
    {
      id: 'auto-002',
      name: 'Kamera cofania HD',
      cost: 95,
      image: buildCategoryImage('Auto'),
      description: 'Kamera z trybem nocnym i szerokim kątem widzenia.',
      supplier: 'AutoPro Logistics',
      category: 'Auto'
    },
    {
      id: 'bea-001',
      name: 'Serum Glow Pro',
      cost: 60,
      image: buildCategoryImage('Beauty'),
      description: 'Intensywne nawilżenie i rozświetlenie skóry.',
      supplier: 'BeautyWave',
      category: 'Beauty'
    },
    {
      id: 'bea-002',
      name: 'Suszarka Ionic Air',
      cost: 115,
      image: buildCategoryImage('Beauty'),
      description: 'Szybkie suszenie z jonizacją i kontrolą temperatury.',
      supplier: 'BeautyWave',
      category: 'Beauty'
    }
  ];

  function loadSeededData(key, fallback){
    const parsed = safeParse(localStorage.getItem(key));
    if(Array.isArray(parsed) && parsed.length){
      return parsed;
    }
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  function calculatePricing(cost, margin){
    const safeCost = Math.max(0, parseNumber(cost, 0));
    const safeMargin = Math.min(100, Math.max(0, parseNumber(margin, DEFAULT_MARGIN)));
    const finalPrice = safeCost * (1 + safeMargin / 100);
    const profit = finalPrice - safeCost;
    return {finalPrice, profit, margin: safeMargin};
  }

  function formatPlan(plan){
    const value = (plan || '').toLowerCase();
    if(value === 'pro'){
      return 'PRO';
    }
    if(value === 'elite'){
      return 'ELITE';
    }
    return 'Basic';
  }

  function updateStoreSummary(store){
    const nameTarget = document.querySelector('[data-store-name]');
    const hintTarget = document.querySelector('[data-store-hint]');
    const planTarget = document.querySelector('[data-store-plan]');
    const productsTarget = document.querySelector('[data-store-products]');
    if(!nameTarget){
      return;
    }
    if(!store){
      nameTarget.textContent = 'Brak aktywnego sklepu';
      if(hintTarget){
        hintTarget.textContent = 'Utwórz sklep, aby importować produkty z hurtowni.';
      }
      if(planTarget){
        planTarget.textContent = 'Plan: ---';
      }
      if(productsTarget){
        productsTarget.textContent = 'Produkty: 0';
      }
      return;
    }
    nameTarget.textContent = store.name || 'Twój sklep';
    if(hintTarget){
      const marginValue = parseNumber(store.margin, DEFAULT_MARGIN);
      hintTarget.textContent = `Marża bazowa: ${marginValue}% · ${store.delivery || 'Wysyłka w 24h'}`;
    }
    if(planTarget){
      planTarget.textContent = `Plan: ${formatPlan(store.plan)}`;
    }
    const count = Array.isArray(store.products) ? store.products.length : 0;
    if(productsTarget){
      productsTarget.textContent = `Produkty: ${count}`;
    }
  }

  function renderSuppliers(container, suppliers){
    if(!container){
      return;
    }
    container.innerHTML = '';
    suppliers.forEach(supplier => {
      const card = document.createElement('article');
      card.className = 'supplier-card warehouse-supplier';
      card.innerHTML = `
        <div class="supplier-head">
          <div class="supplier-info">
            <div class="supplier-logo">
              <img src="${supplier.logo}" alt="${supplier.name}">
            </div>
            <div>
              <h3>${supplier.name}</h3>
              <p class="hint">${supplier.description}</p>
            </div>
          </div>
          <span class="badge-pill">${supplier.category}</span>
        </div>
        <div class="supplier-meta">
          <span><strong>${supplier.rating}</strong> ocena</span>
          <span><strong>${supplier.leadTime}</strong> realizacja</span>
          <span><strong>${supplier.productCount}</strong> produktów</span>
          <span><strong>${supplier.minOrder}</strong> min. zamówienie</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function renderCategories(container, categories, activeCategory){
    if(!container){
      return;
    }
    container.innerHTML = '';
    categories.forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'warehouse-chip';
      button.dataset.category = category.value;
      button.textContent = category.label;
      if(category.value === activeCategory){
        button.classList.add('is-active');
      }
      container.appendChild(button);
    });
  }

  function renderProducts(container, emptyState, products, store, state){
    if(!container){
      return;
    }
    container.innerHTML = '';
    const search = state.search.trim().toLowerCase();
    const filtered = products.filter(product => {
      if(state.category !== 'all' && product.category !== state.category){
        return false;
      }
      if(!search){
        return true;
      }
      const haystack = [
        product.name,
        product.description,
        product.supplier,
        product.category
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
    if(emptyState){
      emptyState.hidden = filtered.length > 0;
    }
    if(!filtered.length){
      return;
    }
    const storeProducts = Array.isArray(store && store.products) ? store.products : [];
    const defaultMargin = parseNumber(store && store.margin, DEFAULT_MARGIN);
    filtered.forEach(product => {
      const card = document.createElement('article');
      card.className = 'product-card warehouse-product';
      card.innerHTML = `
        <div class="product-media">
          <img src="${product.image}" alt="${product.name}">
          <span class="product-tag">${product.category}</span>
        </div>
        <div class="product-body">
          <h3>${product.name}</h3>
          <p class="hint">${product.description}</p>
          <div class="product-meta">
            <span>Hurtownia: ${product.supplier}</span>
            <span>Koszt: ${formatCurrency(product.cost)}</span>
          </div>
          <div class="product-calc">
            <label class="warehouse-field">
              <span>Marża (%)</span>
              <input type="number" min="0" max="100" step="1" value="${defaultMargin}">
            </label>
            <div class="product-values">
              <div>
                <span>Cena końcowa</span>
                <strong data-final-price>0 zł</strong>
              </div>
              <div>
                <span>Zysk</span>
                <strong data-profit>0 zł</strong>
              </div>
            </div>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" type="button" data-add-product>Dodaj do mojego sklepu</button>
            <span class="hint" data-add-status></span>
          </div>
        </div>
      `;
      const marginInput = card.querySelector('input');
      const finalTarget = card.querySelector('[data-final-price]');
      const profitTarget = card.querySelector('[data-profit]');
      const addButton = card.querySelector('[data-add-product]');
      const statusTarget = card.querySelector('[data-add-status]');
      const cost = parseNumber(product.cost, 0);

      const updatePricing = () => {
        const {finalPrice, profit} = calculatePricing(cost, marginInput.value);
        finalTarget.textContent = formatCurrency(finalPrice);
        profitTarget.textContent = formatCurrency(profit);
      };

      const updateStatus = storedProduct => {
        if(!store){
          addButton.disabled = true;
          statusTarget.textContent = 'Utwórz sklep, aby dodać produkt.';
          return;
        }
        addButton.disabled = false;
        if(storedProduct){
          addButton.textContent = 'Aktualizuj w sklepie';
          statusTarget.textContent = `W sklepie · Marża ${storedProduct.margin}%`;
          return;
        }
        addButton.textContent = 'Dodaj do mojego sklepu';
        statusTarget.textContent = '';
      };

      updatePricing();
      const existingProduct = storeProducts.find(item => item.id === product.id);
      updateStatus(existingProduct);

      marginInput.addEventListener('input', updatePricing);

      addButton.addEventListener('click', () => {
        if(!store){
          updateStatus(null);
          return;
        }
        const {finalPrice, profit, margin} = calculatePricing(cost, marginInput.value);
        const nextProduct = {
          ...product,
          margin,
          finalPrice: Number(finalPrice.toFixed(2)),
          profit: Number(profit.toFixed(2))
        };
        const updatedProducts = Array.isArray(store.products) ? [...store.products] : [];
        const existingIndex = updatedProducts.findIndex(item => item.id === product.id);
        if(existingIndex >= 0){
          updatedProducts[existingIndex] = {
            ...updatedProducts[existingIndex],
            ...nextProduct
          };
        } else {
          updatedProducts.unshift(nextProduct);
        }
        const updatedStore = manager ? manager.upsertStore({
          ...store,
          products: updatedProducts
        }) : null;
        if(updatedStore && manager){
          manager.setActiveStore(updatedStore.id);
        }
        if(updatedStore){
          store.products = updatedProducts;
          updateStoreSummary(store);
          updateStatus(nextProduct);
          statusTarget.textContent = 'Dodano do sklepu.';
        }
      });

      container.appendChild(card);
    });
  }

  function initCalculator(store){
    const calculator = document.querySelector('[data-warehouse-calculator]');
    if(!calculator){
      return;
    }
    const costInput = calculator.querySelector('[data-calc-cost]');
    const marginInput = calculator.querySelector('[data-calc-margin]');
    const finalTarget = calculator.querySelector('[data-calc-final]');
    const profitTarget = calculator.querySelector('[data-calc-profit]');
    if(!costInput || !marginInput || !finalTarget || !profitTarget){
      return;
    }
    const defaultMargin = parseNumber(store && store.margin, DEFAULT_MARGIN);
    marginInput.value = defaultMargin;
    const update = () => {
      const {finalPrice, profit} = calculatePricing(costInput.value, marginInput.value);
      finalTarget.textContent = formatCurrency(finalPrice);
      profitTarget.textContent = formatCurrency(profit);
    };
    costInput.addEventListener('input', update);
    marginInput.addEventListener('input', update);
    update();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const suppliers = loadSeededData(STORAGE_KEYS.suppliers, demoSuppliers);
    const products = loadSeededData(STORAGE_KEYS.products, demoProducts);
    const store = manager ? manager.getActiveStore() : null;
    updateStoreSummary(store);
    initCalculator(store);

    const suppliersGrid = document.querySelector('[data-suppliers-grid]');
    renderSuppliers(suppliersGrid, suppliers);

    const categories = Array.from(new Set(products.map(product => product.category)))
      .map(category => ({value: category, label: category}));
    const categoryOptions = [{value: 'all', label: 'Wszystkie'}].concat(categories);
    const state = {
      category: 'all',
      search: ''
    };
    const categoriesContainer = document.querySelector('[data-warehouse-categories]');
    renderCategories(categoriesContainer, categoryOptions, state.category);

    const productsGrid = document.querySelector('[data-products-grid]');
    const emptyState = document.querySelector('[data-products-empty]');
    renderProducts(productsGrid, emptyState, products, store, state);

    const searchInput = document.querySelector('[data-warehouse-search]');
    if(searchInput){
      searchInput.addEventListener('input', event => {
        state.search = event.target.value || '';
        renderProducts(productsGrid, emptyState, products, store, state);
      });
    }

    if(categoriesContainer){
      categoriesContainer.addEventListener('click', event => {
        const button = event.target.closest('.warehouse-chip');
        if(!button){
          return;
        }
        const selected = button.dataset.category || 'all';
        state.category = selected;
        renderCategories(categoriesContainer, categoryOptions, state.category);
        renderProducts(productsGrid, emptyState, products, store, state);
      });
    }
  });
})();
