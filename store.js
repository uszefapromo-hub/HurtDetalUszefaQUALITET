:root{
  --bg:#081126;
  --bg-2:#0f1c3b;
  --card:rgba(14,24,48,.82);
  --line:rgba(255,255,255,.12);
  --text:#eef4ff;
  --muted:#a7b7d6;
  --gold:#ffbf3c;
  --green:#37d67a;
  --pink:#ff4fbf;
  --blue:#4f8cff;
  --cyan:#34d5ff;
  --red:#ff6b6b;
  --shadow:0 18px 60px rgba(0,0,0,.35);
  --radius:24px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
  color:var(--text);
  background:
    radial-gradient(circle at 10% 10%, rgba(79,140,255,.25), transparent 24%),
    radial-gradient(circle at 90% 12%, rgba(255,79,191,.18), transparent 22%),
    radial-gradient(circle at 50% 100%, rgba(55,214,122,.16), transparent 30%),
    linear-gradient(160deg,var(--bg),#0b1430 45%, #111a35 100%);
  min-height:100vh;
}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.container{width:min(1180px,calc(100% - 28px));margin:0 auto}
.topbar{
  position:sticky;top:0;z-index:40;
  backdrop-filter: blur(16px);
  background:rgba(7,14,30,.7);
  border-bottom:1px solid var(--line);
}
.nav{
  display:flex;align-items:center;justify-content:space-between;
  gap:18px;padding:14px 0;
}
.brand{
  display:flex;align-items:center;gap:14px;min-width:0;
}
.brand img{width:56px;height:56px}
.brand-text{display:flex;flex-direction:column}
.brand-title{font-size:1.06rem;font-weight:800;letter-spacing:.2px}
.brand-sub{font-size:.82rem;color:var(--muted)}
.nav-links{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
.nav-links a,.btn{
  padding:12px 16px;border-radius:16px;border:1px solid var(--line);
  background:rgba(255,255,255,.04);transition:.18s transform,.18s background,.18s border-color;
}
.nav-links a:hover,.btn:hover{transform:translateY(-1px);background:rgba(255,255,255,.09)}
.btn-primary{
  background:linear-gradient(90deg,var(--gold),#ff8f3d);
  color:#15110b;border:none;font-weight:800;
}
.hero{
  padding:42px 0 20px;
}
.hero-grid{
  display:grid;grid-template-columns:1.1fr .9fr;gap:26px;align-items:center;
}
.kicker{
  display:inline-flex;gap:10px;align-items:center;
  padding:10px 14px;border-radius:999px;background:rgba(255,191,60,.1);
  border:1px solid rgba(255,191,60,.24);color:#ffd87a;font-weight:700;font-size:.92rem;
}
h1{
  margin:16px 0 16px;font-size:clamp(2rem,4.8vw,4.3rem);line-height:.96;letter-spacing:-1.4px
}
.lead{font-size:1.08rem;line-height:1.66;color:#d8e2f7;max-width:760px}
.cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}
.hero-card,.card,.promo-strip,.stat,.plan,.store-card,.theme-card{
  background:var(--card);border:1px solid var(--line);
  box-shadow:var(--shadow);border-radius:var(--radius);
}
.hero-card{padding:18px}
.hero-visual{
  display:grid;gap:14px;
}
.info-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:14px;
}
.stat{padding:18px}
.stat strong{display:block;font-size:1.8rem;margin-bottom:6px}
.section{padding:22px 0 10px}
.section-title{
  font-size:clamp(1.55rem,2.8vw,2.5rem);letter-spacing:-.8px;margin:0 0 10px
}
.section-copy{color:var(--muted);line-height:1.7;max-width:850px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:18px}
.card{padding:22px}
.card h3{margin:0 0 10px;font-size:1.08rem}
.card p{margin:0;color:var(--muted);line-height:1.7}
.badge{
  display:inline-flex;padding:8px 12px;border-radius:999px;font-size:.82rem;font-weight:800;
  background:rgba(52,213,255,.1);color:#88ebff;border:1px solid rgba(52,213,255,.24)
}
.promo-strip{
  margin:20px 0;padding:20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;
  border-color:rgba(255,79,191,.28);
  background:linear-gradient(135deg,rgba(255,79,191,.16),rgba(79,140,255,.12));
}
.promo-strip strong{font-size:1.1rem}
.plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:18px}
.plan{padding:22px;position:relative;overflow:hidden}
.plan.featured{border-color:rgba(255,191,60,.5);transform:translateY(-3px)}
.plan h3{margin:0 0 10px;font-size:1.3rem}
.price{font-size:2.1rem;font-weight:900;letter-spacing:-1px}
.muted{color:var(--muted)}
.plan ul{padding-left:18px;color:#dce6fb;line-height:1.8}
.plan .tag{
  position:absolute;top:14px;right:14px;background:rgba(255,191,60,.14);
  color:#ffdd88;border:1px solid rgba(255,191,60,.3);padding:8px 10px;border-radius:999px;font-size:.82rem;font-weight:800
}
.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.field{display:flex;flex-direction:column;gap:8px}
.field label{font-weight:700;font-size:.95rem}
input,select,textarea{
  width:100%;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.05);
  color:var(--text);padding:14px 14px;font:inherit;outline:none;
}
textarea{min-height:120px;resize:vertical}
input[type="file"]{padding:12px}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
.output-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:18px;margin-top:18px}
.preview{
  min-height:320px;padding:22px;border-radius:24px;border:1px dashed rgba(255,255,255,.18);
  background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));
}
.store-theme-luxury{background:linear-gradient(135deg,#150f00,#3f2300 45%,#1c1200);color:#fff3ce}
.store-theme-neon{background:linear-gradient(135deg,#08081f,#0d2854 50%,#3d0f57);color:#eff7ff}
.store-theme-clean{background:linear-gradient(135deg,#f7fbff,#eaf4ff);color:#12213f}
.store-theme-luxury .mini-card,.store-theme-neon .mini-card,.store-theme-clean .mini-card{
  background:rgba(255,255,255,.12);padding:12px;border-radius:18px;border:1px solid rgba(255,255,255,.15);margin-top:12px
}
.store-theme-clean .mini-card{background:rgba(18,33,63,.06);border-color:rgba(18,33,63,.1)}
.store-list{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.store-card{padding:18px}
.store-card h4{margin:0 0 10px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:18px}
.kpi{padding:18px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid var(--line)}
.kpi strong{display:block;font-size:1.5rem}
.footer{padding:40px 0 60px;color:var(--muted)}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.notice{padding:14px 16px;border-radius:16px;background:rgba(55,214,122,.1);border:1px solid rgba(55,214,122,.25);color:#bff4d3}
.warn{background:rgba(255,107,107,.1);border-color:rgba(255,107,107,.2);color:#ffc6c6}
hr.sep{border:none;height:1px;background:var(--line);margin:22px 0}
.theme-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:18px}
.theme-card{padding:16px}
.theme-chip{display:inline-block;padding:8px 10px;border-radius:999px;font-size:.78rem;font-weight:800}
.theme-luxury{background:rgba(255,191,60,.15);color:#ffe08d}
.theme-neon{background:rgba(52,213,255,.14);color:#97f1ff}
.theme-clean{background:rgba(255,255,255,.14);color:#eaf4ff}
.table-like{display:grid;gap:10px;margin-top:16px}
.row{
  display:grid;grid-template-columns:1.2fr .8fr .8fr .8fr;gap:10px;padding:14px 16px;border-radius:16px;
  background:rgba(255,255,255,.04);border:1px solid var(--line)
}
.micro{font-size:.85rem;color:var(--muted)}
.center{text-align:center}
@media (max-width: 980px){
  .hero-grid,.output-grid,.grid-2,.form-grid{grid-template-columns:1fr}
  .cards,.plan-grid,.theme-grid,.store-list,.kpis,.info-grid{grid-template-columns:1fr}
  .row{grid-template-columns:1fr 1fr}
}
@media (max-width: 640px){
  .nav{align-items:flex-start;flex-direction:column}
  h1{font-size:2.3rem}
  .container{width:min(100% - 20px,1180px)}
  .card,.plan,.stat,.store-card,.promo-strip,.hero-card{padding:18px}
}