# QualitetVerse – Next-Generation Commerce Platform

> **Strona produkcyjna:** https://uszefaqualitet.pl
> **Dokumentacja backendu:** [`backend/README.md`](backend/README.md)

## Opis projektu

QualitetVerse to zaawansowana platforma e-commerce łącząca:
- 🛒 **Marketplace B2B/B2C** – hurtownicy + detaliści + kupujący
- 🤖 **AI Tools** – generator sklepów, opisów produktów, pakietów marketingowych
- 🎯 **Creator Affiliate System** – linki afiliacyjne, prowizje, wypłaty
- 📱 **Social Commerce Feed** – posty, polubienia, komentarze, viral ranking
- 🎥 **Live Selling** – sprzedaż na żywo z czatem i pinowanymi produktami
- 🎮 **Gamification** – punkty, poziomy, odznaki, rankingi
- 🤝 **Collaborative Stores** – wieloosobowe sklepy z podziałem przychodów
- 📊 **Analytics & Admin** – pełny panel zarządzania

---

## Szybki start

### Docker Compose (zalecane)

```bash
cp backend/.env.example backend/.env   # uzupełnij DB_PASSWORD, JWT_SECRET
docker compose up --build
# API dostępne pod http://localhost:3000
# Frontend dostępny pod http://localhost:8080 (lub otwórz index.html bezpośrednio)
```

### Lokalnie

```bash
cd backend
npm install
cp .env.example .env          # uzupełnij dane DB, JWT_SECRET, opcjonalnie OPENAI_API_KEY
createdb hurtdetal_qualitet   # PostgreSQL musi być uruchomiony
npm run migrate               # zastosuj migracje SQL
npm run seed:owner            # utwórz konto właściciela platformy
npm run dev                   # serwer na http://localhost:3000
```

### Testy

```bash
cd backend && npm test        # 528 testów (Jest + supertest, bez potrzeby PostgreSQL)
```

---

## Konfiguracja środowiska

Skopiuj `backend/.env.example` do `backend/.env` i uzupełnij:

| Zmienna | Opis | Wymagana |
|---------|------|----------|
| `JWT_SECRET` | Sekret do podpisywania tokenów JWT | ✅ |
| `DB_HOST`, `DB_NAME`, etc. | Dane połączenia z PostgreSQL | ✅ |
| `STRIPE_SECRET_KEY` | Klucz Stripe do płatności | Opcjonalna |
| `STRIPE_WEBHOOK_SECRET` | Sekret webhooka Stripe | Opcjonalna |
| `OPENAI_API_KEY` | Klucz OpenAI do funkcji AI (fallback: mock) | Opcjonalna |
| `SMTP_HOST`, `SMTP_USER`, etc. | Konfiguracja SMTP do e-maili | Opcjonalna |

---

## Migracje bazy danych

```bash
cd backend && npm run migrate
```

| Migracja | Opis |
|----------|------|
| `001-002` | Schemat bazowy: users, stores, products, orders, payments |
| `003-009` | Katalog centralny, kategorie, ceny, tiery |
| `010-015` | Płatności, prowizje, program polecający |
| `016-017` | Ogłoszenia, social media dla sklepów |
| `018` | System afiliacyjny dla kreatorów |
| `019` | Moduł AI (konwersacje, generacje) |
| `020` | Live commerce (streamy, czat, zamówienia live) |
| `021` | Social commerce (posty, polubienia, komentarze, viral ranking) |
| `022` | Gamifikacja (punkty, odznaki, rankingi) |
| `023` | Sklepy kolaboracyjne (współpracownicy, podział przychodów) |

---

## API Endpoints

### Uwierzytelnianie

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/auth/register` | POST | Rejestracja |
| `/api/auth/login` | POST | Logowanie → token JWT |
| `/api/auth/me` | GET | Dane zalogowanego użytkownika |
| `/api/auth/me` | PUT | Aktualizacja profilu |

### Sklepy i produkty

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/stores` | GET/POST | Lista sklepów / utwórz sklep |
| `/api/shops/:slug` | GET | Publiczny profil sklepu |
| `/api/products` | GET/POST | Produkty z katalogu centralnego |
| `/api/shop-products` | GET/POST | Produkty w sklepach detalistów |
| `/api/my/store` | GET/PATCH | Mój sklep (seller dashboard) |
| `/api/my/store/products` | GET/POST | Produkty mojego sklepu |

### Zamówienia i płatności

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/orders` | GET/POST | Zamówienia |
| `/api/payments/:orderId/initiate` | POST | Inicjuj płatność (Stripe/Przelewy24) |
| `/api/payments/stripe/webhook` | POST | Webhook Stripe |

### Afiliacja i kreatorzy

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/affiliate/dashboard` | GET | Dashboard kreatora |
| `/api/affiliate/links` | GET/POST | Linki afiliacyjne |
| `/api/affiliate/click/:code` | GET | Śledzenie kliknięć |
| `/api/creator/register` | POST | Rejestracja kreatora |
| `/api/creator/stats` | GET | Statystyki kreatora |

### AI

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/ai/chat` | POST | Czat z asystentem AI |
| `/api/ai/product-description` | POST | Generuj opis produktu |
| `/api/ai/store-description` | POST | Generuj opis sklepu |
| `/api/ai/generate-store` | POST | Wygeneruj pełny sklep (nazwa, slogan, produkty) |
| `/api/ai/marketing-pack` | POST | Wygeneruj pakiet marketingowy |

### Social Commerce

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/social/feed` | GET | Feed postów |
| `/api/social/trending` | GET | Trending posty |
| `/api/social/posts` | POST | Utwórz post |
| `/api/social/posts/:id/like` | POST | Polub/odpolub |
| `/api/social/posts/:id/comment` | POST | Dodaj komentarz |
| `/api/social/posts/:id/share` | POST | Udostępnij |

### Gamifikacja

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/gamification/leaderboard` | GET | Ranking (global/weekly/monthly/sellers/creators) |
| `/api/gamification/my/level` | GET | Mój poziom |
| `/api/gamification/my/badges` | GET | Moje odznaki |
| `/api/gamification/my/points` | GET | Historia punktów |

### Live Commerce

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/live/streams` | GET/POST | Lista streamów / utwórz stream |
| `/api/live/streams/:id/status` | PATCH | Zmień status streamu |
| `/api/live/streams/:id/messages` | GET/POST | Czat live |
| `/api/live/streams/:id/products` | GET/POST | Pinowane produkty |
| `/api/live/streams/:id/orders` | POST | Złóż zamówienie z live |

### Sklepy kolaboracyjne

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/collaboration/invite` | POST | Zaproś współpracownika |
| `/api/collaboration/accept/:token` | POST | Zaakceptuj zaproszenie |
| `/api/collaboration/stores/:id/team` | GET | Lista zespołu |
| `/api/collaboration/my-stores` | GET | Moje sklepy (jako współpracownik) |
| `/api/collaboration/stores/:id/revenue-split` | GET/PUT | Podział przychodów |

---

## Frontend API client

Plik `js/api.js` udostępnia klienta REST API jako `window.QMApi`:

```html
<script>window.QM_API_BASE = 'https://api.uszefaqualitet.pl/api';</script>
<script src="js/api.js"></script>
<script>
  // Logowanie
  const { token, user } = await QMApi.Auth.login(email, password);

  // Koszyk
  const cart = await QMApi.Cart.get(storeId);
  await QMApi.Cart.addItem(storeId, productId, 1);

  // Zamówienie
  const order = await QMApi.Orders.create({
    store_id: storeId,
    items: [{ product_id, quantity: 1 }],
    shipping_address: '...',
  });
</script>
```

---

## Struktura projektu

```
/
├── backend/              # Node.js/Express REST API
│   ├── src/
│   │   ├── app.js        # Główny plik Express + health/readiness
│   │   ├── config/       # Klient PostgreSQL
│   │   ├── middleware/   # auth (JWT), errorHandler, rate-limit
│   │   ├── modules/      # Moduły: ai, auth, stores, products, orders, payments, affiliate
│   │   ├── routes/       # Routery: admin, live, social, gamification, collaboration...
│   │   ├── services/     # websocket, supplier-import
│   │   └── helpers/      # audit, promo
│   ├── migrations/       # Pliki SQL (001–023)
│   ├── tests/            # Jest + supertest (528 testów)
│   └── .env.example      # Szablon konfiguracji
├── js/                   # Frontend Vanilla JS (QMApi client, flow, cart)
├── css/                  # Stylesheets (qualitetverse.css, styles.css)
├── *.html                # Strony PWA
├── docker-compose.yml    # Docker Compose (API + PostgreSQL)
└── service-worker.js     # PWA Service Worker
```

---

## Bezpieczeństwo

- ✅ JWT authentication (role: buyer, seller, creator, admin, owner)
- ✅ Rate limiting (globalne + na endpointach auth)
- ✅ Helmet security headers
- ✅ CORS z whitelist
- ✅ express-validator na wszystkich endpointach
- ✅ Parametryzowane zapytania SQL (brak SQL injection)
- ✅ bcryptjs do haszowania haseł

---

## Licencja

Projekt prywatny – wszelkie prawa zastrzeżone.
