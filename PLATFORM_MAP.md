# Qualitet Platform – Mapa Platformy

> Ostatnia aktualizacja: 2025-07  
> Wersja architektury: v2.0 (Social + Gamification + Collaboration)

---

## Legenda statusów

| Symbol | Znaczenie |
|--------|-----------|
| ✅ | Zaimplementowane |
| 🔄 | W trakcie realizacji |
| 📋 | Zaplanowane |

---

## 1. Mapa Modułów Technicznych

### 1.1 CORE – Rdzeń platformy

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Uwierzytelnianie (JWT) | ✅ | `routes/auth.js` `/api/auth/*` | `login.html`, `js/api.js` |
| Role użytkowników (buyer/seller/admin/owner) | ✅ | `middleware/auth.js` | `dashboard.html` |
| Profile użytkowników | ✅ | `routes/users.js` `/api/users/*` | `dashboard.html` |
| Powiadomienia | ✅ | `routes/scripts.js` | `dashboard.html` |
| Ustawienia platformy | ✅ | `routes/admin.js` `/api/admin/settings` | `owner-panel.html` |

**Podsumowanie:** ✅ 5 / 📋 0

---

### 1.2 MARKETPLACE – Sklep i zakupy

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Strona główna | ✅ | `routes/products.js`, `routes/stores.js` | `index.html` |
| Listing sklepów | ✅ | `routes/shops.js` `/api/shops/*` | `listing.html` |
| Listing produktów | ✅ | `routes/products.js` `/api/products/*` | `listing.html`, `qualitetmarket.html` |
| Strona produktu | ✅ | `routes/products.js` `/api/products/:id` | `sklep.html` |
| Koszyk | ✅ | `routes/cart.js` `/api/cart/*` | `koszyk.html`, `js/cart.js` |
| Checkout | ✅ | `routes/orders.js` `/api/orders/*` | `koszyk.html` |
| Potwierdzenie zamówienia | ✅ | `routes/orders.js` | `koszyk.html` |

**Podsumowanie:** ✅ 7 / 📋 0

---

### 1.3 SELLER – Panel sprzedawcy

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Dashboard sprzedawcy | ✅ | `routes/my.js` `/api/my/*` | `dashboard.html` |
| Zarządzanie produktami | ✅ | `routes/my.js`, `routes/shop-products.js` | `panel-sklepu.html`, `generator-sklepu.html` |
| Zarządzanie zamówieniami | ✅ | `routes/orders.js` `/api/orders/*` | `dashboard.html` |
| Klienci (CRM) | ✅ | `routes/my.js` | `crm.html` |
| Analityka sklepu | ✅ | `routes/analytics.js` `/api/analytics/*` | `dashboard.html` |
| Ustawienia sklepu | ✅ | `routes/store.js` `/api/store/*` | `generator-sklepu.html` |
| Subskrypcje | ✅ | `routes/subscriptions.js` `/api/subscriptions/*` | `cennik.html` |

**Podsumowanie:** ✅ 7 / 📋 0

---

### 1.4 AI – Moduły sztucznej inteligencji

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Generator sklepu AI | ✅ | `routes/store.js` | `generator-sklepu.html` |
| Opisy produktów AI | ✅ | `routes/my.js` `/api/my/ai/*` | `panel-sklepu.html` |
| Generator marketingu AI | ✅ | `routes/my.js` | `dashboard.html` |
| Analiza trendów AI | ✅ | `routes/analytics.js` | `intelligence.html` |
| Sugestie cen AI | ✅ | `routes/my.js` | `panel-sklepu.html` |
| Rekomendacje biznesowe AI | ✅ | `routes/my.js` | `dashboard.html` |
| Asystent czat AI | ✅ | `routes/my.js` | `dashboard.html` |
| AI Creator Studio | ✅ | `routes/creator.js` | `affiliate.html` |

**Podsumowanie:** ✅ 8 / 📋 0

---

### 1.5 AFFILIATE/CREATOR – Program partnerski

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Onboarding creatora | ✅ | `routes/affiliate.js` `/api/affiliate/*` | `zarabiaj.html` |
| Dashboard creatora | ✅ | `routes/creator.js` `/api/creator/*` | `affiliate.html` |
| Linki afiliacyjne | ✅ | `routes/affiliate.js` | `affiliate.html` |
| Śledzenie kliknięć | ✅ | `routes/affiliate.js` `/api/affiliate/click/:code` | `affiliate.html` |
| Śledzenie konwersji | ✅ | `routes/affiliate.js` | `affiliate.html` |
| Prowizje | ✅ | `routes/affiliate.js` | `affiliate.html` |
| Wypłaty | ✅ | `routes/affiliate.js` `/api/affiliate/withdrawals` | `affiliate.html` |
| Ranking creatorów | 📋 | `routes/affiliate.js` | `affiliate.html` |
| System polecający (referral) | ✅ | `routes/referral.js` `/api/referral/*` | `dashboard.html` |

**Podsumowanie:** ✅ 8 / 📋 1

---

### 1.6 SOCIAL COMMERCE – Handel społecznościowy

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Feed produktów | ✅ | `routes/social.js` `GET /api/social/feed` | `social.html` |
| Polubienia | ✅ | `routes/social.js` `POST /api/social/posts/:id/like` | `social.html` |
| Komentarze | ✅ | `routes/social.js` `POST /api/social/posts/:id/comments` | `social.html` |
| Udostępnianie | 📋 | – | `social.html` |
| Strona trendów | ✅ | `routes/social.js` `GET /api/social/trending` | `social.html` |
| Wirusowe produkty | 📋 | – | `social.html` |
| Rankingi | ✅ | `routes/social.js` `GET /api/social/rankings` | `social.html` |

**Migracja DB:** `migrations/020_social_commerce.sql`  
**Podsumowanie:** ✅ 5 / 📋 2

---

### 1.7 LIVE COMMERCE – Handel na żywo

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Lista transmisji live | 📋 | – | – |
| Odtwarzacz live | 📋 | – | – |
| Chat live | 📋 | – | – |
| Przypięte produkty | 📋 | – | – |
| Natychmiastowy zakup z live | 📋 | – | – |
| Oferty live | 📋 | – | – |

**Podsumowanie:** ✅ 0 / 📋 6

---

### 1.8 GAMIFICATION – Grywalizacja

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Punkty użytkownika | ✅ | `routes/gamification.js` `GET /api/gamification/my/points` | `gamification.html` |
| Poziomy | ✅ | `routes/gamification.js` (computeLevel) | `gamification.html` |
| Odznaki | ✅ | `routes/gamification.js` `GET /api/gamification/badges` | `gamification.html` |
| Tabele liderów | ✅ | `routes/gamification.js` `GET /api/gamification/leaderboard` | `gamification.html` |
| Nagrody | 📋 | – | `gamification.html` |
| System postępu | 📋 | – | `gamification.html` |

**Migracja DB:** `migrations/021_gamification.sql`  
**Podsumowanie:** ✅ 4 / 📋 2

---

### 1.9 COLLABORATION – Współpraca zespołowa

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Sklepy wspólne | ✅ | `routes/collaboration.js` `GET/POST /api/collaboration/stores` | `collaboration.html` |
| Role zespołowe | ✅ | `routes/collaboration.js` (owner/admin/member) | `collaboration.html` |
| Zaproszenia | ✅ | `routes/collaboration.js` `POST /api/collaboration/stores/:id/invite` | `collaboration.html` |
| Podział przychodów | ✅ | `routes/collaboration.js` `GET/PUT /api/collaboration/stores/:id/revenue` | `collaboration.html` |
| Logi aktywności | ✅ | `routes/collaboration.js` `GET /api/collaboration/stores/:id/activity` | `collaboration.html` |

**Migracja DB:** `migrations/022_collaboration.sql`  
**Podsumowanie:** ✅ 5 / 📋 0

---

### 1.10 ADMIN – Panel administracyjny

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Dashboard admina | ✅ | `routes/admin.js` `/api/admin/*` | `operator-panel.html` |
| Zarządzanie użytkownikami | ✅ | `routes/admin.js` `/api/admin/users` | `operator-panel.html` |
| Zarządzanie sklepami | ✅ | `routes/admin.js` `/api/admin/stores` | `operator-panel.html` |
| Moderacja produktów | ✅ | `routes/admin.js` `/api/admin/products` | `operator-panel.html` |
| Moderacja treści | 📋 | – | – |
| Zarządzanie afiliacją | ✅ | `routes/admin.js`, `routes/affiliate.js` | `operator-panel.html` |
| Zarządzanie płatnościami | ✅ | `routes/payments.js` `/api/payments/*` | `owner-panel.html` |
| Raporty | ✅ | `routes/admin.js` `/api/admin/reports` | `owner-panel.html` |
| Ustawienia platformy | ✅ | `routes/admin.js` `/api/admin/settings` | `owner-panel.html` |

**Podsumowanie:** ✅ 8 / 📋 1

---

### 1.11 PAYMENTS – Płatności

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Stripe checkout | ✅ | `routes/payments.js` `/api/payments/checkout` | `koszyk.html` |
| Webhooki | ✅ | `routes/payments.js` `/api/payments/webhook` | – |
| Historia płatności | ✅ | `routes/payments.js` `/api/payments/history` | `dashboard.html` |
| Faktury | 📋 | – | – |
| Zwroty | 📋 | – | – |
| Billing sprzedawcy | 📋 | – | – |

**Podsumowanie:** ✅ 3 / 📋 3

---

### 1.12 ANALYTICS – Analityka

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Śledzenie zdarzeń | ✅ | `routes/analytics.js` `/api/analytics/events` | `js/app.js` |
| Analityka sklepu | ✅ | `routes/analytics.js` `/api/analytics/store` | `dashboard.html` |
| Analityka produktów | ✅ | `routes/analytics.js` `/api/analytics/products` | `panel-sklepu.html` |
| Analityka creatora | ✅ | `routes/creator.js` `/api/creator/analytics` | `affiliate.html` |
| Źródła ruchu | 📋 | – | – |
| Konwersje | ✅ | `routes/analytics.js` | `dashboard.html` |
| Silnik trendów | ✅ | `routes/analytics.js`, `routes/social.js` | `intelligence.html` |

**Podsumowanie:** ✅ 6 / 📋 1

---

### 1.13 MOBILE – Aplikacja mobilna / PWA

| Funkcja | Status | Backend | Frontend |
|---------|--------|---------|----------|
| Home mobile | 📋 | – | – |
| Dashboard sprzedawcy mobile | 📋 | – | – |
| Dashboard creatora mobile | 📋 | – | – |
| AI Center mobile | 📋 | – | – |
| Push notifications | 📋 | – | `service-worker.js` |
| Live commerce mobile | 📋 | – | – |

**Podsumowanie:** ✅ 0 / 📋 6

---

## 2. Zestawienie statusów per moduł

| Moduł | ✅ Gotowe | 📋 Planowane | % gotowości |
|-------|-----------|--------------|-------------|
| CORE | 5 | 0 | 100% |
| MARKETPLACE | 7 | 0 | 100% |
| SELLER | 7 | 0 | 100% |
| AI | 8 | 0 | 100% |
| AFFILIATE/CREATOR | 8 | 1 | 89% |
| SOCIAL COMMERCE | 5 | 2 | 71% |
| LIVE COMMERCE | 0 | 6 | 0% |
| GAMIFICATION | 4 | 2 | 67% |
| COLLABORATION | 5 | 0 | 100% |
| ADMIN | 8 | 1 | 89% |
| PAYMENTS | 3 | 3 | 50% |
| ANALYTICS | 6 | 1 | 86% |
| MOBILE | 0 | 6 | 0% |
| **RAZEM** | **66** | **22** | **75%** |

---

## 3. Zależności modułów

```
CORE (auth, roles, profiles)
 ├── MARKETPLACE        – wymaga: CORE
 │    └── PAYMENTS      – wymaga: CORE, MARKETPLACE
 ├── SELLER             – wymaga: CORE, MARKETPLACE
 │    ├── ANALYTICS     – wymaga: CORE, SELLER, MARKETPLACE
 │    ├── COLLABORATION – wymaga: CORE, SELLER
 │    └── AI            – wymaga: CORE, SELLER
 ├── AFFILIATE/CREATOR  – wymaga: CORE, MARKETPLACE, ANALYTICS
 │    └── SOCIAL COMMERCE – wymaga: CORE, MARKETPLACE, AFFILIATE
 │         └── LIVE COMMERCE – wymaga: CORE, SOCIAL COMMERCE
 ├── GAMIFICATION       – wymaga: CORE (punkty przyznawane przez wszystkie moduły)
 ├── ADMIN              – wymaga: wszystkich modułów
 └── MOBILE             – wymaga: wszystkich modułów frontend
```

### Zależności szczegółowe

| Moduł | Zależy od | Wymagane tabele DB |
|-------|-----------|--------------------|
| SOCIAL COMMERCE | auth, products, stores | `social_posts`, `post_likes`, `post_comments` |
| GAMIFICATION | auth | `user_points_log`, `badge_definitions`, `user_badges` |
| COLLABORATION | auth, stores | `collaborative_stores`, `team_members`, `team_invitations`, `revenue_shares`, `team_activity_logs` |
| AFFILIATE | auth, products, orders | `affiliate_creators`, `affiliate_links`, `affiliate_clicks`, `affiliate_conversions` |
| PAYMENTS | auth, orders, subscriptions | `payments`, `stripe_webhooks` |
| ANALYTICS | auth, products, orders, affiliate | `analytics_events` |

---

## 4. Struktura plików – Backend & Frontend

### 4.1 Backend (`backend/src/`)

```
backend/src/
├── app.js                        # Główny plik Express – rejestracja tras
├── config/
│   └── database.js               # Klient PostgreSQL (pool)
├── middleware/
│   ├── auth.js                   # authenticate(), requireRole(), requireActiveSubscription()
│   ├── validate.js               # Wrapper express-validator
│   └── rate-limit.js             # Rate limiting
├── routes/
│   ├── auth.js                   # POST /api/auth/register, /login, /refresh
│   ├── users.js                  # GET/PUT /api/users/:id
│   ├── products.js               # CRUD /api/products/*
│   ├── orders.js                 # CRUD /api/orders/*
│   ├── cart.js                   # GET/POST/DELETE /api/cart/*
│   ├── stores.js                 # GET /api/stores/*
│   ├── shops.js                  # GET /api/shops/*
│   ├── store.js                  # PUT /api/store/* (seller's own store)
│   ├── shop-products.js          # CRUD /api/shop-products/*
│   ├── my.js                     # /api/my/* (seller dashboard)
│   ├── subscriptions.js          # /api/subscriptions/*
│   ├── payments.js               # /api/payments/*
│   ├── analytics.js              # /api/analytics/*
│   ├── affiliate.js              # /api/affiliate/*
│   ├── creator.js                # /api/creator/*
│   ├── referral.js               # /api/referral/*
│   ├── referrals.js              # /api/referrals/*
│   ├── social.js                 # /api/social/*        ← NOWE
│   ├── gamification.js           # /api/gamification/*  ← NOWE
│   ├── collaboration.js          # /api/collaboration/* ← NOWE
│   ├── suppliers.js              # /api/suppliers/*
│   ├── categories.js             # /api/categories/*
│   ├── admin.js                  # /api/admin/*
│   └── scripts.js                # Narzędzia skryptowe
└── helpers/
    └── audit.js                  # auditLog(), computeSellingPrice()
```

### 4.2 Frontend (`/`)

```
/
├── index.html              # Strona główna marketplace
├── login.html              # Logowanie / rejestracja
├── dashboard.html          # Dashboard sprzedawcy
├── generator-sklepu.html   # Kreator sklepu AI
├── panel-sklepu.html       # Zarządzanie produktami
├── listing.html            # Listing produktów / sklepów
├── sklep.html              # Strona sklepu / produktu
├── koszyk.html             # Koszyk i checkout
├── affiliate.html          # Creator Dashboard – afiliacja
├── zarabiaj.html           # Onboarding creatora
├── linki-sprzedazowe.html  # Linki sprzedażowe
├── hurtownie.html          # Hurtownie / dostawcy
├── qualitetmarket.html     # QualitetMarket listing
├── cennik.html             # Cennik i subskrypcje
├── crm.html                # CRM – klienci
├── intelligence.html       # AI – analiza trendów
├── social.html             # Social Commerce Feed     ← NOWE
├── gamification.html       # Grywalizacja / osiągnięcia ← NOWE
├── collaboration.html      # Zespoły i współpraca    ← NOWE
├── operator-panel.html     # Panel operatora (admin)
├── owner-panel.html        # Panel właściciela (owner)
├── tasks.html              # Zadania
├── stores.html             # Lista sklepów
├── market-landing.html     # Landing marketplace
├── zostan-dostawca.html    # Zostań dostawcą
├── js/
│   ├── api.js              # window.QMApi – klient REST API
│   ├── api-client.js       # window.QualitetAPI shim
│   ├── app.js              # Główna logika PWA
│   ├── pwa-connect.js      # Mostek frontend–backend
│   ├── flow.js             # Koordynator przepływów
│   └── cart.js             # Logika koszyka
├── css/
│   └── style.css           # Globalne style
├── panel.css               # Style panelu (dashboard)
├── styles.css              # Import z css/style.css + overrides
├── shop.css                # Style sklepu
├── landing.css             # Style landingu
└── service-worker.js       # PWA / tryb offline
```

---

## 5. Roadmapa implementacji

### Faza 1 – MVP (✅ Ukończona)

**Czas trwania:** Q1–Q2 2025  
**Zakres:**

- [x] CORE: auth, role, profile
- [x] MARKETPLACE: homepage, listing produktów/sklepów, koszyk, checkout
- [x] SELLER: dashboard, zarządzanie produktami, zamówieniami
- [x] PAYMENTS: Stripe checkout, webhooki
- [x] ADMIN: panel admina, moderacja, ustawienia
- [x] SUBSCRIPTIONS: plany trial/basic/pro/elite

**Wynik:** Działająca platforma B2B/B2C z podstawowym marketplace.

---

### Faza 2 – Growth (✅ Ukończona)

**Czas trwania:** Q2–Q3 2025  
**Zakres:**

- [x] AI: generator sklepu, opisy produktów, marketing, trendy, ceny, rekomendacje, asystent
- [x] AFFILIATE/CREATOR: onboarding, dashboard, linki, śledzenie, prowizje, wypłaty
- [x] ANALYTICS: śledzenie zdarzeń, analityka sklepu/produktów/creatora, konwersje, trendy
- [x] REFERRAL: system polecający, kody, statystyki

**Wynik:** Kompletny program partnerski i AI-powered seller tools.

---

### Faza 3 – Social & Engagement (🔄 W trakcie / ✅ Core ukończone)

**Czas trwania:** Q3 2025  
**Zakres:**

- [x] SOCIAL COMMERCE: feed, polubienia, komentarze, trendy, rankingi
- [x] GAMIFICATION: punkty, poziomy, odznaki, tabela liderów
- [x] COLLABORATION: sklepy wspólne, role, zaproszenia, podział przychodów

**Do ukończenia:**
- [ ] SOCIAL: udostępnianie postów, wirusowe produkty
- [ ] GAMIFICATION: nagrody, system postępu
- [ ] AFFILIATE: ranking creatorów

**Szacowany czas ukończenia fazy 3:** Q3 2025

---

### Faza 4 – Scale (📋 Planowana)

**Czas trwania:** Q4 2025 – Q1 2026  
**Zakres:**

- [ ] LIVE COMMERCE: transmisje, czat, kupowanie z live, oferty live
- [ ] PAYMENTS: faktury, zwroty, billing sprzedawcy
- [ ] MOBILE: dedykowane widoki PWA, push notifications
- [ ] ADMIN: moderacja treści
- [ ] ANALYTICS: źródła ruchu

**Szacowany czas:** 4–6 miesięcy

---

## 6. Podział MVP vs Post-MVP

### MVP (Fazy 1–2)

Funkcje kluczowe do uruchomienia platformy:

| Moduł | Funkcje |
|-------|---------|
| CORE | Rejestracja, logowanie, role |
| MARKETPLACE | Strona główna, listing, koszyk, checkout, zamówienia |
| SELLER | Dashboard, produkty, zamówienia, subskrypcje |
| ADMIN | Zarządzanie użytkownikami, moderacja, raporty |
| PAYMENTS | Stripe checkout, webhooki, historia |
| AI | Generator sklepu, opisy produktów |
| AFFILIATE | Linki, śledzenie, prowizje |

### Post-MVP (Fazy 3–4)

Funkcje wzrostu i zaangażowania:

| Moduł | Funkcje | Priorytet |
|-------|---------|-----------|
| SOCIAL COMMERCE | Feed, trendy, rankingi, udostępnianie | Wysoki |
| GAMIFICATION | Punkty, odznaki, leaderboard, nagrody | Wysoki |
| COLLABORATION | Sklepy wspólne, zespoły, podział przychodów | Wysoki |
| LIVE COMMERCE | Transmisje live, chat, kupowanie | Średni |
| MOBILE | PWA mobile, push notifications | Średni |
| PAYMENTS | Faktury, zwroty, billing | Niski–Średni |
| ANALYTICS | Źródła ruchu | Niski |

---

## 7. Schemat bazy danych – tabele per moduł

| Moduł | Tabele DB | Migracja |
|-------|-----------|----------|
| CORE | `users`, `sessions` | `001_initial_schema.sql` |
| MARKETPLACE | `products`, `orders`, `order_items`, `cart_items` | `002_extended_schema.sql` |
| SELLER | `stores`, `shop_products`, `store_settings` | `004_central_catalog.sql` |
| SUBSCRIPTIONS | `subscriptions`, `subscription_plans` | `006_subscription_marketplace.sql` |
| PAYMENTS | `payments`, `payment_webhooks` | `010_payments_provider.sql` |
| AFFILIATE | `affiliate_creators`, `affiliate_links`, `affiliate_clicks`, `affiliate_conversions`, `affiliate_withdrawals` | `018_affiliate_creators.sql` |
| ANALYTICS | `analytics_events`, `referral_codes`, `referral_uses` | `014_referral_analytics_scripts.sql` |
| AI | `ai_store_configs`, `ai_generated_content` | `019_ai_module.sql` |
| SOCIAL | `social_posts`, `post_likes`, `post_comments` | `020_social_commerce.sql` |
| GAMIFICATION | `user_points_log`, `badge_definitions`, `user_badges` | `021_gamification.sql` |
| COLLABORATION | `collaborative_stores`, `team_members`, `team_invitations`, `revenue_shares`, `team_activity_logs` | `022_collaboration.sql` |

---

## 8. Endpointy API – podsumowanie

### Publiczne (bez autentykacji)

```
GET  /api/products              – lista produktów
GET  /api/products/:id          – produkt
GET  /api/stores                – lista sklepów
GET  /api/stores/:slug          – sklep
GET  /api/categories            – kategorie
GET  /api/social/feed           – feed społecznościowy
GET  /api/social/posts/:id      – post
GET  /api/social/posts/:id/comments – komentarze
GET  /api/social/trending       – trendy
GET  /api/social/rankings       – rankingi produktów
GET  /api/gamification/badges   – katalog odznak
GET  /api/gamification/leaderboard – tabela liderów
```

### Zalogowany użytkownik (Bearer JWT)

```
POST /api/auth/login            – logowanie
POST /api/auth/register         – rejestracja
GET  /api/cart                  – koszyk
POST /api/orders                – złóż zamówienie
POST /api/social/posts          – utwórz post
POST /api/social/posts/:id/like – polub/odpolub
POST /api/social/posts/:id/comments – dodaj komentarz
GET  /api/gamification/my/points   – moje punkty i poziom
GET  /api/gamification/my/badges   – moje odznaki
GET  /api/collaboration/stores     – moje sklepy wspólne
POST /api/collaboration/stores     – utwórz sklep wspólny
POST /api/collaboration/stores/:id/invite – wyślij zaproszenie
POST /api/collaboration/invite/accept     – przyjmij zaproszenie
GET  /api/referral/my-code      – mój kod polecający
GET  /api/referral/stats        – statystyki polecania
```

### Sprzedawca (seller)

```
GET  /api/my/dashboard          – dashboard
GET/POST/PUT/DELETE /api/my/products – produkty
GET  /api/my/orders             – zamówienia
GET  /api/my/customers          – klienci
GET  /api/my/analytics          – analityka
GET  /api/creator/dashboard     – dashboard creatora
GET  /api/affiliate/links       – linki afiliacyjne
POST /api/affiliate/links       – utwórz link
```

### Admin / Owner

```
GET  /api/admin/users           – użytkownicy
PUT  /api/admin/users/:id       – edytuj użytkownika
GET  /api/admin/stores          – sklepy
GET  /api/admin/products        – produkty (moderacja)
GET  /api/admin/reports         – raporty
POST /api/gamification/award    – przyznaj punkty (admin)
```

---

*Dokument wygenerowany automatycznie na podstawie struktury kodu źródłowego.*  
*Repozytorium: HurtDetalUszefaQUALITET | Platforma: Qualitet Platform v2.0*
