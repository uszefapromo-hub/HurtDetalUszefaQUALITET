
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('active-store-card');
  if(!root) return;
  const store = window.QM.getActiveStore();
  root.innerHTML = `
    <h3>Aktywny sklep</h3>
    <div class="shop-banner">
      <img src="${store.logo || 'assets/logo-uszefa.svg'}" alt="Logo">
      <div>
        <strong>${store.name}</strong>
        <div>${store.niche || 'Sprzedaż wielobranżowa'}</div>
      </div>
    </div>
    <div class="kv"><span>Plan</span><strong>${String(store.plan).toUpperCase()}</strong></div>
    <div class="kv"><span>Motyw</span><strong>${store.theme}</strong></div>
    <div class="kv"><span>Marża</span><strong>${store.margin}%</strong></div>
  `;
});
