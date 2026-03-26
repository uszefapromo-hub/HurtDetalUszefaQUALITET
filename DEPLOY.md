# 🚀 DEPLOY – PANEL ZEWNĘTRZNY (BEZ ZMIANY SYSTEMU)

> NIE zmieniamy architektury. NIE cofamy projektu. NIE przebudowujemy logiki.
>
> 👉 Wystawiamy istniejący panel na zewnątrz.

---

## CEL

Panel działa lokalnie → ma działać publicznie (URL).

Repozytorium zawiera gotową konfigurację dla **trzech platform** statycznego hostingu oraz **Railway** (z serwerem Node):

| Platforma | Plik konfiguracyjny | Czas wdrożenia |
|-----------|---------------------|----------------|
| **Netlify** | `netlify.toml` + `_redirects` | ~2 min |
| **Vercel** | `vercel.json` | ~2 min |
| **GitHub Pages** | `.github/workflows/pages.yml` + `.nojekyll` | ~3 min |
| **Railway** | `nixpacks.toml` + `package.json` | ~5 min |

---

## OPCJA 1 – NETLIFY (najszybsza, drag & drop)

1. Wejdź na [netlify.com](https://netlify.com) → **Sign up** (konto GitHub)
2. Kliknij **Add new site → Import an existing project** lub **Deploy manually**
3. **Drag & drop**: wrzuć cały folder repozytorium do przeglądarki na stronie Netlify
4. Netlify automatycznie odczyta `netlify.toml`:
   - **Publish directory:** `.` (korzeń repo)
   - **Build command:** *(brak – strona statyczna)*
   - **Start page:** `index.html`
5. Kliknij **Deploy site** → po ~30 sekundach dostaniesz publiczny URL, np. `https://qualitet-abc123.netlify.app`

### Własna domena na Netlify
1. Site settings → **Domain management → Add custom domain**
2. Wpisz `uszefaqualitet.pl`
3. Zaktualizuj rekordy DNS u rejestratora domeny na nameservery Netlify

---

## OPCJA 2 – VERCEL

1. Wejdź na [vercel.com](https://vercel.com) → **Sign up** (konto GitHub)
2. Kliknij **New Project → Import Git Repository**
3. Wybierz repozytorium `qualitet-market`
4. Vercel odczyta `vercel.json` automatycznie:
   - **Framework Preset:** Other
   - **Root directory:** `.`
   - **Output directory:** `.`
   - **Start page:** `index.html`
5. Kliknij **Deploy** → URL pojawi się po ~1 minucie

### Własna domena na Vercel
1. Project → **Settings → Domains → Add**
2. Wpisz `uszefaqualitet.pl`
3. Dodaj rekord CNAME u rejestratora: `cname.vercel-dns.com`

---

## OPCJA 3 – GITHUB PAGES (automatyczne CI/CD)

Repozytorium ma gotowy workflow: `.github/workflows/pages.yml`

1. Wejdź w repo na GitHub → **Settings → Pages**
2. W sekcji **Source** wybierz **GitHub Actions**
3. Przy każdym pushu na branch `main` strona zostanie automatycznie wdrożona
4. URL: `https://<org>.github.io/<repo>/` lub własna domena z CNAME

> **Uwaga:** plik `CNAME` w repozytorium (`uszefaqualitet.pl`) jest automatycznie odczytywany przez GitHub Pages jako własna domena.

---

## OPCJA 4 – RAILWAY (z serwerem Node)

Używana gdy potrzebny jest pełny serwer HTTP (np. do obsługi przekierowań po stronie serwera):

1. Wejdź na [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
2. Wybierz `qualitet-market`
3. Railway odczyta `nixpacks.toml` i `package.json`:
   - Instaluje `serve` (serwer statyczny Node.js)
   - Uruchamia: `npm start` → `serve -s . -l $PORT`
4. Kliknij **Deploy** → URL w formacie `https://qualitet-market-xxx.up.railway.app`

---

## Sprawdzenie działania po wdrożeniu

Po wdrożeniu na dowolną platformę sprawdź:

- [ ] `https://<twoj-url>/` → otwiera `index.html`
- [ ] `https://<twoj-url>/sklep` → przekierowuje do `sklep.html`
- [ ] `https://<twoj-url>/koszyk` → przekierowuje do `koszyk.html`
- [ ] `https://<twoj-url>/nieistniejaca-strona` → pokazuje `404.html` (nie błąd platformy)
- [ ] `https://<twoj-url>/dashboard.html` → panel działa

---

## Zmienne środowiskowe frontendu

Panel frontendowy odczytuje URL backendu API z `window.QM_API_BASE`.  
Domyślnie wskazuje na `https://api.uszefaqualitet.pl/api`.

Aby zmienić, zmodyfikuj przed wdrożeniem w pliku `js/api.js`:

```js
window.QM_API_BASE = 'https://twoj-backend.railway.app/api';
```

---

## Backend (API)

Frontend jest statyczny – backend to oddzielna aplikacja Node.js/Express w katalogu `backend/`.  
Instrukcja wdrożenia backendu: [`backend/README.md`](backend/README.md)
