(function(){
  const KEYS = {
    products: 'qm_products_by_supplier_v1',
    intel: 'qm_intel_prefill_v1',
    listing: 'qm_listing_prefill_v1',
    crm: 'qm_crm_v1',
    stores: 'qm_stores_v1',
    activeStore: 'qm_active_store_v1',
    margin: 'qm_store_margin_pct'
  };

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e) { return fallback; }
  };

  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const seed = () => {
    if (!localStorage.getItem(KEYS.products)) {
      write(KEYS.products, {
        "Top 3 start": [
          { name: "Starter Pack Biznes", buyNet: 39, suggestedNet: 79, promo: true },
          { name: "Pro Zestaw Premium", buyNet: 69, suggestedNet: 129, promo: true },
          { name: "Elite Box", buyNet: 119, suggestedNet: 219, promo: true }
        ]
      });
    }
    if (!localStorage.getItem(KEYS.crm)) {
      write(KEYS.crm, {
        leadGoal: 120,
        adBudget: 900,
        message: "Witamy w centrum dowodzenia QualitetMarket."
      });
    }
    if (!localStorage.getItem(KEYS.stores)) {
      write(KEYS.stores, [{
        id: 'store-main',
        ownerName: 'Demo Partner',
        storeName: 'Sklep Demo U Szefa',
        logoName: 'Twoje logo',
        theme: 'royal',
        monthlyPlan: 'pro',
        marginPct: 35,
        adBudget: 1200,
        promoEligible: true
      }]);
    }
    if (!localStorage.getItem(KEYS.activeStore)) {
      localStorage.setItem(KEYS.activeStore, JSON.stringify('store-main'));
    }
    if (!localStorage.getItem(KEYS.margin)) {
      write(KEYS.margin, 35);
    }
    if (!localStorage.getItem(KEYS.intel)) {
      write(KEYS.intel, {
        niche: 'Dom i biznes',
        target: 'Osoby chcące startu bez wkładu',
        hook: 'Zarabiaj ze sklepu pod własnym logo'
      });
    }
    if (!localStorage.getItem(KEYS.listing)) {
      write(KEYS.listing, {
        title: 'Top produkt do szybkiej marży',
        bullets: ['własna marka sklepu', 'automatyczna marża', 'reklamy w panelu']
      });
    }
  };

  seed();

  const getStores = () => read(KEYS.stores, []);
  const saveStores = (stores) => write(KEYS.stores, stores);
  const getActiveId = () => read(KEYS.activeStore, 'store-main');

  function getCurrentStore() {
    const stores = getStores();
    return stores.find(s => s.id === getActiveId()) || stores[0] || null;
  }

  function refreshPlanGuard() {
    const store = getCurrentStore();
    const planOrder = { basic: 1, pro: 2, elite: 3 };
    document.querySelectorAll('[data-require]').forEach(el => {
      const need = el.getAttribute('data-require');
      const allowed = store && planOrder[(store.monthlyPlan || 'basic')] >= planOrder[need];
      el.classList.toggle('locked', !allowed);
      const tag = el.querySelector('.guard-label');
      if (tag) tag.textContent = allowed ? `${need.toUpperCase()} aktywne` : `Wymaga planu ${need.toUpperCase()}`;
    });
    const planNodes = document.querySelectorAll('[data-bind="planName"]');
    planNodes.forEach(node => node.textContent = store ? String(store.monthlyPlan).toUpperCase() : 'BASIC');
  }

  function renderStoreSummary() {
    const store = getCurrentStore();
    if (!store) return;
    document.querySelectorAll('[data-bind="storeName"]').forEach(n => n.textContent = store.storeName || 'Twój sklep');
    document.querySelectorAll('[data-bind="ownerName"]').forEach(n => n.textContent = store.ownerName || 'Partner');
    document.querySelectorAll('[data-bind="marginPct"]').forEach(n => n.textContent = `${store.marginPct || 0}%`);
    document.querySelectorAll('[data-bind="adBudget"]').forEach(n => n.textContent = `${store.adBudget || 0} zł`);
    refreshPlanGuard();
  }

  function currency(v){
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 2 }).format(Number(v || 0));
  }

  function recalcMargin() {
    const buy = parseFloat(document.querySelector('#buyPrice')?.value || 0);
    const margin = parseFloat(document.querySelector('#marginPct')?.value || 0);
    const ads = parseFloat(document.querySelector('#adCost')?.value || 0);
    const sale = buy * (1 + margin / 100);
    const profit = sale - buy - ads;
    const monthly = profit * 40;
    const saleNode = document.querySelector('#saleResult');
    const profitNode = document.querySelector('#profitResult');
    const monthNode = document.querySelector('#monthResult');
    if (saleNode) saleNode.textContent = currency(sale);
    if (profitNode) profitNode.textContent = currency(profit);
    if (monthNode) monthNode.textContent = currency(monthly);
  }

  function fillStoreSelect() {
    const selects = document.querySelectorAll('.store-select');
    const stores = getStores();
    selects.forEach(select => {
      const current = getActiveId();
      select.innerHTML = stores.map(s => `<option value="${s.id}" ${s.id === current ? 'selected' : ''}>${s.storeName}</option>`).join('');
      select.onchange = () => {
        localStorage.setItem(KEYS.activeStore, JSON.stringify(select.value));
        renderStoreSummary();
      };
    });
  }

  function renderStoreList() {
    const holder = document.querySelector('#storeList');
    if (!holder) return;
    const stores = getStores();
    holder.innerHTML = stores.map((s, idx) => `
      <div class="table-row">
        <div><strong>${s.storeName}</strong><div class="small">Właściciel: ${s.ownerName}</div></div>
        <div><span class="pill">${String(s.monthlyPlan).toUpperCase()}</span></div>
        <div>Marża startowa: <strong>${s.marginPct}%</strong></div>
        <div>${idx < 3 ? '<span class="badge">Promocja 3 pierwszych</span>' : '<span class="small">Standard</span>'}</div>
      </div>
    `).join('');
  }

  function setupGenerator() {
    const form = document.querySelector('#storeGeneratorForm');
    if (!form) return;

    const themeCards = document.querySelectorAll('.theme-option');
    let selectedTheme = 'royal';
    themeCards.forEach(card => {
      card.onclick = () => {
        themeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedTheme = card.dataset.theme;
      };
    });

    const logoInput = document.querySelector('#logoInput');
    const logoPreview = document.querySelector('#logoPreview');
    if (logoInput && logoPreview) {
      logoInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          logoPreview.innerHTML = `<img src="${reader.result}" alt="Logo sklepu"><div class="small" style="margin-top:10px">${file.name}</div>`;
        };
        reader.readAsDataURL(file);
      };
    }

    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const stores = getStores();
      const id = `store-${Date.now()}`;
      const plan = fd.get('plan') || 'pro';
      const marginPct = Number(fd.get('margin') || 35);
      const adBudget = Number(fd.get('adBudget') || 1000);
      const newStore = {
        id,
        ownerName: String(fd.get('ownerName') || '').trim() || 'Nowy Partner',
        storeName: String(fd.get('storeName') || '').trim() || 'Nowy Sklep',
        logoName: logoInput?.files?.[0]?.name || 'Bez logo',
        theme: selectedTheme,
        monthlyPlan: plan,
        marginPct,
        adBudget,
        promoEligible: stores.length < 3
      };
      stores.push(newStore);
      saveStores(stores);
      localStorage.setItem(KEYS.activeStore, JSON.stringify(id));
      write(KEYS.margin, marginPct);
      fillStoreSelect();
      renderStoreList();
      renderStoreSummary();
      const success = document.querySelector('#generatorSuccess');
      if (success) {
        success.classList.remove('hidden');
        success.innerHTML = `Gotowe. Sklep <strong>${newStore.storeName}</strong> został zapisany. Plan: <strong>${String(plan).toUpperCase()}</strong>. ${stores.length <= 3 ? 'Włączona promocja dla 3 pierwszych sprzedawców.' : 'Standardowe naliczanie subskrypcji.'}`;
      }
      form.reset();
      document.querySelectorAll('.theme-option').forEach(c => c.classList.remove('active'));
      document.querySelector('.theme-option[data-theme="royal"]')?.classList.add('active');
      if (logoPreview) logoPreview.innerHTML = `<strong>Podgląd logo sklepu</strong><div class="small" style="margin-top:8px">Wgraj swoje logo i otwórz sklep pod własną marką.</div>`;
    };
  }

  function bindCalc() {
    ['#buyPrice','#marginPct','#adCost'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.addEventListener('input', recalcMargin);
    });
    const applyBtn = document.querySelector('#applyMarginGlobal');
    if (applyBtn) {
      applyBtn.onclick = () => {
        const margin = Number(document.querySelector('#marginPct')?.value || 0);
        write(KEYS.margin, margin);
        const stores = getStores();
        const active = getActiveId();
        stores.forEach(s => {
          if (s.id === active) s.marginPct = margin;
        });
        saveStores(stores);
        renderStoreSummary();
        const note = document.querySelector('#marginSaved');
        if (note) {
          note.classList.remove('hidden');
          note.textContent = `Marża ${margin}% zapisana w kluczu ${KEYS.margin} i przypisana do aktywnego sklepu.`;
        }
      };
    }
    recalcMargin();
  }

  function bindPlanButtons() {
    document.querySelectorAll('[data-plan-target]').forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-plan-target');
        const stores = getStores();
        const active = getActiveId();
        stores.forEach(s => {
          if (s.id === active) s.monthlyPlan = target;
        });
        saveStores(stores);
        renderStoreSummary();
        renderStoreList();
      };
    });
  }

  function bindAdsCalc() {
    const budget = document.querySelector('#adsBudget');
    const cpc = document.querySelector('#adsCpc');
    const conv = document.querySelector('#adsConv');
    const out = document.querySelector('#adsResult');
    const fn = () => {
      if (!budget || !cpc || !conv || !out) return;
      const b = Number(budget.value || 0);
      const c = Number(cpc.value || 1);
      const cv = Number(conv.value || 1) / 100;
      const clicks = c > 0 ? b / c : 0;
      const sales = clicks * cv;
      out.innerHTML = `<strong>${Math.round(clicks)}</strong> kliknięć • <strong>${Math.round(sales)}</strong> sprzedaży • przy 40 zł zysku/szt. to <strong>${currency(sales * 40)}</strong>`;
    };
    [budget,cpc,conv].forEach(el => el && el.addEventListener('input', fn));
    fn();
  }

  function bindQuickLinks() {
    document.querySelectorAll('[data-scroll]').forEach(link => {
      link.onclick = (e) => {
        const target = document.querySelector(link.getAttribute('data-scroll'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
    });
  }

  fillStoreSelect();
  renderStoreList();
  renderStoreSummary();
  setupGenerator();
  bindCalc();
  bindPlanButtons();
  bindAdsCalc();
  bindQuickLinks();
})();