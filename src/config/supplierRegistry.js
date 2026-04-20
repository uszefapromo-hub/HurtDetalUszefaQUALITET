'use strict'

const OFFICIAL_SUPPLIER_REGISTRY = [
  {
    slug: 'bigbuy',
    name: 'BigBuy',
    country: 'ES',
    region: 'EU',
    integration_types: ['api', 'json', 'stock-sync'],
    transport: 'api',
    official_url: 'https://www.bigbuy.eu/',
    docs_url: 'https://api.bigbuy.eu/rest/doc',
    onboarding_url: 'https://www.bigbuy.eu/academy/en/how-do-you-obtain-api-access/',
    required_env: ['BIGBUY_API_KEY'],
    notes: 'Oficjalne API REST z autoryzacją Bearer, katalogiem produktów, stockiem i wariantami.',
  },
  {
    slug: 'baselinker',
    name: 'BaseLinker',
    country: 'PL',
    region: 'EU',
    integration_types: ['api', 'inventory', 'external-storage'],
    transport: 'api',
    official_url: 'https://base.com/pl-PL/',
    docs_url: 'https://api.baselinker.com/',
    onboarding_url: 'https://api.baselinker.com/?tester',
    required_env: ['BASELINKER_API_TOKEN'],
    notes: 'Oficjalne API do katalogów, stanów magazynowych i zewnętrznych hurtowni / magazynów.',
  },
  {
    slug: 'dikel',
    name: 'DIKEL',
    country: 'PL',
    region: 'EU',
    integration_types: ['xml', 'base-connect', 'b2b-panel'],
    transport: 'xml',
    official_url: 'https://dikel.pl/wholesale-dropshipping',
    docs_url: 'https://dikel.pl/dropshipping-krok-po-kroku',
    onboarding_url: 'https://dikel.pl/regulamin-dropshipping-2026-02-01',
    required_env: ['DIKEL_XML_URL'],
    notes: 'Oficjalny model dropshipping z Base Connect, panelem B2B oraz XML po uzyskaniu dostępu.',
  },
  {
    slug: 'apilo',
    name: 'Apilo',
    country: 'PL',
    region: 'EU',
    integration_types: ['xml', 'csv', 'api'],
    transport: 'api',
    official_url: 'https://apilo.com/pl/integracje-z-hurtowniami-dropshipping/',
    docs_url: 'https://apilo.com/pl/funkcje-apilo/',
    onboarding_url: 'https://apilo.com/pl/integracje-z-hurtowniami-dropshipping/',
    required_env: ['APILO_API_URL', 'APILO_API_KEY'],
    notes: 'Oficjalna platforma integracyjna wskazująca XML, CSV i API jako standardowe metody współpracy z hurtowniami.',
  },
  {
    slug: 'dropshippingxl',
    name: 'dropshippingXL / vidaXL',
    country: 'NL',
    region: 'EU',
    integration_types: ['api', 'csv', 'order-sync'],
    transport: 'api',
    official_url: 'https://www.dropshippingxl.com/',
    docs_url: 'https://www.dropshippingxl.com/on/demandware.static/-/Sites-dropshippingxl-com-Library/default/B2B_documents/seller_guide/EN.pdf',
    onboarding_url: 'https://www.dropshippingxl.com/',
    required_env: ['DROPSHIPPINGXL_API_TOKEN'],
    notes: 'Oficjalny program dropshippingXL/vidaXL z tokenem API, importem oferty i automatyzacją zamówień.',
  },
  {
    slug: 'printful',
    name: 'Printful',
    country: 'LV',
    region: 'GLOBAL',
    integration_types: ['api', 'pod', 'order-sync'],
    transport: 'api',
    official_url: 'https://www.printful.com/api',
    docs_url: 'https://developers.printful.com/docs/',
    onboarding_url: 'https://www.printful.com/api',
    required_env: ['PRINTFUL_API_KEY'],
    notes: 'Oficjalne API Printful do produktów POD, zamówień, synchronizacji katalogu i fulfillmentu.',
  },
  {
    slug: 'printify',
    name: 'Printify',
    country: 'US',
    region: 'GLOBAL',
    integration_types: ['api', 'pod', 'order-sync'],
    transport: 'api',
    official_url: 'https://printify.com/printify-api/',
    docs_url: 'https://developers.printify.com/',
    onboarding_url: 'https://printify.com/printify-api/',
    required_env: ['PRINTIFY_API_TOKEN'],
    notes: 'Oficjalne REST API Printify do zarządzania sklepem, produktami, blueprintami i zamówieniami.',
  },
  {
    slug: 'cjdropshipping',
    name: 'CJdropshipping',
    country: 'CN',
    region: 'GLOBAL',
    integration_types: ['api', 'json', 'order-sync'],
    transport: 'api',
    official_url: 'https://cjdropshipping.com/',
    docs_url: 'https://developers.cjdropshipping.com/',
    onboarding_url: 'https://developers.cjdropshipping.com/',
    required_env: ['CJDROPSHIPPING_API_KEY'],
    notes: 'Oficjalna dokumentacja developerska CJdropshipping do katalogu, sourcingu, zamówień i trackingów.',
  },
  {
    slug: 'wholesale2b',
    name: 'Wholesale2B',
    country: 'US',
    region: 'GLOBAL',
    integration_types: ['api', 'catalog', 'order-sync'],
    transport: 'api',
    official_url: 'https://www.wholesale2b.com/',
    docs_url: 'https://www.wholesale2b.com/dropship-api-plan.html',
    onboarding_url: 'https://www.wholesale2b.com/dropship-api-plan.html',
    required_env: ['WHOLESALE2B_API_KEY'],
    notes: 'Oficjalny plan Dropship API Wholesale2B do białej etykiety, katalogu produktów i automatyzacji zamówień.',
  },
  {
    slug: 'syncee',
    name: 'Syncee',
    country: 'HU',
    region: 'GLOBAL',
    integration_types: ['api-onboarding', 'csv', 'xml', 'feed-manager'],
    transport: 'hybrid',
    official_url: 'https://syncee.com/',
    docs_url: 'https://syncee.com/',
    onboarding_url: 'https://syncee.com/',
    required_env: ['SYNCEE_API_KEY'],
    notes: 'Oficjalna platforma B2B i datafeed manager; integracje realizowane przez feedy i onboarding partnerski.',
  },
  {
    slug: 'avasam',
    name: 'Avasam',
    country: 'GB',
    region: 'UK',
    integration_types: ['api-onboarding', 'catalog', 'order-automation'],
    transport: 'hybrid',
    official_url: 'https://www.avasam.com/',
    docs_url: 'https://www.avasam.com/dropshipping-companies-to-know/',
    onboarding_url: 'https://www.avasam.com/',
    required_env: ['AVASAM_API_KEY', 'AVASAM_API_URL'],
    notes: 'Oficjalna platforma automatyzacji dropshippingu z dostępem do API i integracji po procesie onboardingowym.',
  },
]

function searchOfficialSuppliers({ query = '', integrationType = '', country = '', transport = '' } = {}) {
  const normalizedQuery = query.trim().toLowerCase()
  const normalizedIntegrationType = integrationType.trim().toLowerCase()
  const normalizedCountry = country.trim().toLowerCase()
  const normalizedTransport = transport.trim().toLowerCase()

  return OFFICIAL_SUPPLIER_REGISTRY.filter((supplier) => {
    const matchesQuery = !normalizedQuery || [
      supplier.slug,
      supplier.name,
      supplier.notes,
      supplier.country,
      supplier.region,
      ...(supplier.integration_types || []),
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)

    const matchesIntegration = !normalizedIntegrationType
      || supplier.integration_types.some((type) => type.toLowerCase().includes(normalizedIntegrationType))

    const matchesCountry = !normalizedCountry
      || [supplier.country, supplier.region].some((value) => String(value).toLowerCase().includes(normalizedCountry))

    const matchesTransport = !normalizedTransport
      || String(supplier.transport || '').toLowerCase().includes(normalizedTransport)

    return matchesQuery && matchesIntegration && matchesCountry && matchesTransport
  })
}

module.exports = {
  OFFICIAL_SUPPLIER_REGISTRY,
  searchOfficialSuppliers,
}
