# HurtDetalUszefaQUALITET / Qualitet Market

Podgląd produkcyjny: https://uszefaqualitet.pl

## Final release

Ten pakiet został przygotowany jako **final-release** z dołączoną checklistą wdrożenia. Warstwa web AI została poprawiona dla Next.js 15 przez opakowanie użycia `useSearchParams` w `Suspense`, a projekt przeszedł lokalną kontrolę składni backendu oraz typecheck frontend/mobile.

Weryfikacja lokalna final-release:
- `frontend`: `npx tsc --noEmit` ✅
- `mobile`: `npx tsc --noEmit` ✅
- `backend`: kontrola składni kluczowych plików `node --check` ✅
- `frontend build`: kompilacja w sandboxie była ograniczona przez zasoby procesu (`SIGKILL`), dlatego obowiązkowy build produkcyjny należy wykonać na docelowym CI/CD lub serwerze buildowym

Checklistę wdrożenia znajdziesz w pliku `DEPLOYMENT_CHECKLIST_FINAL_RELEASE.md`.

## Co jest główne w projekcie

Projekt ma trzy aktywne warstwy:
- `frontend/` – główny storefront i panele webowe w Next.js 15
- `backend/` – główne REST API Express + PostgreSQL, importy hurtowni, AI, checkout, social i live
- `mobile/` – aplikacja Expo / React Native z obsługą logowania i ekranem AI

Najważniejsze obszary produkcyjne:
- storefront web: `frontend/src/app/page.tsx`
- panel AI web: `frontend/src/app/ai/page.tsx`
- panel sprzedawcy: `frontend/src/app/seller/page.tsx`
- panel admina: `frontend/src/app/admin/page.tsx`
- backend API: `backend/src/app.js`
- centralny silnik AI: `backend/src/core/ai-engine.js`
- endpointy AI: `backend/src/modules/ai/*`
- hurtownie i importy: `backend/src/routes/suppliers.js`
- oficjalne szkielety konektorów: `backend/src/services/supplier-connectors.js`
- rozszerzony katalog hurtowni: `SUPPLIER_CATALOG.md`

## Szybki start lokalny

### Backend

```bash
cd backend
npm install
cp .env.example .env
# uzupełnij DB_PASSWORD, JWT_SECRET i opcjonalnie OPENAI_API_KEY
createdb hurtdetal_qualitet
npm run migrate
npm run dev
```

API domyślnie działa pod adresem `http://localhost:3000/api`.

### Frontend web

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

W `frontend/.env.local.example` ustaw adres API, np.:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Mobile

```bash
cd mobile
npm install
cp .env.example .env.local
npm run start
```

Na telefonie ustaw `EXPO_PUBLIC_API_URL` na adres LAN komputera, np. `http://192.168.1.10:3000/api`.

## Konfiguracja AI

W `backend/.env.example` są już dodane wszystkie potrzebne placeholdery:
- `OPENAI_API_KEY`
- `AI_PROVIDER`
- `AI_MODEL`
- `AI_TIMEOUT_MS`
- `AI_AUTO_SUPPLIER_ENRICH`
- `AI_SUPPLIER_ENRICH_LIMIT`

Jeżeli nie ustawisz klucza AI, system przejdzie w bezpieczny tryb lokalny i zwróci robocze odpowiedzi testowe zamiast prawdziwej generacji.

## Gdzie znaleźć Panel AI

### Web
- ścieżka: `/ai`
- dostęp z nawigacji dolnej i z nagłówka
- szybkie narzędzia: opis produktu, krótki opis, CTA, SEO, social, support, hurtownie, live, naprawy, generator sklepu, marketing pack

### Mobile
- zakładka `AI`
- szybkie akcje dla czatu, opisu produktu, supportu i napraw

## Endpointy AI

Wszystkie endpointy wymagają zalogowania i są dostępne pod `/api/ai`.

Najważniejsze:
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

## Workflow hurtowni / supplier import

1. Dodaj hurtownię w panelu lub przez API `POST /api/suppliers`
2. Sprawdź oficjalne presety konektorów:
   - `GET /api/suppliers/official-catalog`
   - `GET /api/suppliers/official-catalog/:slug`
3. Zweryfikuj status konfiguracji integracji:
   - `GET /api/suppliers/official-catalog/status`
   - `GET /api/suppliers/official-catalog/:slug/env-status`
4. Uzupełnij dane dostępowe w `.env`
5. Importuj katalog:
   - plik CSV/XML: `POST /api/suppliers/:id/import`
   - API sync: `POST /api/suppliers/:id/sync`
6. Aby włączyć czyszczenie opisów hurtowni przez AI, ustaw `ai_clean=true` w body lub `AI_AUTO_SUPPLIER_ENRICH=true` w `.env`

## Co zostało zintegrowane

- jeden centralny silnik AI w backendzie
- polski panel AI w web i mobile
- szybkie wejścia AI w panelu sprzedawcy i admina
- rozszerzone endpointy AI zgodne z konwencją projektu
- warstwa naprawcza AI do diagnostyki i rekomendacji napraw
- ujednolicony katalog oficjalnych konektorów hurtowni bez scrapingu
- rozszerzony katalog dostawców: BigBuy, BaseLinker, DIKEL, Apilo, dropshippingXL/vidaXL, Printful, Printify, CJdropshipping, Wholesale2B, Syncee i Avasam
- endpointy do sprawdzania statusu env dla każdej integracji hurtowni

## Uwaga bezpieczeństwa

Nie commituj prawdziwych sekretów do repozytorium. Dotyczy to zwłaszcza: `JWT_SECRET`, `OPENAI_API_KEY`, tokenów hurtowni, SMTP i Stripe.
