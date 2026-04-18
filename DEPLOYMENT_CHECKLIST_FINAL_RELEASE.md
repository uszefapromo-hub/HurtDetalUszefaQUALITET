# Final Release – checklista wdrożenia Qualitet Market

## 1. Pre-deploy / decyzja o publikacji

Przed wdrożeniem potwierdź, że publikowana paczka zawiera trzy aktywne warstwy projektu:
- `frontend/` – storefront i panele webowe Next.js
- `backend/` – REST API Express + PostgreSQL
- `mobile/` – aplikacja Expo / React Native

Główne punkty wejścia do kontroli przed publikacją:
- storefront web: `frontend/src/app/page.tsx`
- panel AI web: `frontend/src/app/ai/page.tsx`
- panel sprzedawcy: `frontend/src/app/seller/page.tsx`
- panel admina: `frontend/src/app/admin/page.tsx`
- backend API: `backend/src/app.js`
- silnik AI: `backend/src/core/ai-engine.js`
- endpointy AI: `backend/src/modules/ai/*`
- import hurtowni: `backend/src/routes/suppliers.js`
- konektory hurtowni: `backend/src/services/supplier-connectors.js`

## 2. Backup i okno wdrożeniowe

Przed deployem:
- wykonaj backup bazy PostgreSQL
- zachowaj kopię aktualnych plików `.env` / sekretów z produkcji
- przygotuj rollback do poprzedniego buildu frontendu i poprzedniej wersji backendu
- zaplanuj krótkie okno wdrożeniowe z testem po wdrożeniu

## 3. Sekrety i konfiguracja produkcyjna

Skopiuj `backend/.env.example` do środowiska produkcyjnego i uzupełnij minimum:
- `NODE_ENV=production`
- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`
- `APP_URL`
- `OPENAI_API_KEY`
- `AI_PROVIDER`
- `AI_MODEL`
- `AI_TIMEOUT_MS`
- `AI_AUTO_SUPPLIER_ENRICH`
- `AI_SUPPLIER_ENRICH_LIMIT`
- `BIGBUY_API_KEY`, `BASELINKER_API_TOKEN`, `DIKEL_XML_URL`, `APILO_API_URL`, `APILO_API_KEY`, `DROPSHIPPINGXL_API_TOKEN`, `PRINTFUL_API_KEY`, `PRINTIFY_API_TOKEN`, `CJDROPSHIPPING_API_KEY`, `WHOLESALE2B_API_KEY`, `SYNCEE_API_KEY`, `AVASAM_API_URL`, `AVASAM_API_KEY` – jeśli używasz integracji hurtowni
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` – jeśli używasz Stripe
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` – jeśli używasz mailingu
- `P24_MERCHANT_ID`, `P24_API_KEY` – jeśli używasz Przelewy24

W webowym froncie ustaw:
- `frontend/.env.local` → `NEXT_PUBLIC_API_URL=https://twoje-api.example.com/api`

W mobile ustaw:
- `mobile/.env.local` → `EXPO_PUBLIC_API_URL=https://twoje-api.example.com/api`

## 4. Backend – wdrożenie

Checklist backendu:
- `cd backend`
- `npm install`
- skopiuj i uzupełnij `.env`
- upewnij się, że produkcyjna baza PostgreSQL jest osiągalna
- uruchom migracje: `npm run migrate`
- utwórz właściciela platformy: `npm run seed:owner`
- uruchom API przez process manager (PM2 / systemd / Docker)

Po starcie backendu zweryfikuj:
- `GET /health`
- `GET /api/readiness`
- logi startowe serwera
- czy router `/api/ai` jest aktywny
- czy scheduler synchronizacji hurtowni nie raportuje błędów

## 5. Frontend web – wdrożenie

Checklist frontendu:
- `cd frontend`
- `npm install`
- skopiuj `frontend/.env.local.example` do `.env.local`
- ustaw `NEXT_PUBLIC_API_URL`
- wykonaj build produkcyjny: `npm run build`
- uruchom: `npm run start` lub wdroż przez platformę hostingową

Po wdrożeniu sprawdź w przeglądarce:
- `/`
- `/ai`
- `/seller`
- `/admin`
- `/checkout`
- `/cart`
- `/stores`

## 6. Mobile – wdrożenie

Checklist mobile:
- `cd mobile`
- `npm install`
- skopiuj `.env.example` do `.env.local`
- ustaw `EXPO_PUBLIC_API_URL`
- uruchom test aplikacji: `npm run start`
- przygotuj build Expo/EAS zgodnie z wewnętrznym procesem publikacji

Sprawdź w mobile:
- logowanie
- ekran profilu
- ekran AI
- komunikację z backendem API

## 7. AI – checklista uruchomienia produkcyjnego

Zweryfikuj:
- ustawiony `OPENAI_API_KEY`
- poprawny `AI_PROVIDER`
- poprawny `AI_MODEL`
- sensowny `AI_TIMEOUT_MS`
- czy panel `/ai` generuje odpowiedzi
- czy fallback mock nie jest aktywowany niechcący
- czy endpointy `/api/ai/*` odpowiadają po zalogowaniu

Najważniejsze endpointy AI do smoke-testu:
- `POST /api/ai/chat`
- `POST /api/ai/product-description`
- `POST /api/ai/generate-short-description`
- `POST /api/ai/generate-cta`
- `POST /api/ai/generate-seo-title`
- `POST /api/ai/generate-social-post`
- `POST /api/ai/support-chat`
- `POST /api/ai/rewrite-supplier-description`
- `POST /api/ai/suggest-product-tags`
- `POST /api/ai/live-script`
- `POST /api/ai/repair-helper`
- `POST /api/ai/store-description`
- `POST /api/ai/generate-store`
- `POST /api/ai/marketing-pack`

## 8. Hurtownie / supplier import – checklista

Przed aktywacją synchronizacji:
- dodaj hurtownię do systemu
- sprawdź oficjalne presety konektorów
- sprawdź `GET /api/suppliers/official-catalog/status`
- sprawdź `GET /api/suppliers/official-catalog/:slug/env-status`
- uzupełnij sekrety dostawców w `.env`
- uruchom próbny import CSV/XML albo sync API
- zdecyduj, czy `AI_AUTO_SUPPLIER_ENRICH` ma być włączone
- jeśli AI ma czyścić opisy, ustaw też limit `AI_SUPPLIER_ENRICH_LIMIT`

Smoke-test importów:
- `GET /api/suppliers/official-catalog`
- `GET /api/suppliers/official-catalog/:slug`
- `POST /api/suppliers/:id/import`
- `POST /api/suppliers/:id/sync`

## 9. Płatności i komunikacja

Jeśli uruchamiasz płatności i e-mail:
- sprawdź redirecty Stripe względem `APP_URL`
- sprawdź webhook Stripe
- sprawdź webhook płatności ogólnych
- wyślij testową wiadomość SMTP
- sprawdź, czy klient dostaje wiadomości po imporcie / statusie zamówienia

## 10. Smoke-test po wdrożeniu

Minimalny test końcowy:
- rejestracja / logowanie użytkownika
- wejście na storefront
- wyświetlenie listy produktów
- dodanie do koszyka
- wejście na checkout
- wejście do panelu AI `/ai`
- wygenerowanie opisu produktu
- wygenerowanie odpowiedzi supportowej
- wejście do panelu sprzedawcy `/seller`
- wejście do panelu admina `/admin`
- próbny import z hurtowni

## 11. Monitoring po publikacji

W pierwszych 24 godzinach monitoruj:
- logi backendu
- błędy 4xx / 5xx
- czas odpowiedzi endpointów AI
- błędy CORS
- nieudane logowania
- błędy webhooków płatności
- błędy importów hurtowni
- wykorzystanie tokenów / kosztów AI

## 12. Rollback

Jeśli wdrożenie powoduje problemy:
- przełącz frontend na poprzedni build
- przywróć poprzednią wersję backendu
- jeśli była migracja powodująca problem, przywróć backup bazy lub wykonaj procedurę rollback zgodną z polityką zespołu
- tymczasowo ustaw `AI_ENABLED=false`, jeśli problem dotyczy tylko warstwy AI
- tymczasowo wyłącz automatyczne wzbogacanie hurtowni przez `AI_AUTO_SUPPLIER_ENRICH=false`

## 13. Ostateczny sygnał GO-LIVE

Wersję uznaj za gotową do publikacji, gdy:
- backend działa i przechodzi `/health` oraz `/api/readiness`
- frontend przechodzi build na docelowym CI/CD
- panel `/ai` działa po zalogowaniu
- podstawowe endpointy `/api/ai/*` zwracają odpowiedzi
- import hurtowni działa dla co najmniej jednego dostawcy testowego
- panel sprzedawcy i admina otwierają się bez błędów krytycznych
- płatności i mail są zweryfikowane, jeśli są częścią wdrożenia
