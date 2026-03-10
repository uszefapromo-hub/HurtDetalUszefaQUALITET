
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('products-list');
  if(!root) return;
  const store = window.QM.getActiveStore();
  const margin = window.QM.getMargin();
  const supplierMap = window.QM.read(window.QM.KEYS.products, {});
  const allProducts = Object.values(supplierMap).flat();

  const banner = document.querySelector('[data-store-banner]');
  if(banner){
    banner.innerHTML = `
      <div class="shop-banner">
        <img src="${store.logo || 'assets/logo-uszefa.svg'}" alt="logo">
        <div>
          <strong>${store.name}</strong>
          <div>${store.niche || 'Sprzedaż wielobranżowa'} • Plan ${String(store.plan || 'basic').toUpperCase()}</div>
        </div>
      </div>
    `;
  }

  if(!allProducts.length){
    root.innerHTML = '<p class="empty">Brak produktów. Wejdź do hurtowni i zaimportuj produkty.</p>';
    return;
  }

  root.innerHTML = allProducts.map(p => {
    const price = Math.ceil(p.cost * (1 + margin/100));
    return `
      <article class="product-card">
        <strong>${p.name}</strong>
        <div>Dostawca: ${p.supplier}</div>
        <div class="price">${window.QM.money(price)}</div>
        <button class="btn btn-primary" data-add-to-cart='${JSON.stringify({name:p.name, price, qty:1})}'>Dodaj do koszyka</button>
      </article>
    `;
  }).join('');

  root.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = JSON.parse(btn.getAttribute('data-add-to-cart'));
      const cart = window.QM.cart();
      const existing = cart.find(i => i.name === item.name);
      if(existing){ existing.qty += 1; } else { cart.push(item); }
      window.QM.write(window.QM.KEYS.cart, cart);
      alert('Dodano do koszyka.');
    });
  });
});
