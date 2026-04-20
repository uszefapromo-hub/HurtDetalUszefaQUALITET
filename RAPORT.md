# RAPORT TECHNICZNY – PLATFORMA QUALITETMARKET

> Data: 2026-03-18 · Autor: GitHub Copilot Agent (audyt + implementacja)
> *(poprzedni raport: 2026-03-14 — ten raport zastępuje poprzedni)*

---

## 1. PODSUMOWANIE STANU PLATFORMY

| Kategoria | Liczba |
|---|---|
| Endpointy API (backend/src/routes/) | **248** |
| Endpointy API (moduły AI) | **8** |
| **Łączna liczba endpointów** | **256** |
| Pliki tras (routes/*.js) | 30 |
| Pliki tras (modules/*/routes.js) | 6 |
| Pomocniki backendowe (helpers/) | 6 |
| Usługi backendowe (services/) | 3 |
| Middleware | 4 |
| Migracje bazy danych | 50 |
| Testy automatyczne (Jest) | **867 ✅** |
| Strony HTML (frontend PWA) | 39 |
| Pliki JS frontendu (js/) | 10 |

---

## 2. BACKEND – REJESTR TRAS API

### `/api/auth` – Autentykacja (5 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| POST | `/api/auth (register)` | Rejestracja nowego konta (domyślna rola: seller) |
| POST | `/api/auth (login)` | Logowanie, zwraca JWT |
| POST | `/api/auth/refresh` | Odświeżenie tokenu JWT |
| GET | `/api/auth/me` | Profil zalogowanego użytkownika |
| PUT | `/api/auth/me` | Aktualizacja profilu użytkownika |

> ⚠️ **Brakuje:** `POST /api/auth/forgot-password` oraz `POST /api/auth/reset-password`

---

### `/api/users` – Użytkownicy (6 endpointów)
Zarządzanie kontami użytkowników (admin + profil własny).

---

### `/api/stores` – Sklepy (5 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/stores` | Lista sklepów (moje / wszystkie dla admina) |
| GET | `/api/stores/:id` | Szczegóły sklepu |
| POST | `/api/stores` | Tworzenie sklepu |
| PUT | `/api/stores/:id` | Aktualizacja sklepu |
| DELETE | `/api/stores/:id` | Usunięcie sklepu (admin) |

---

### `/api/shops` – Sklepy publiczne (4 endpointy)
| Metoda | Ścieżka | Opis |
|---|---|---|
| POST | `/api/shops` | Tworzenie sklepu przez sprzedawcę |
| GET | `/api/shops/:slug` | Publiczny profil sklepu (dla kupujących) |
| GET | `/api/shops/:slug/products` | Produkty sklepu (auto-przypisuje z katalogu jeśli brak) |
| POST | `/api/shops/:slug/review` | Dodanie oceny sklepu |

---

### `/api/products` – Produkty (5 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/products` | Lista produktów z paginacją i filtrami |
| GET | `/api/products/:id` | Szczegóły produktu |
| POST | `/api/products` | Dodanie produktu (sprzedawca/admin) |
| PUT | `/api/products/:id` | Aktualizacja produktu |
| DELETE | `/api/products/:id` | Usunięcie produktu |

---

### `/api/shop-products` – Produkty sklepu (4 endpointy)
Zarządzanie produktami przypisanymi do konkretnego sklepu (nadpisywanie cen, marż).

---

### `/api/categories` – Kategorie (5 endpointów)
CRUD kategorii produktów.

---

### `/api/orders` – Zamówienia (4 endpointy)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/orders` | Lista zamówień (admin = wszystkie, user = swoje) |
| GET | `/api/orders/:id` | Szczegóły zamówienia z pozycjami |
| POST | `/api/orders` | Tworzenie zamówienia |
| PATCH | `/api/orders/:id` | Aktualizacja statusu zamówienia |

---

### `/api/cart` – Koszyk (7 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/cart` | Pobranie koszyka |
| POST | `/api/cart/items` | Dodanie pozycji do koszyka |
| DELETE | `/api/cart/items/:id` | Usunięcie pozycji |
| POST | `/api/cart/checkout` | Przejście do checkout, tworzenie zamówienia |
| PUT | `/api/cart/items/:id` | Aktualizacja ilości |
| DELETE | `/api/cart` | Wyczyszczenie koszyka |
| DELETE | `/api/cart/clear` | Wyczyszczenie koszyka (alias) |

---

### `/api/payments` – Płatności (7 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/payments` | Lista płatności |
| GET | `/api/payments/:id` | Szczegóły płatności |
| POST | `/api/payments` | Inicjalizacja płatności |
| PUT | `/api/payments/:id/status` | Aktualizacja statusu |
| POST | `/api/payments/stripe/checkout` | Sesja Stripe Checkout |
| POST | `/api/payments/stripe/billing-portal` | Portal zarządzania Stripe |
| POST | `/api/payments/webhook` | Webhook Stripe |

---

### `/api/subscriptions` – Subskrypcje (10 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/subscriptions` | Lista subskrypcji sklepu |
| GET | `/api/subscriptions/active` | Aktywna subskrypcja |
| POST | `/api/subscriptions` | Nowa subskrypcja |
| DELETE | `/api/subscriptions/:id` | Anulowanie subskrypcji |
| PUT | `/api/subscriptions/:id` | Aktualizacja planu (admin) |
| POST | `/api/subscriptions/stripe-subscribe` | Subskrypcja przez Stripe |
| POST | `/api/subscriptions/stripe-cancel` | Anulowanie w Stripe |
| GET | `/api/subscriptions/plans` | Lista dostępnych planów |
| GET | `/api/subscriptions/my-billing` | Dane rozliczeniowe Stripe |
| POST | `/api/subscriptions/stripe-sync` | Synchronizacja z Stripe |

#### Plany subskrypcji

| Plan | Nazwa handlowa | Cena | Limit produktów | Prowizja |
|---|---|---|---|---|
| `free` | Seller Free | 0 zł | 10 | 5% |
| `basic` | Seller PRO | 79 zł/mies. | bez limitu | 3% |
| `pro` | Seller Business | 249 zł/mies. | bez limitu | 2% |
| `elite` | Seller Elite | 499 zł/mies. | bez limitu | 1% |
| `supplier_basic` | Supplier Basic | 149 zł/mies. | bez limitu | 0% |
| `supplier_pro` | Supplier Pro | 399 zł/mies. | bez limitu | 0% |
| `brand` | Brand Plan | 999 zł/mies. | bez limitu | 0% |
| `artist_basic` | Artist Basic | 0 zł | bez limitu | 10% |
| `artist_pro` | Artist Pro | 49 zł/mies. | bez limitu | 6% |

---

### `/api/suppliers` – Dostawcy/Hurtownicy (6 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/suppliers` | Lista dostawców |
| GET | `/api/suppliers/:id` | Szczegóły dostawcy |
| POST | `/api/suppliers` | Rejestracja dostawcy |
| PUT | `/api/suppliers/:id` | Aktualizacja profilu |
| POST | `/api/suppliers/:id/import` | Import produktów (CSV/XML/API) |
| POST | `/api/suppliers/:id/import-from-store` | Import z zewnętrznego sklepu |

---

### `/api/my` – Panel sprzedawcy (14 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/my/store` | Mój sklep (podstawowe dane) |
| GET | `/api/my/store/stats` | Statystyki sklepu (dashboard) |
| GET | `/api/my/store/orders` | Zamówienia złożone w moim sklepie |
| PATCH | `/api/my/store` | Aktualizacja ustawień sklepu |
| GET | `/api/my/orders` | Moje zamówienia jako kupujący |
| GET | `/api/my/store/products` | Produkty w moim sklepie |
| POST | `/api/my/store/products` | Dodanie produktu do sklepu |
| POST | `/api/my/store/products/bulk` | Dodanie wielu produktów naraz |
| PATCH | `/api/my/store/products/:id` | Aktualizacja produktu sklepu |
| DELETE | `/api/my/store/products/:id` | Usunięcie produktu |
| POST | `/api/my/store/products/from-catalogue` | Dodanie z katalogu centralnego |
| POST | `/api/my/store/subscription` | Zakup subskrypcji dla sklepu |
| GET | `/api/my/store/earnings` | Raport zarobków |
| GET | `/api/my/store/product-suggestions` | Sugestie produktów z katalogu |

---

### `/api/store` – Publiczny widok sklepu (3 endpointy)
Produkty sklepu widoczne dla kupujących (publiczne, bez auth).

---

### `/api/admin` – Panel administratora (46 endpointów)
Pełne zarządzanie platformą. Dostęp tylko dla `owner` i `admin`.

| Kategoria | Endpointy |
|---|---|
| Dashboard i statystyki | `/dashboard`, `/stats` |
| Użytkownicy | GET/PATCH/DELETE `/users`, `/users/:id` |
| Zamówienia | GET `/orders` |
| Sklepy | GET `/stores`, `/shops` |
| Dostawcy | GET/POST `/suppliers` |
| Synchronizacja | POST `/suppliers/sync/:id`, `/suppliers/sync-all`, `/suppliers/compare`, `/suppliers/auto-sync` |
| Logi importu | GET `/import-logs`, `/sync-status`, `/import-center` |
| Raporty | GET `/profit-report` |
| Produkty | GET/PATCH `/products`, `/catalogue`, `/products/:id/activate`, `/products/:id/deactivate` |
| Subskrypcje | GET `/subscriptions`, PATCH `/subscriptions/:id` |
| Audit log | GET `/audit-logs` |
| Marże platformy | GET/PUT `/platform-margins` |
| Ustawienia | GET/PATCH `/settings` |
| Ogłoszenia | GET/POST/PATCH/DELETE `/announcements`, POST `/announcements/:id/notify` |
| Maile | GET `/mail` |
| Wyróżnione | GET `/featured-products` |

---

### `/api/referral` – Kody polecające (3 endpointy)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/referral/my` | Mój kod polecający |
| POST | `/api/referral/use` | Użycie kodu polecającego |
| GET | `/api/referral/admin` | Lista wszystkich kodów (admin) |

---

### `/api/referrals` – Program poleceń (10 endpointów)
Rozszerzony system poleceń: zaproszenia, statystyki, prowizje, wypłaty.

---

### `/api/scripts` – Skrypty śledzące (6 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/scripts` | Lista skryptów (moje) |
| GET | `/api/scripts/:store_id` | Skrypty danego sklepu |
| GET | `/api/scripts/:store_id/active` | Aktywne skrypty sklepu |
| POST | `/api/scripts` | Dodanie skryptu (FB Pixel, GA4, custom) |
| PATCH | `/api/scripts/:id` | Aktualizacja skryptu |
| DELETE | `/api/scripts/:id` | Usunięcie skryptu |

---

### `/api/analytics` – Analityka (3 endpointy)
Analityka sklepu: eventy, raporty, tracking.

---

### `/api/affiliate` – Program partnerski twórców (16 endpointów)
| Kategoria | Opis |
|---|---|
| Dashboard | Statystyki programu afiliacyjnego |
| Linki | Tworzenie i zarządzanie linkami afiliacyjnymi |
| Zarobki | Historia prowizji i saldo |
| Kreatorzy | Powiązani twórcy sprzedawcy |
| Wypłaty | Żądania wypłat |
| Kliknięcia | Śledzenie kliknięć (`/click/:code`) |
| Admin | Lista wszystkich linków i żądań |

---

### `/api/creator` – Panel twórcy (8 endpointów)
Rejestracja twórcy, profil, portfolio, statystyki, współpraca ze sklepami.

### `/api/creator/referrals` – Polecenia twórców (3 endpointy)
Kody polecające twórców i ich statystyki.

---

### `/api/live` – Live commerce (12 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/live/streams` | Lista streamów |
| GET | `/api/live/streams/:id` | Szczegóły streamu |
| POST | `/api/live/streams` | Start nowego streamu |
| PATCH | `/api/live/streams/:id` | Aktualizacja streamu (tytuł, status) |
| GET | `/api/live/streams/:id/messages` | Wiadomości czatu |
| POST | `/api/live/streams/:id/messages` | Wysłanie wiadomości |
| GET | `/api/live/streams/:id/products` | Produkty przypięte do streamu |
| POST | `/api/live/streams/:id/products` | Przypięcie produktu |
| DELETE | `/api/live/streams/:id/products/:pid` | Odpięcie produktu |
| GET | `/api/live/streams/:id/promotions` | Aktywne promocje w streamie |
| POST | `/api/live/streams/:id/promotions` | Dodanie flash promocji |
| POST | `/api/live/streams/:id/end` | Zakończenie streamu |

---

### `/api/social` – Social commerce (12 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/social/feed` | Feed postów (paginowany) |
| GET | `/api/social/trending` | Trending posty |
| POST | `/api/social/posts` | Nowy post |
| GET | `/api/social/posts/:id` | Szczegóły posta |
| DELETE | `/api/social/posts/:id` | Usunięcie posta |
| POST | `/api/social/posts/:id/like` | Like |
| POST | `/api/social/posts/:id/unlike` | Unlike |
| DELETE | `/api/social/posts/:id/like` | Unlike (alias) |
| POST | `/api/social/posts/:id/comment` | Komentarz |
| GET | `/api/social/posts/:id/comments` | Lista komentarzy |
| POST | `/api/social/posts/:id/share` | Udostępnienie |
| DELETE | `/api/social/comments/:id` | Usunięcie komentarza |

---

### `/api/gamification` – Grywalizacja (7 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/gamification/leaderboard` | Ranking (global/weekly/monthly/sellers/creators) |
| GET | `/api/gamification/my/level` | Mój poziom i punkty |
| GET | `/api/gamification/my/badges` | Moje odznaki |
| GET | `/api/gamification/my/points` | Historia punktów |
| POST | `/api/gamification/points` | Przyznanie punktów (admin) |
| POST | `/api/gamification/badges` | Przyznanie odznaki (admin) |
| POST | `/api/gamification/leaderboard/refresh` | Odświeżenie rankingu (admin) |

---

### `/api/reputation` – Reputacja (9 endpointów)
| Opis |
|---|
| Oceny sklepów (dodawanie, lista) |
| Oceny produktów |
| Statystyki reputacji sprzedawcy |
| Odznaki reputacji |
| Odpowiedzi sprzedawcy na recenzje |

---

### `/api/auctions` – Aukcje artystów (9 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/auctions/artists` | Lista artystów |
| POST | `/api/auctions/artists` | Rejestracja artysty |
| GET | `/api/auctions/artworks` | Lista dzieł sztuki |
| POST | `/api/auctions/artworks` | Dodanie dzieła |
| GET | `/api/auctions` | Lista aukcji |
| GET | `/api/auctions/:id` | Szczegóły aukcji |
| POST | `/api/auctions` | Tworzenie aukcji |
| POST | `/api/auctions/:id/bid` | Złożenie oferty |
| GET | `/api/auctions/:id/bids` | Historia ofert |

---

### `/api/campaigns` – Kampanie reklamowe (11 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/campaigns` | Lista kampanii |
| GET | `/api/campaigns/my/campaigns` | Moje kampanie |
| GET | `/api/campaigns/my/participations` | Moje uczestnictwa |
| GET | `/api/campaigns/promoted` | Promowane produkty (publiczne) |
| POST | `/api/campaigns` | Tworzenie kampanii |
| GET | `/api/campaigns/:id` | Szczegóły kampanii |
| POST | `/api/campaigns/:id/join` | Dołączenie do kampanii |
| PUT | `/api/campaigns/:id` | Aktualizacja kampanii |
| DELETE | `/api/campaigns/:id` | Usunięcie kampanii |
| POST | `/api/campaigns/:id/products` | Dodanie produktu do kampanii |
| PATCH | `/api/campaigns/:id/participants/:uid` | Zatwierdzenie uczestnika |

---

### `/api/collaboration` – Sklepy kolaboracyjne (7 endpointów)
Współpraca twórców ze sklepami (zaproszenia, prawa dostępu, wspólne zarządzanie).

---

### `/api/feed` – Social Commerce Feed (1 endpoint)
| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/feed` | Rankingowy feed produktów z katalogu (max 50/stronę) |

Sekcje: `recommended` \| `trending` \| `new` \| `best_margin` \| `bestsellers`

---

### `/api/ai` – Asystent AI (8 endpointów)
| Metoda | Ścieżka | Opis |
|---|---|---|
| POST | `/api/ai/chat` | Czat z asystentem AI |
| GET | `/api/ai/conversations` | Lista konwersacji |
| GET | `/api/ai/conversations/:id` | Szczegóły konwersacji |
| DELETE | `/api/ai/conversations/:id` | Usunięcie konwersacji |
| POST | `/api/ai/product-description` | Generowanie opisu produktu |
| POST | `/api/ai/store-description` | Generowanie opisu sklepu |
| POST | `/api/ai/generate-store` | AI generator sklepu |
| POST | `/api/ai/marketing-pack` | Generowanie pakietu marketingowego |

---

## 3. BACKEND – ARCHITEKTURA

### Pliki pomocnicze (`backend/src/helpers/`)
| Plik | Opis |
|---|---|
| `audit.js` | `auditLog()` – fire-and-forget logi akcji; `computeSellingPrice()` |
| `mailer.js` | Powiadomienia email (import, SMTP/nodemailer) |
| `pagination.js` | `parsePagination(req, opts)` – **NOWY** helper paginacji *(2026-03-18)* |
| `pricing.js` | Obliczanie cen: `computePlatformPrice()`, `computeQualityScore()`, tiary, `computeResellerPrice()` |
| `promo.js` | `getPromoTier()` – tiery promocyjne przy rejestracji |
| `slug.js` | `nameToSlug()`, `uniqueSlug()` |

### Usługi (`backend/src/services/`)
| Plik | Opis |
|---|---|
| `supplier-import.js` | Import produktów od dostawców (CSV, XML, API) |
| `supplier-comparison.js` | Porównywanie ofert dostawców |
| `websocket.js` | WebSocket dla live commerce |

### Middleware (`backend/src/middleware/`)
| Plik | Opis |
|---|---|
| `auth.js` | `authenticate`, `requireRole()`, `requireActiveSubscription`, `signToken()` |
| `validate.js` | `validate` (express-validator), `sanitizeText()` |
| `errorHandler.js` | Globalny handler błędów |
| `subdomain.js` | Obsługa subdomenowych sklepów |

### Moduły (`backend/src/modules/`)
| Moduł | Opis |
|---|---|
| `ai/` | Asystent AI, generowanie treści, konwersacje |
| `affiliate/` | Program partnerski (warstwa kontroler/serwis/model) |
| `auth/` | Autentykacja (warstwa kontroler/serwis/model) |
| `orders/` | Zamówienia (warstwa kontroler/serwis/model) |
| `payments/` | Płatności (warstwa kontroler/serwis/model) |
| `products/` | Produkty (warstwa kontroler/serwis/model) |
| `stores/` | Sklepy (warstwa kontroler/serwis/model) |

---

## 4. BAZA DANYCH

### Migracje (50 plików SQL)
| Zakres | Migracje |
|---|---|
| Schemat bazowy | 001–002 |
| Katalog centralny | 003–004, 003a |
| Wydajność / indeksy | 005, 037, 040 |
| Subskrypcje | 006, 028, 029, 039 |
| Subdomenowe sklepy | 007, 007a |
| Import dostawców | 007b, 036, 037 |
| Seed danych testowych | 008, 012 |
| Ceny platformy | 009, 009a, 011 |
| Płatności | 010 |
| Telefon właściciela | 013 |
| Referral / analityka | 014, 015, 024 |
| Ogłoszenia | 016 |
| Social media sklepu | 017 |
| Program afiliacyjny twórców | 018, 020, 031 |
| Moduł AI | 019 |
| Live commerce | 020a |
| Social commerce | 021 |
| Grywalizacja | 022 |
| Sklepy kolaboracyjne | 023 |
| Demo / seed | 024, 032 |
| System reputacji | 025 |
| Aukcje artystów | 026 |
| Kampanie reklamowe | 027 |
| Social video embed | 030 |
| Prawdziwe kategorie | 033 |
| Wyróżnione produkty | 034 |
| Skrypty i uruchamianie | 035, 036_script_runs |
| Feed / indeksy | 037_feed_indexes |
| Aktywacja katalogu | 038 |
| Stripe billing | 039 |
| Admin seed | 041 |

---

## 5. FRONTEND

### 5.1 Strony HTML PWA (39 plików)
| Strona | Plik | Rola |
|---|---|---|
| Strona główna | `index.html` | Publiczna |
| Logowanie / Rejestracja | `login.html` | Publiczna |
| Dashboard | `dashboard.html` | Zalogowany |
| Marketplace | `qualitetmarket.html`, `sklep.html` | Publiczna |
| Listing produktu | `listing.html` | Publiczna |
| Koszyk | `koszyk.html` | Kupujący |
| Panel sprzedawcy | `panel-sklepu.html` | Seller |
| Panel dostawcy | `panel-dostawcy.html` | Supplier |
| Panel artysty/twórcy | `panel-artysty.html` | Creator/Artist |
| Panel firmy | `panel-firmy.html` | Brand |
| Panel właściciela | `owner-panel.html` | Owner |
| Panel operatora | `operator-panel.html` | Admin |
| Generator sklepu AI | `generator-sklepu.html` | Seller |
| Hurtownie | `hurtownie.html` | Supplier |
| Dostawcy (katalog) | `suppliers.html` | Publiczna |
| Live commerce | `live.html` | Publiczna |
| Aukcje artystów | `auctions.html` | Publiczna |
| Program partnerski | `affiliate.html` | Creator |
| Program polecający | `referral-program.html` | Zalogowany |
| Linki sprzedażowe | `linki-sprzedazowe.html` | Seller |
| Reputacja | `reputation.html` | Publiczna |
| Cennik | `cennik.html` | Publiczna |
| Zarabiaj | `zarabiaj.html` | Publiczna |
| Zostań dostawcą | `zostan-dostawca.html` | Publiczna |
| QualitetVerse (community) | `qualitetverse.html` | Publiczna |
| Feed / Discovery | `feed.html` | Publiczna |
| Community | `community.html` | Publiczna |
| AI Intelligence | `intelligence.html` | Zalogowany |
| CRM | `crm.html` | Seller/Admin |
| Zadania | `tasks.html` | Seller/Admin |
| Marka/Brand | `brand.html` | Brand |
| Market landing | `market-landing.html` | Publiczna |
| Blog | `blog.html` | Publiczna |
| Skrypty | `skrypty.html` | Seller |
| Strona prawna | `legal.html` | Publiczna |
| Regulamin | `terms.html` | Publiczna |
| Polityka prywatności | `privacy.html` | Publiczna |
| 404 | `404.html` | — |

### 5.2 Pliki JavaScript (js/)
| Plik | Opis |
|---|---|
| `api.js` | `window.QMApi` – globalny klient REST API |
| `api-client.js` | `window.QualitetAPI` – shim kompatybilności |
| `app.js` | Główna logika PWA (nawigacja, hamburger, bottom nav) |
| `cart.js` | Logika koszyka |
| `auto-store.js` | Auto-generowanie sklepu |
| `feed.js` | Feed produktów discovery |
| `flow.js` | Koordynator przepływów stron |
| `homepage.js` | Logika strony głównej |
| `pwa-connect.js` | Mostek frontend ↔ backend (login, rejestracja, checkout) |
| `security-guard.js` | Ochrona tras wymagających autentykacji |

### 5.3 Next.js Frontend (`frontend/`)
Szkielet Next.js 14 z Tailwind CSS. Trasy:
- `/` – landing page
- `/stores` – marketplace sklepów
- `/product` – szczegóły produktu
- `/cart` – koszyk
- `/checkout` – checkout
- `/profile` – profil użytkownika
- `/seller` – panel sprzedawcy
- `/admin` – panel admina
- `/creator` – panel twórcy
- `/ai` – asystent AI
- `/trending` – trending produkty

> ⚠️ Większość stron Next.js używa **mock danych** zamiast prawdziwego API. Brak pełnej integracji.

### 5.4 Expo React Native (`mobile/`)
Ekrany mobilne (React Native/Expo):
`index`, `login`, `cart`, `checkout`, `orders`, `profile`, `stores`, `trending`, `creator`

> ⚠️ Ekrany mobilne częściowo z mock danymi. Brak pełnej integracji JWT.

---

## 6. TESTY

| Kategoria | Wartość |
|---|---|
| Plik testowy | `backend/tests/api.test.js` |
| Łączna liczba testów | **867** |
| Status | ✅ Wszystkie przechodzą |
| Framework | Jest + supertest |
| Baza danych | In-memory mock (bez PostgreSQL) |
| Uruchomienie | `cd backend && ./node_modules/.bin/jest --forceExit` |

---

## 7. MODUŁY – STATUS KOMPLETNOŚCI

| Moduł | Backend API | Frontend PWA | Testy | Status |
|---|---|---|---|---|
| Auth (login, register) | ✅ | ✅ | ✅ | **GOTOWY** |
| Produkty i katalog | ✅ | ✅ | ✅ | **GOTOWY** |
| Koszyk | ✅ | ✅ | ✅ | **GOTOWY** |
| Zamówienia | ✅ | ✅ | ✅ | **GOTOWY** |
| Sklepy sprzedawców | ✅ | ✅ | ✅ | **GOTOWY** |
| Panel sprzedawcy | ✅ | ✅ | ✅ | **GOTOWY** |
| Subskrypcje i płatności (Stripe) | ✅ | ✅ | ✅ | **GOTOWY** |
| Import dostawców (CSV/XML/API) | ✅ | ✅ | ✅ | **GOTOWY** |
| Program polecający (referral) | ✅ | ✅ | ✅ | **GOTOWY** |
| Program afiliacyjny twórców | ✅ | ✅ | ✅ | **GOTOWY** |
| Live commerce | ✅ | ✅ | ✅ | **GOTOWY** |
| Social commerce | ✅ | ✅ | ✅ | **GOTOWY** |
| Grywalizacja i ranking | ✅ | ✅ | ✅ | **GOTOWY** |
| Aukcje artystów | ✅ | ✅ | ✅ | **GOTOWY** |
| Kampanie reklamowe | ✅ | ✅ | ✅ | **GOTOWY** |
| Skrypty śledzące (FB Pixel, GA4) | ✅ | ✅ | ✅ | **GOTOWY** |
| AI asystent i generator | ✅ | ✅ | ✅ | **GOTOWY** |
| System reputacji i ocen | ✅ | ✅ | ✅ | **GOTOWY** |
| Sklepy kolaboracyjne | ✅ | ✅ | ✅ | **GOTOWY** |
| Feed produktów (discovery) | ✅ | ✅ | ✅ | **GOTOWY** |
| Panel administratora | ✅ | ✅ | ✅ | **GOTOWY** |
| Strony prawne | ✅ | ✅ | — | **GOTOWY** |
| Reset hasła | ❌ | ❌ | ❌ | **BRAKUJE** |
| Emaile transakcyjne | ⚠️ tylko import | ❌ | ❌ | **BRAKUJE** |
| Next.js ↔ API integracja | — | ❌ | — | **W TRAKCIE** |
| Expo ↔ API integracja | — | ❌ | — | **W TRAKCIE** |

---

## 8. REFAKTORYZACJE KODU (2026-03-18)

W bieżącej sesji przeprowadzono refaktoryzację duplikowanego kodu:

### 8.1 Nowy helper: `parsePagination`
**Plik:** `backend/src/helpers/pagination.js`

```js
function parsePagination(req, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit || String(defaultLimit), 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
```

**Wpływ:**
- Eliminuje 50+ powtórzeń 3-liniowego bloku paginacji
- Zaktualizowano **19 plików tras** (`admin.js`, `affiliate.js`, `auctions.js`, `creator.js`, `creator-referrals.js`, `live.js`, `my.js`, `orders.js`, `payments.js`, `products.js`, `referral.js`, `referrals.js`, `reputation.js`, `shop-products.js`, `shops.js`, `store.js`, `stores.js`, `suppliers.js`, `users.js`)
- Netto: **−44 linie kodu**

---

## 9. BRAKI I PRIORYTETY

### 🔴 KRYTYCZNE (przed produkcją)
1. **Reset hasła** – brak `POST /api/auth/forgot-password` + `POST /api/auth/reset-password` + UI
2. **Emaile transakcyjne** – potwierdzenia zamówień, rejestracja (nodemailer/SendGrid)
3. **Konfiguracja .env produkcyjnego** – `JWT_SECRET`, `DB_PASSWORD`, `STRIPE_SECRET_KEY`

### 🟡 WYSOKIE
4. **Pełna integracja Next.js** – zastąpienie mock danych prawdziwym API
5. **Auth guard Next.js** – middleware JWT dla `/admin`, `/seller`, `/creator`
6. **Pełna integracja Expo** – koszyk, zamówienia, auth w aplikacji mobilnej

### 🟠 ŚREDNIE
7. **Subdomenowe sklepy** – konfiguracja nginx/Vercel dla `*.qualitetmarket.pl`
8. **Integracja CRM i Tasks** – podłączenie `crm.html` i `tasks.html` do backendu
9. **Push notifications** – Expo notifications

### 🟢 NISKIE
10. **Dokumentacja API** – Swagger/OpenAPI
11. **Testy E2E** – Playwright
12. **Builds mobilne** – App Store / Google Play

---

## 10. STATYSTYKI KODU

| Metryka | Wartość |
|---|---|
| Łączny rozmiar routes/*.js | ~13 200 linii |
| Największy plik tras | `admin.js` (2251 linii) |
| Plik testowy | ~11 249 linii |
| Liczba migracji SQL | 50 |
| Liczba stron HTML | 39 |
| Aktywnych endpointów API | **256** |
| Testów automatycznych | **867 ✅** |

---

*Raport wygenerowany automatycznie przez GitHub Copilot Agent · 2026-03-18*
