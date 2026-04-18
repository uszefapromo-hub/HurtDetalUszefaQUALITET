# GO-LIVE Checklist – Qualitet Market

## T-60 do T-30 minut

- [ ] Potwierdź okno wdrożeniowe i osobę odpowiedzialną za deploy
- [ ] Wykonaj backup bazy PostgreSQL
- [ ] Zachowaj kopię aktualnych sekretów i plików `.env`
- [ ] Przygotuj rollback do poprzedniego buildu frontendu i backendu
- [ ] Sprawdź, czy produkcyjne domeny i `ALLOWED_ORIGINS` są poprawne

## T-30 do T-15 minut

- [ ] Uzupełnij produkcyjny `backend/.env`
- [ ] Ustaw `NODE_ENV=production`
- [ ] Ustaw `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- [ ] Ustaw bezpieczny `JWT_SECRET`
- [ ] Ustaw `APP_URL`
- [ ] Ustaw `OPENAI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`, `AI_TIMEOUT_MS`
- [ ] Ustaw `NEXT_PUBLIC_API_URL` w froncie
- [ ] Ustaw `EXPO_PUBLIC_API_URL` w mobile
- [ ] Jeśli używasz integracji hurtowni, uzupełnij klucze dostawców (BigBuy, BaseLinker, DIKEL, Apilo, dropshippingXL/vidaXL, Printful, Printify, CJdropshipping, Wholesale2B, Syncee, Avasam)
- [ ] Jeśli używasz płatności, uzupełnij Stripe / P24
- [ ] Jeśli używasz maili, uzupełnij SMTP

## T-15 do T-5 minut

- [ ] Wdróż backend
- [ ] Uruchom migracje: `npm run migrate`
- [ ] Utwórz konto ownera: `npm run seed:owner`
- [ ] Zweryfikuj `GET /health`
- [ ] Zweryfikuj `GET /api/readiness`
- [ ] Sprawdź logi backendu po starcie
- [ ] Wdróż frontend i wykonaj produkcyjny build
- [ ] Zweryfikuj trasę `/`
- [ ] Zweryfikuj trasę `/ai`
- [ ] Zweryfikuj trasę `/seller`
- [ ] Zweryfikuj trasę `/admin`

## GO-LIVE

- [ ] Zaloguj testowego użytkownika
- [ ] Otwórz storefront i listę produktów
- [ ] Dodaj produkt do koszyka
- [ ] Otwórz checkout
- [ ] Otwórz panel AI `/ai`
- [ ] Wygeneruj opis produktu
- [ ] Wygeneruj odpowiedź supportową
- [ ] Sprawdź, czy `/api/ai/*` odpowiada po zalogowaniu
- [ ] Sprawdź `GET /api/suppliers/official-catalog/status`
- [ ] Wykonaj test importu hurtowni lub sync testowego dostawcy
- [ ] Sprawdź panel sprzedawcy i panel admina bez błędów krytycznych

## Pierwsze 15 minut po publikacji

- [ ] Monitoruj logi 4xx / 5xx
- [ ] Sprawdź błędy CORS
- [ ] Sprawdź błędy webhooków płatności
- [ ] Sprawdź błędy integracji hurtowni
- [ ] Sprawdź czas odpowiedzi endpointów AI
- [ ] Potwierdź, że fallback mock AI nie włączył się omyłkowo

## Warunek rollbacku

- [ ] Jeśli storefront, logowanie, checkout albo `/ai` są krytycznie uszkodzone, wykonaj rollback
- [ ] Jeśli problem dotyczy tylko AI, tymczasowo ustaw `AI_ENABLED=false`
- [ ] Jeśli problem dotyczy importów hurtowni, ustaw `AI_AUTO_SUPPLIER_ENRICH=false`
