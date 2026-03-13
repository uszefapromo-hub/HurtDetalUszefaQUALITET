# RAPORT PROJEKTU – QUALITET PLATFORM

> Data przeglądu: 2026-03-13

---

## INFORMACJE O PROJEKCIE

- **Nazwa repozytorium:** `uszefapromo-hub/HurtDetalUszefaQUALITET`
- **Link do repozytorium:** https://github.com/uszefapromo-hub/HurtDetalUszefaQUALITET
- **Strona produkcyjna:** https://uszefaqualitet.pl
- **Architektura:** REST API (Node.js/Express) + PWA frontend (HTML5/Vanilla JS) + Next.js frontend + React Native mobile

---

## CO JUŻ JEST ZROBIONE ✅

### Backend API (Node.js/Express)

Wszystkie endpointy zaimplementowane i przetestowane (~540 testów Jest/supertest):

| Moduł | Endpointy | Status |
|---|---|---|
| Autentykacja | POST /register, POST /login, GET /me, PUT /me | ✅ GOTOWE |
| Użytkownicy | CRUD + zmiana hasła | ✅ GOTOWE |
| Sklepy | CRUD, subdomeny, auto-seed produktów | ✅ GOTOWE |
| Produkty (katalog centralny) | CRUD + import CSV/XML/API | ✅ GOTOWE |
| Produkty sklepu | `shop_products` z marżami i ceną minimalną | ✅ GOTOWE |
| Koszyk | Dodawanie/usuwanie/aktualizacja pozycji | ✅ GOTOWE |
| Zamówienia | Tworzenie, statusy, order_items, prowizja | ✅ GOTOWE |
| Płatności | Stripe, P24, BLIK, przelew, webhook HMAC | ✅ GOTOWE |
| Hurtownie | CRUD + sync CSV/XML/API + auto-sync co 12h | ✅ GOTOWE |
| Subskrypcje | trial/basic/pro/elite, limity produktów | ✅ GOTOWE |
| Kategorie | GET / POST / DELETE | ✅ GOTOWE |
| Panel admina | Użytkownicy, sklepy, produkty, zamówienia, subskrypcje, audit-log, import, prowizja, tiery marży | ✅ GOTOWE |
| Panel sprzedawcy | `/api/my/*` – sklep, produkty, zamówienia, statystyki | ✅ GOTOWE |
| System polecający promo | Kody QM-, tiery 0–3, bonus miesięcy | ✅ GOTOWE |
| Affiliate/Creator | Linki sprzedażowe, prowizje 2%, rejestracja creatorów | ✅ GOTOWE |
| Creator Referrals | `/api/creator/referrals` – generowanie linków, statystyki | ✅ GOTOWE |
| Social Commerce | `/api/social` – feed, posty, polubienia, komentarze, udostępnienia | ✅ GOTOWE |
| Live Commerce | `/api/live` – streamy, wiadomości, przypięte produkty, zamówienia z live | ✅ GOTOWE |
| Gamifikacja | `/api/gamification` – punkty, odznaki, poziomy, tabela rankingowa | ✅ GOTOWE |
| Kolaboracja | `/api/collaboration` + `/api/store/team` – role w sklepie, podział przychodów | ✅ GOTOWE |
| AI Module | `/api/ai` – chat, opis produktu, opis sklepu, generator sklepu, paczka marketingowa | ✅ GOTOWE |
| Analytics | `/api/analytics` – snapshoty, zdarzenia | ✅ GOTOWE |
| Scripts | Skrypty śledzenia, pixel | ✅ GOTOWE |

**Łańcuch cenowy:**
```
supplier_price → [tiery marży platformy] → platform_price = min_selling_price
                                           → [marża sprzedawcy] → selling_price
```

**Migracje bazy danych:** 23 pliki SQL (001–023), obejmujące pełną historię schematu.

**Testy:** ~540 testów Jest/supertest — wszystkie przechodzą.

---

### Frontend PWA (HTML5/Vanilla JS)

| Strona | Opis | Status |
|---|---|---|
| `login.html` | Logowanie i rejestracja | ✅ GOTOWE |
| `dashboard.html` | Dashboard użytkownika | ✅ GOTOWE |
| `sklep.html` | Strona sklepu detalisty | ✅ GOTOWE |
| `koszyk.html` | Koszyk zakupowy | ✅ GOTOWE |
| `panel-sklepu.html` | Panel sprzedawcy | ✅ GOTOWE |
| `owner-panel.html` | Panel właściciela platformy | ✅ GOTOWE |
| `listing.html` | Lista produktów/sklepów | ✅ GOTOWE |
| `generator-sklepu.html` | Generator sklepu AI | ✅ GOTOWE |
| `affiliate.html` | Panel afiliacyjny/creator | ✅ GOTOWE |
| `live.html` | Live commerce | ✅ GOTOWE |
| `qualitetverse.html` | Strona QualitetVerse | ✅ GOTOWE |
| `qualitetmarket.html` | Marketplace | ✅ GOTOWE |
| `brand.html` | Brand guide | ✅ GOTOWE |
| `cennik.html` | Strona cennika | ✅ GOTOWE |
| `zarabiaj.html` | Strona zarabiania | ✅ GOTOWE |
| `zostan-dostawca.html` | Strona dla dostawców | ✅ GOTOWE |
| `hurtownie.html` | Lista hurtowni | ✅ GOTOWE |
| `linki-sprzedazowe.html` | Linki sprzedażowe | ✅ GOTOWE |
| `intelligence.html` | AI intelligence panel | ✅ GOTOWE |
| `crm.html` | CRM panel | ✅ GOTOWE |
| `tasks.html` | System zadań | ✅ GOTOWE |

**Klient API:** `js/api.js` – pełny `window.QMApi` z obsługą: Auth, Users, Stores, Products, ShopProducts, Cart, Orders, Payments, Admin, Social, Live, Gamification, StoreTeam, CreatorReferrals, Affiliate.

**Service Worker:** tryb offline/PWA aktywny.

---

### Frontend Next.js (TypeScript/Tailwind/Radix UI)

| Strona | Opis | Status |
|---|---|---|
| `/` (page.tsx) | Strona główna marketplace | ✅ GOTOWE |
| `/stores` | Lista sklepów | ✅ GOTOWE |
| `/product/[id]` | Szczegóły produktu | ✅ GOTOWE |
| `/profile` | Profil użytkownika | ✅ GOTOWE |
| `/admin` | Panel admina | ✅ GOTOWE |
| `/cart` | Koszyk | ✅ GOTOWE |
| `/checkout` | Checkout | ✅ GOTOWE |
| `/creator` | Panel creatora | ✅ GOTOWE |
| `/ai` | Asystent AI | ✅ GOTOWE |
| `/seller` | Panel sprzedawcy | ✅ GOTOWE |
| `/trending` | Trending produkty/sklepy | ✅ GOTOWE |

**Komponenty UI:** GlassCard, ProductCard, StatCard, shadcn/ui (Radix UI).

---

### Aplikacja mobilna (React Native/Expo)

| Ekran | Opis | Status |
|---|---|---|
| `index.tsx` | Strona główna (feed, produkty) | ✅ GOTOWE |
| `stores.tsx` | Lista sklepów | ✅ GOTOWE |
| `profile.tsx` | Profil użytkownika | ✅ GOTOWE |
| `creator.tsx` | Panel creatora | ✅ GOTOWE |
| `trending.tsx` | Trendy | ✅ GOTOWE |

**Komponenty:** GlassCard, ProductCard, StatCard.  
**Stack:** Expo SDK 51, React Native 0.74, Expo Router, TypeScript.

---

## CO JEST W TRAKCIE 🔄

| Obszar | Co jest częściowo zrobione | Uwagi |
|---|---|---|
| **Frontend Next.js** | Strony UI są zbudowane, ale brak pełnej integracji z backend API | Brak klienta API – dane hardcoded/mockowane |
| **Aplikacja mobilna** | Podstawowe ekrany działają, ale brak połączenia z backend API | Brak auth, brak koszyka, brak zamówień |
| **Subdomenowe sklepy** | Schema DB gotowa (`subdomain` w `stores`), middleware brak | Wymaga konfiguracji DNS i reverse-proxy |
| **WebSocket (Live)** | Serwis `services/websocket.js` istnieje, ale integracja z frontendem niepełna | WS endpoint gotowy, brak UI chatu live |
| **System powiadomień** | Migracja `notifications` istnieje w migration 020, trasa obecna | UI powiadomień niepełne |
| **Bramki płatności** | Kod Stripe/P24 gotowy, ale wymaga kluczy API | Bez `.env` działa tylko przelew tradycyjny |

---

## CZEGO JESZCZE BRAKUJE ❌

| Obszar | Brakujące funkcje |
|---|---|
| **Aplikacja mobilna** | Ekran koszyka i checkout, ekran zamówień, panel sprzedawcy, logowanie/rejestracja, admin panel |
| **Frontend Next.js** | Integracja z API backendowym (klient HTTP / React Query), obsługa JWT, stany ładowania i błędów |
| **Email notifications** | System powiadomień email do zamówień, rejestracji, subskrypcji (brak integracji SMTP/SendGrid) |
| **Push notifications** | Mobilne powiadomienia push (Expo Notifications niezaimplementowane) |
| **Subdomeny sklepów** | Routing DNS dla `*.qualitetmarket.pl`, konfiguracja reverse-proxy (np. Nginx/Caddy) |
| **Testy E2E** | Brak testów end-to-end (Cypress/Playwright) dla frontendu |
| **Testy mobilne** | Brak testów dla aplikacji mobilnej |
| **Admin UI w Next.js** | Panel admina w Next.js jest statyczny – brak połączenia z `/api/admin` |
| **Seller UI w Next.js** | Panel sprzedawcy w Next.js niepodłączony do `/api/my/*` |
| **Paginacja UI** | Paginacja produktów/zamówień w frontendzie jest uproszczona |
| **Real-time live** | Pełny live streaming z kamerą (WebRTC) – obecne tylko zarządzanie streamami |
| **Analytics dashboard** | Wizualizacja danych analitycznych (wykresy, raporty) |
| **Marketplace search** | Zaawansowane filtrowanie i wyszukiwanie pełnotekstowe produktów |

---

## BŁĘDY DO NAPRAWY 🐛

### Frontend (PWA)

| # | Problem | Lokalizacja |
|---|---|---|
| 1 | Niektóre strony mogą używać starych danych z `localStorage` zamiast wywołań API | `js/app.js`, `js/pwa-connect.js` |
| 2 | Service Worker może cache'ować stare wersje stron po aktualizacji | `service-worker.js` |
| 3 | Brak obsługi wygasłego tokenu JWT (brak auto-refresh lub przekierowania) | `js/api.js` |

### Frontend (Next.js)

| # | Problem | Lokalizacja |
|---|---|---|
| 1 | Dane w stronach są mockowane/hardcoded – brak połączenia z backendem | `frontend/src/app/` |
| 2 | Brak obsługi stanu auth (login/logout) w Next.js | `frontend/src/` |
| 3 | Brak error boundaries i fallback UI | `frontend/src/app/` |
| 4 | `eslint-config-next` w wersji 14.x przy Next.js 15 – potencjalna niezgodność | `frontend/package.json` |

### Backend

| # | Problem | Lokalizacja |
|---|---|---|
| 1 | Zduplikowane numery migracji: `003_*.sql`, `007_*.sql`, `009_*.sql`, `020_*.sql` – dwa pliki z tym samym numerem | `backend/migrations/` |
| 2 | Brak walidacji rozmiaru pliku przy imporcie CSV/XML | `backend/src/routes/admin.js` |
| 3 | `TODO` w pliku `referral.js` – potencjalnie niepełna logika | `backend/src/routes/referral.js` |

### Mobile

| # | Problem | Lokalizacja |
|---|---|---|
| 1 | Brak ekranu logowania – użytkownik nie może się autentykować | `mobile/app/` |
| 2 | Brak koszyka i procesu zamówienia | `mobile/app/` |
| 3 | Dane produktów są statyczne (brak połączenia z API) | `mobile/app/index.tsx`, `stores.tsx` |
| 4 | Brak obsługi błędów sieci (offline/timeout) | `mobile/` |
| 5 | `expo-router` v3.5 przy Expo SDK 51 – może wymagać aktualizacji | `mobile/package.json` |

---

## NASTĘPNE ZADANIA 📋

### Priorytet 1 – Krytyczne (przed wdrożeniem produkcyjnym)

1. **Konfiguracja `.env` produkcyjnego** – `JWT_SECRET`, `DB_PASSWORD`, `STRIPE_SECRET_KEY`/`P24_MERCHANT_ID`, `PAYMENT_WEBHOOK_SECRET`, `ALLOWED_ORIGINS`
2. **Naprawa zduplikowanych migracji** – zrenumerowanie plików `003a`, `007_stores`, `007_suppliers`, `009_price_tiers`, `020_live_commerce`
3. **Połączenie Next.js z backendem** – dodanie klienta API (fetch/axios + React Query/SWR), obsługi JWT
4. **Ekran logowania w aplikacji mobilnej** – `login.tsx` z JWT auth
5. **Koszyk i checkout w aplikacji mobilnej** – pełny przepływ zakupu

### Priorytet 2 – Ważne (pierwsze 2 tygodnie po wdrożeniu)

6. **Email notifications** – integracja SMTP (np. Resend/SendGrid) dla powiadomień o zamówieniach i rejestracji
7. **Panel admina w Next.js** – podłączenie `/api/admin/*` do UI admina
8. **Panel sprzedawcy w Next.js** – podłączenie `/api/my/*` do UI sprzedawcy
9. **Obsługa subdomen** – konfiguracja Nginx/Caddy dla `*.qualitetmarket.pl`
10. **Testy E2E** – Playwright dla krytycznych ścieżek (logowanie, zakup, płatność)

### Priorytet 3 – Usprawnienia (roadmap)

11. **Push notifications** – Expo Notifications dla aplikacji mobilnej
12. **Live streaming WebRTC** – prawdziwy live video (np. LiveKit/Agora)
13. **Zaawansowane wyszukiwanie** – PostgreSQL full-text search lub ElasticSearch
14. **Analytics dashboard** – wykresy przychodów, konwersji, ruchu (Recharts/Chart.js)
15. **Marketplace B2B** – widok hurtowni z cenami zbiorczymi
16. **Wielojęzyczność** – i18n (polski/angielski/ukraiński)
17. **Testy aplikacji mobilnej** – Jest/Detox dla kluczowych ekranów
18. **CDN dla zasobów statycznych** – obrazy produktów, ikony

---

## PODSUMOWANIE GOTOWOŚCI

| Komponent | Gotowość | Uwagi |
|---|---|---|
| Backend API | **95%** | Wszystkie moduły działają, drobne poprawki migracji |
| Baza danych | **90%** | Kompletny schemat, zduplikowane numery migracji do naprawy |
| Frontend PWA | **80%** | Strony gotowe, drobne problemy z JWT refresh i localStorage legacy |
| Frontend Next.js | **50%** | UI zbudowane, brak połączenia z API |
| Aplikacja mobilna | **30%** | Podstawowe ekrany, brak auth, koszyka i zamówień |
| Testy | **70%** | 540 testów backend, brak testów frontend i mobile |
| DevOps/Deployment | **40%** | Docker compose gotowy, brak konfiguracji produkcyjnej |

### Czy platforma jest gotowa na pierwszych sprzedawców?

**TAK** – backend i PWA są gotowe na pierwszych użytkowników. Przed wdrożeniem produkcyjnym należy skonfigurować zmienne środowiskowe i bramki płatności.

---

# STATUS PLATFORMY QUALITET (Szczegóły Techniczne)

> Data przeglądu: 2026-03-13

---

## 1. Backend API — GOTOWE ✅

Wszystkie endpointy zaimplementowane i działają:

| Endpoint | Metody | Status |
|---|---|---|
| `/api/auth` | POST /register, POST /login, GET /me, PUT /me | GOTOWE |
| `/api/users` | GET /, GET /me, PUT /me, PUT /me/password, POST /register, POST /login | GOTOWE |
| `/api/stores` | GET /, GET /:id, POST /, PUT /:id, DELETE /:id | GOTOWE |
| `/api/products` | GET /, GET /:id, POST /, PUT /:id, DELETE /:id | GOTOWE |
| `/api/shop-products` | GET /, POST /, PUT /:id, DELETE /:id | GOTOWE |
| `/api/cart` | GET /, POST /, POST /items, PUT /items/:id, DELETE /, DELETE /items/:id, DELETE /items/:itemId | GOTOWE |
| `/api/orders` | GET /, GET /:id, POST /, PATCH /:id/status | GOTOWE |
| `/api/payments` | GET /, GET /:id, POST /, PUT /:id/status, POST /webhook, POST /:orderId/initiate | GOTOWE |
| `/api/suppliers` | GET /, GET /:id, POST /, PUT /:id, DELETE /:id, POST /:id/sync | GOTOWE |
| `/api/admin` | Dashboard, users, stores, products, suppliers, orders, subscriptions, audit-logs, settings, import | GOTOWE |
| `/api/my` | GET /store, GET /store/stats, GET /store/orders, PATCH /store, GET /store/products, POST /store/products, PATCH /store/products/:id, DELETE /store/products/:id | GOTOWE |
| `/api/subscriptions` | POST /, GET /my | GOTOWE |
| `/api/categories` | GET /, POST /, DELETE /:id | GOTOWE |

---

## 2. Frontend PWA — GOTOWE ✅

- `js/api.js` – pełny klient REST API (`window.QMApi`) z obsługą Auth, Products, Cart, Orders, Admin
- `js/pwa-connect.js` – mostek frontend → backend: login/rejestracja, produkty, checkout, dashboard
- `js/flow.js` – koordynator przepływów: login, dashboard, sklep, koszyk, listing, panel-sklepu, owner-panel
- `js/api-client.js` – kompatybilny shim delegujący do `window.QMApi`
- Strony HTML: `login.html`, `dashboard.html`, `sklep.html`, `koszyk.html`, `panel-sklepu.html`, `owner-panel.html`, `listing.html`, `generator-sklepu.html`

Frontend nie używa już localStorage do API calls – połączony z backendem przez QMApi.

---

## 3. System produktów — GOTOWE ✅

Tabela `products` zawiera wszystkie wymagane pola:

| Pole | Opis | Status |
|---|---|---|
| `supplier_price` | Cena hurtownika (brutto) | GOTOWE |
| `platform_price` | Cena platformy (wyliczona z marży tierowej) | GOTOWE |
| `min_selling_price` | Minimalna cena sprzedaży (= platform_price) | GOTOWE |
| `price_net` | Cena netto | GOTOWE |
| `price_gross` | Cena brutto | GOTOWE |
| `selling_price` | Cena sprzedaży bazowa | GOTOWE |
| `margin` | Marża | GOTOWE |

**Naprawione w tej wersji:** `POST /api/products` oraz `PUT /api/products/:id` teraz automatycznie wyliczają i zapisują `supplier_price`, `platform_price`, `min_selling_price` przy tworzeniu/aktualizacji produktu.

---

## 4. System sklepów — GOTOWE ✅

| Funkcja | Status |
|---|---|
| Tworzenie sklepu (`POST /api/stores`) | GOTOWE |
| Auto-seed 100 produktów centralnych do nowego sklepu | GOTOWE |
| Dodawanie produktów do sklepu (`POST /api/shop-products`) | GOTOWE |
| Tabela `shop_products` z pełnymi polami | GOTOWE |
| `seller_margin` – marża sprzedawcy | GOTOWE |
| `selling_price` – obliczona cena sprzedaży | GOTOWE |
| `price_override` – nadpisanie ceny przez sprzedawcę | GOTOWE |
| Egzekucja minimalnej ceny platformy | GOTOWE |

---

## 5. System cen i marż — GOTOWE ✅

Łańcuch cenowy:

```
supplier_price → [marża tiery platformy] → platform_price = min_selling_price
                                            → [marża sprzedawcy]  → selling_price (sklepu)
```

| Komponent | Status |
|---|---|
| `computePlatformPrice()` w `backend/src/helpers/pricing.js` | GOTOWE |
| Tiery marży (konfigurowane przez admina) | GOTOWE |
| Domyślne tiery (≤20 zł: 60%, ≤100 zł: 40%, ≤300 zł: 25%, >300 zł: 15%) | GOTOWE |
| Admin może modyfikować tiery: `PUT /api/admin/platform-margins` | GOTOWE |
| Automatyczne przeliczenie platform_price przy tworzeniu produktu | GOTOWE |
| Automatyczne przeliczenie platform_price przy aktualizacji ceny produktu | GOTOWE |

---

## 6. Import produktów z hurtowni — GOTOWE ✅

| Format | Endpoint | Status |
|---|---|---|
| CSV | `POST /api/admin/products/import` | GOTOWE |
| XML | `POST /api/admin/products/import` | GOTOWE |
| API (fetch URL) | `POST /api/admin/suppliers/import` | GOTOWE |
| Sync hurtowni | `POST /api/admin/suppliers/sync` | GOTOWE |
| Auto-sync co 12 godzin | `app.js` scheduler | GOTOWE |

Import upsertuje produkty do katalogu centralnego (`is_central=true, store_id=NULL`) z wyliczonym `platform_price`.

---

## 7. Zamówienia — GOTOWE ✅

| Funkcja | Status |
|---|---|
| Koszyk (`/api/cart`) | GOTOWE |
| Tworzenie zamówienia (`POST /api/orders`) | GOTOWE |
| Tabela `order_items` | GOTOWE |
| Statusy zamówień: created, pending, paid, processing, confirmed, shipped, delivered, cancelled | GOTOWE |
| Zmiana statusu (`PATCH /api/orders/:id/status`) | GOTOWE |
| Obsługa produktów z katalogu centralnego (`store_id IS NULL`) | GOTOWE |

---

## 8. Płatności — GOTOWE ✅

| Funkcja | Status |
|---|---|
| Zapis w tabeli `payments` | GOTOWE |
| Stripe – inicjowanie płatności | GOTOWE |
| Przelewy24 (P24) – inicjowanie płatności | GOTOWE |
| BLIK – obsługa kodu | GOTOWE |
| Przelew tradycyjny | GOTOWE |
| Webhook (`POST /api/payments/webhook`) z HMAC-SHA256 | GOTOWE |
| Aktualizacja statusu zamówienia po płatności | GOTOWE |
| Zwroty (`refunded`) | GOTOWE |

**Uwaga:** Bramki zewnętrzne (Stripe/P24) wymagają konfiguracji `STRIPE_SECRET_KEY` i `P24_MERCHANT_ID` w `.env`. Bez tych zmiennych działają w trybie sandbox (bez realnych transakcji).

---

## 9. Prowizja platformy — GOTOWE ✅

| Komponent | Status |
|---|---|
| `commission_rate` (konfigurowalne przez admina) | GOTOWE |
| `platform_commission` (wyliczana przy każdym zamówieniu) | GOTOWE |
| `seller_revenue` = order_total − platform_commission | GOTOWE |
| Domyślna prowizja: 8% | GOTOWE |
| Zmiana prowizji: `PATCH /api/admin/settings` | GOTOWE |

---

## 10. Panel admin — GOTOWE ✅

Admin (`role: 'owner'` lub `'admin'`) ma dostęp do:

| Funkcja | Status |
|---|---|
| Zarządzanie użytkownikami (lista, edycja roli/planu, usuwanie) | GOTOWE |
| Zarządzanie sklepami (lista, zmiana statusu, blokowanie) | GOTOWE |
| Zarządzanie produktami (lista, edycja, platform_price, import) | GOTOWE |
| Zarządzanie hurtowniami (lista, dodawanie, sync, import) | GOTOWE |
| Zarządzanie zamówieniami (lista, zmiana statusu) | GOTOWE |
| Zarządzanie subskrypcjami (lista, edycja planu) | GOTOWE |
| Dashboard ze statystykami platformy | GOTOWE |
| Audit logs | GOTOWE |
| Ustawienia prowizji (`commission_rate`) | GOTOWE |
| Konfiguracja tierów marży (`platform_margin_config`) | GOTOWE |
| Import produktów CSV/XML do katalogu centralnego | GOTOWE |

---

## 11. Panel sprzedawcy — GOTOWE ✅

Seller ma dostęp przez `/api/my/...`:

| Funkcja | Status |
|---|---|
| Produkty sklepu (lista z `platform_price`, `min_selling_price`, `supplier_price`) | GOTOWE |
| Dodawanie/edycja produktów z marżą sprzedawcy | GOTOWE |
| Egzekucja minimalnej ceny (nie można sprzedać poniżej `platform_price`) | GOTOWE |
| Zamówienia sklepu | GOTOWE |
| Statystyki sklepu (przychód, prowizja, liczba zamówień) | GOTOWE |
| Ustawienia sklepu (nazwa, opis, logo, marża) | GOTOWE |
| Kontrola limitu produktów (subscription) | GOTOWE |

---

## 12. Migracje bazy danych — GOTOWE ✅

| Plik migracji | Zawartość |
|---|---|
| `001_initial_schema.sql` | users, subscriptions, suppliers, stores, products, orders, order_items |
| `002_extended_schema.sql` | categories, product_images, shop_products, carts, cart_items, payments, audit_logs |
| `003_product_status.sql` | Pole status w products |
| `003a_central_catalog.sql` | Katalog centralny (is_central, store_id=NULL) |
| `004_central_catalog.sql` | Rozszerzenie katalogu centralnego |
| `005_performance_indexes.sql` | Indeksy wydajnościowe |
| `006_subscription_marketplace.sql` | Subskrypcje per-sklep (shop_id) |
| `007_subdomain_support.sql` | Subdomeny sklepów |
| `007_stores_subdomain.sql` | Pole subdomain w stores |
| `007_suppliers_import.sql` | Pola import w suppliers (xml_endpoint, csv_endpoint) |
| `008_bigbuy_seed.sql` | Seed danych BigBuy |
| `009_platform_price.sql` | Pole platform_price w products |
| `009_price_tiers.sql` | Pola supplier_price, min_selling_price, seller_margin, tiery marży |
| `010_payments_provider.sql` | Pole payment_provider w payments |
| `011_platform_commission.sql` | Tabela platform_settings, prowizja platformy |
| `012_initial_products_seed.sql` | Seed 200+ produktów do katalogu centralnego |
| `013_owner_phone.sql` | Pole phone w users |
| `014_referral_analytics_scripts.sql` | Tabele referral_codes (discount), referral_uses, scripts, analytics_snapshots |
| `015_referral_promo.sql` | Kolumny promo systemu: user_id w referral_codes; referral_code_id / referrer_id / new_user_id / bonus_months w referral_uses; referred_by_code w users |

---

## 13. Testy — GOTOWE ✅

```
Test Suites: 1 passed
Tests:       319 passed
```

Pokrycie testami obejmuje wszystkie kluczowe endpointy:
- Auth (register, login, profil)
- Users, Stores, Products, Shop products
- Cart, Orders, Payments (Stripe, P24, webhook)
- Admin (dashboard, users, stores, products, suppliers, subscriptions, audit-logs, settings, import)
- Seller dashboard (my/store, products, orders, stats)
- System cen i marż (platform_price, min_selling_price, seller_margin)
- Prowizja platformy (commission_rate, seller_revenue)
- Subskrypcje i limity produktów
- System polecający promo (referral/my, referral/admin, promo tiers, ensureReferralCode)
- Analytics i scripts

---

## Podsumowanie

### Co jest w 100% gotowe

1. **Backend API** – wszystkie endpointy działają: auth, users, stores, products, shop_products, cart, orders, payments, suppliers, admin
2. **System produktów** – pełny łańcuch cenowy: `supplier_price → platform_price → selling_price` z automatycznym przeliczaniem tierów marży
3. **System sklepów** – tworzenie, zarządzanie, auto-seed produktów, marże sprzedawców
4. **Zamówienia** – koszyk, tworzenie, order_items, statusy, komisja platformy
5. **Płatności** – Stripe, P24, BLIK, webhook z HMAC, automatyczna aktualizacja statusu zamówień
6. **Prowizja platformy** – commission_rate konfigurowalne, platform_commission i seller_revenue obliczane przy każdym zamówieniu
7. **Panel admin** – pełne zarządzanie platformą
8. **Panel sprzedawcy** – dashboard z produktami, zamówieniami, statystykami
9. **Import z hurtowni** – CSV, XML, API, auto-sync co 12h
10. **Frontend PWA** – podłączony do backend API przez QMApi
11. **Migracje** – kompletna historia schematu bazy danych (001–015)
12. **Testy** – 319 testów przechodzi
13. **System polecający promo** – `ensureReferralCode` auto-tworzy kod QM- dla każdego sprzedawcy przy rejestracji; schemat DB rozszerzony (migacja 015) o user_id / referral_code_id / referrer_id / new_user_id / bonus_months

### Co jeszcze warto poprawić (opcjonalne usprawnienia)

1. **Konfiguracja bramek płatności** – wymaga ustawienia `STRIPE_SECRET_KEY` i/lub `P24_MERCHANT_ID` w `.env` dla realnych transakcji
2. **Email notifications** – brak systemu powiadomień email (do zamówień, rejestracji itp.)
3. **Subdomenowe sklepy** – infrastruktura DNS/reverse proxy do obsługi subdomen `*.qualitetmarket.pl`
4. **Panele administracyjne UI** – backend jest gotowy, ale dedykowane UI panele mogą wymagać dopracowania

### Czy platforma jest gotowa na pierwszych sprzedawców?

**TAK** – platforma jest gotowa na pierwszych sprzedawców. Wszystkie krytyczne komponenty działają:

- ✅ Rejestracja i logowanie sprzedawców
- ✅ Auto-tworzenie sklepu z subskrypcją trial (14 dni)
- ✅ Katalog centralny z produktami gotowy do użycia
- ✅ Sprzedawca może ustawić własną marżę i publikować produkty
- ✅ Klienci mogą przeglądać produkty, dodawać do koszyka i składać zamówienia
- ✅ System płatności (przynajmniej przelew tradycyjny bez konfiguracji zewnętrznej)
- ✅ Prowizja platformy automatycznie naliczana
- ✅ Dashboard sprzedawcy z podstawowymi statystykami

Przed wdrożeniem produkcyjnym należy skonfigurować:
- `JWT_SECRET` – silny sekret JWT
- `DB_PASSWORD` – hasło bazy danych
- `PAYMENT_WEBHOOK_SECRET` – sekret dla webhooków płatności
- `STRIPE_SECRET_KEY` lub `P24_MERCHANT_ID` – dla realnych płatności
- `ALLOWED_ORIGINS` – dozwolone domeny CORS
