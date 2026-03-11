# HurtDetalUszefaQUALITET

Link do podglądu platformy: https://uszefaqualitet.pl

---

## 🛠️ Stack technologiczny

Poniżej dokładny opis technologii użytych w platformie.

### Frontend
- **HTML5** – struktura wszystkich widoków
- **CSS3** – style pisane ręcznie (bez preprocessorów), podzielone na arkusze: `css/style.css`, `panel.css`, `shop.css`, `landing.css`, `styles.css`
- **Vanilla JavaScript (ES2015+)** – cała logika aplikacji (bez React, Vue, Angular, Next.js ani żadnego frontendowego frameworka)
- **PWA (Progressive Web App)** – `service-worker.js` + `manifest.json` umożliwiają instalację aplikacji na urządzeniu i działanie offline

### Backend
- **Brak backendu** – platforma jest w **100% statyczna** (nie ma serwera Node.js, PHP/Laravel, Python/Django ani żadnego innego backendu)
- Cała logika biznesowa (logowanie, plany, ustawienia sklepu, produkty) działa po stronie przeglądarki w JavaScript

### Baza danych
- **Brak bazy danych** (bez MySQL, PostgreSQL, MongoDB itp.)
- Dane są przechowywane wyłącznie w **`localStorage` przeglądarki** po stronie klienta – dane nie są zapisywane na serwerze i nie są współdzielone między urządzeniami

### Hosting / serwer
- **GitHub Pages** – statyczny hosting bezserwerowy
- Domena: **uszefaqualitet.pl** (CNAME skonfigurowany w repozytorium)
- Nie ma serwera VPS, chmury (AWS/GCP/Azure) ani własnej infrastruktury

### API
- **Brak API po stronie serwera** – nie istnieje żaden endpoint REST/GraphQL
- Aplikacja nie wysyła żadnych żądań HTTP do własnego backendu
- Wszystkie dane (produkty, hurtownie, użytkownicy) to dane demo zakodowane na stałe w plikach JavaScript (`js/app.js`, `stores.js`, `shop.js`)

### Integracje z hurtowniami i import produktów

> ⚠️ **Stan aktualny: brak rzeczywistych integracji**

- Hurtownie widoczne w panelu (w tym **BigBuy**) to **dane mockowe (demo)** – produkty i dostawcy są zakodowani na stałe w `js/app.js`
- „Import" produktów z hurtowni działa wyłącznie na tych danych demo i zapisuje je do `localStorage` – nie ma połączenia z żadnym zewnętrznym API ani plikiem XML/CSV
- **Nie ma** aktualnie:
  - połączenia z API BigBuy (REST API BigBuy wymaga konta B2B i klucza API)
  - importu plików XML / CSV z hurtowni
  - automatycznej synchronizacji stanów magazynowych ani cen
  - webhooków ani innych mechanizmów integracyjnych

### Co jest potrzebne do prawdziwych integracji?

Aby podpiąć BigBuy lub inne hurtownie przez API / XML / CSV, platforma wymagałaby:

1. **Backendu** (np. Node.js + Express, PHP/Laravel lub Python/FastAPI) – do obsługi kluczy API, przetwarzania danych, autoryzacji
2. **Bazy danych** (np. PostgreSQL lub MySQL) – do trwałego przechowywania produktów, zamówień, użytkowników
3. **Integracji API BigBuy** – BigBuy udostępnia REST API (JSON) oraz feed XML/CSV dla partnerów B2B
4. **Hostingu z serwerem** (np. VPS, Railway, Render, DigitalOcean) – GitHub Pages obsługuje wyłącznie pliki statyczne

---

### Tabela podsumowująca

| Warstwa           | Aktualna technologia              | Uwagi                                          |
|-------------------|-----------------------------------|------------------------------------------------|
| Frontend          | HTML5 / CSS3 / Vanilla JS         | Bez frameworka (bez React, Vue, Next.js)       |
| Backend           | ❌ Brak                           | Statyczna strona                               |
| Baza danych       | ❌ Brak (tylko `localStorage`)    | Dane tymczasowe, tylko w przeglądarce          |
| Hosting           | GitHub Pages                      | Domena: uszefaqualitet.pl                      |
| API               | ❌ Brak                           | Brak endpointów serwer-side                    |
| PWA               | ✅ Service Worker + Manifest      | Działa offline, instalowalna                   |
| Integracje hurt.  | ❌ Brak (tylko dane demo)         | BigBuy i in. to mock – brak prawdziwego API    |
| Import XML/CSV    | ❌ Brak                           | Nie zaimplementowano                           |
