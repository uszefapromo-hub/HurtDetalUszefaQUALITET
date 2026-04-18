# Katalog oficjalnych integracji hurtowni i dropshippingu

Projekt zawiera rozszerzony katalog oficjalnych dostawców oraz szkielety konektorów dla integracji legalnie udostępnianych przez dostawców lub przez onboarding partnerski.

## Dostawcy w katalogu

| Slug | Nazwa | Kraj / region | Transport | Typy integracji | Wymagane env |
|---|---|---|---|---|---|
| `bigbuy` | BigBuy | ES / EU | API | api, json, stock-sync | `BIGBUY_API_KEY` |
| `baselinker` | BaseLinker | PL / EU | API | api, inventory, external-storage | `BASELINKER_API_TOKEN` |
| `dikel` | DIKEL | PL / EU | XML | xml, base-connect, b2b-panel | `DIKEL_XML_URL` |
| `apilo` | Apilo | PL / EU | API | xml, csv, api | `APILO_API_URL`, `APILO_API_KEY` |
| `dropshippingxl` | dropshippingXL / vidaXL | NL / EU | API | api, csv, order-sync | `DROPSHIPPINGXL_API_TOKEN` |
| `printful` | Printful | LV / GLOBAL | API | api, pod, order-sync | `PRINTFUL_API_KEY` |
| `printify` | Printify | US / GLOBAL | API | api, pod, order-sync | `PRINTIFY_API_TOKEN` |
| `cjdropshipping` | CJdropshipping | CN / GLOBAL | API | api, json, order-sync | `CJDROPSHIPPING_API_KEY` |
| `wholesale2b` | Wholesale2B | US / GLOBAL | API | api, catalog, order-sync | `WHOLESALE2B_API_KEY` |
| `syncee` | Syncee | HU / GLOBAL | HYBRID | api-onboarding, csv, xml, feed-manager | `SYNCEE_API_KEY` |
| `avasam` | Avasam | GB / UK | HYBRID | api-onboarding, catalog, order-automation | `AVASAM_API_URL`, `AVASAM_API_KEY` |

## Endpointy katalogu hurtowni

Po zalogowaniu dostępne są:
- `GET /api/suppliers/official-catalog`
- `GET /api/suppliers/official-catalog?q=...&integration_type=...&country=...&transport=...`
- `GET /api/suppliers/official-catalog/status`
- `GET /api/suppliers/official-catalog/:slug`
- `GET /api/suppliers/official-catalog/:slug/env-status`

## Co zwraca katalog

Katalog zwraca:
- dane oficjalnego dostawcy
- linki do strony głównej, dokumentacji i onboardingu
- typ transportu i typy integracji
- preset konektora
- listę wymaganych zmiennych środowiskowych
- status konfiguracji env dla każdego konektora

## AI i import hurtowni

Importy CSV/XML/API mogą zostać wzbogacone przez AI:
- `AI_AUTO_SUPPLIER_ENRICH=true` – automatyczne czyszczenie opisów podczas importu i sync
- `AI_SUPPLIER_ENRICH_LIMIT` – limit liczby produktów wzbogacanych w jednej operacji
- alternatywnie można wysłać `ai_clean=true` w body requestu importu lub synchronizacji

## Uwagi wdrożeniowe

- Nie wszystkie integracje są typu „plug-and-play”; część wymaga aktywacji konta B2B lub partner onboarding.
- Konektory w projekcie są przygotowane jako bezpieczne szkielety konfiguracyjne zgodne z oficjalnie dostępnymi metodami połączenia.
- Dla dostawców feedowych należy otrzymać prawidłowy URL XML/CSV lub token API bezpośrednio od operatora integracji.
