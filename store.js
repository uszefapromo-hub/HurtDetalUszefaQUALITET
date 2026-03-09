:root{
  --bg:#0f172a;
  --card:#111827;
  --muted:#94a3b8;
  --text:#f8fafc;
  --brand1:#f59e0b;
  --brand2:#06b6d4;
  --brand3:#8b5cf6;
  --ok:#22c55e;
  --danger:#ef4444;
  --line:rgba(255,255,255,.12);
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(180deg,#0b1220,#111827);color:var(--text)}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.container{width:min(1200px,92vw);margin:0 auto}
.topbar{position:sticky;top:0;z-index:20;background:rgba(15,23,42,.9);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0}
.nav-links{display:flex;flex-wrap:wrap;gap:10px}
.nav-links a{padding:10px 14px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.04)}
.hero{padding:48px 0 24px;background:
 radial-gradient(circle at top left, rgba(245,158,11,.28), transparent 28%),
 radial-gradient(circle at top right, rgba(6,182,212,.18), transparent 24%),
 radial-gradient(circle at bottom, rgba(139,92,246,.18), transparent 30%)}
.hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:24px;align-items:center}
.badge{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.35);color:#dcfce7;font-weight:700}
h1{font-size:clamp(34px,6vw,64px);line-height:1.02;margin:14px 0}
.lead{font-size:clamp(18px,2.6vw,22px);color:#dbeafe;max-width:760px}
.hero-actions,.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
.btn{display:inline-block;padding:14px 18px;border-radius:14px;font-weight:700;border:1px solid var(--line);background:#1f2937}
.btn-primary{background:linear-gradient(135deg,var(--brand1),#fb7185);color:#111827;border:none}
.btn-alt{background:linear-gradient(135deg,var(--brand2),var(--brand3));color:#fff;border:none}
.section{padding:28px 0}
.grid-3,.grid-4,.grid-2{display:grid;gap:18px}
.grid-4{grid-template-columns:repeat(4,1fr)}
.grid-3{grid-template-columns:repeat(3,1fr)}
.grid-2{grid-template-columns:repeat(2,1fr)}
.card{background:rgba(17,24,39,.86);border:1px solid var(--line);border-radius:24px;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,.18)}
.card h3{margin-top:0}
.kpi{font-size:32px;font-weight:800}
.sub{color:var(--muted)}
.promo{background:linear-gradient(135deg,rgba(245,158,11,.22),rgba(236,72,153,.18));border:1px solid rgba(245,158,11,.4)}
.plan{position:relative}
.plan .price{font-size:40px;font-weight:800}
.tag{display:inline-block;padding:6px 10px;background:rgba(255,255,255,.08);border-radius:999px;font-size:12px}
.feature-list{margin:0;padding-left:18px;color:#e5e7eb}
.hero-visual{padding:16px}
.logo-row{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.logo-box{background:#fff;border-radius:18px;padding:14px;min-width:120px}
.form-row{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.input, select, textarea{width:100%;padding:14px 14px;border-radius:14px;border:1px solid var(--line);background:#0f172a;color:#fff}
label{display:block;font-weight:700;margin-bottom:8px}
.small{font-size:13px;color:var(--muted)}
.result{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.result .box{padding:14px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid var(--line)}
.footer{padding:32px 0 54px;color:var(--muted)}
.theme-list{display:flex;gap:10px;flex-wrap:wrap}
.theme-chip{padding:10px 14px;border-radius:999px;border:1px solid var(--line);cursor:pointer}
.theme-chip.active{outline:2px solid var(--brand1)}
.store-item{padding:14px;border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.03);margin-bottom:12px}
.notice{padding:14px 16px;border-radius:16px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35)}
.warning{padding:14px 16px;border-radius:16px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.35)}
@media (max-width: 900px){
  .hero-grid,.grid-4,.grid-3,.grid-2,.form-row,.result{grid-template-columns:1fr}
  .nav{align-items:flex-start;flex-direction:column}
}