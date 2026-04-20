'use strict'

const { OFFICIAL_SUPPLIER_REGISTRY } = require('../config/supplierRegistry')

const CONNECTOR_PRESETS = {
  bigbuy: {
    slug: 'bigbuy',
    label: 'BigBuy REST API',
    transport: 'api',
    requiredEnv: ['BIGBUY_API_KEY'],
    testEndpoint: 'https://api.bigbuy.eu/rest/catalog/products.json',
    sampleHeaders: {
      Authorization: 'Bearer ${BIGBUY_API_KEY}',
      Accept: 'application/json',
    },
    samplePayload: null,
    notes: 'Oficjalny konektor katalogu, stanów i wariantów BigBuy. Wymaga aktywnego klucza API.',
  },
  baselinker: {
    slug: 'baselinker',
    label: 'BaseLinker API',
    transport: 'api',
    requiredEnv: ['BASELINKER_API_TOKEN'],
    testEndpoint: 'https://api.baselinker.com/connector.php',
    sampleHeaders: {
      'X-BLToken': '${BASELINKER_API_TOKEN}',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    samplePayload: {
      method: 'getInventories',
      parameters: '{}',
    },
    notes: 'Szkielet do podłączenia magazynu / hurtowni przez oficjalne API BaseLinker.',
  },
  dikel: {
    slug: 'dikel',
    label: 'DIKEL XML / Base Connect',
    transport: 'xml',
    requiredEnv: ['DIKEL_XML_URL'],
    testEndpoint: '${DIKEL_XML_URL}',
    sampleHeaders: {},
    samplePayload: null,
    notes: 'Konektor pod feed XML lub Base Connect po uzyskaniu dostępu od DIKEL.',
  },
  apilo: {
    slug: 'apilo',
    label: 'Apilo XML / CSV / API',
    transport: 'api',
    requiredEnv: ['APILO_API_URL', 'APILO_API_KEY'],
    testEndpoint: '${APILO_API_URL}',
    sampleHeaders: {
      Authorization: 'Bearer ${APILO_API_KEY}',
      Accept: 'application/json',
    },
    samplePayload: null,
    notes: 'Szkielet pod oficjalną integrację Apilo lub feed XML/CSV po otrzymaniu danych dostępowych.',
  },
  dropshippingxl: {
    slug: 'dropshippingxl',
    label: 'dropshippingXL / vidaXL API',
    transport: 'api',
    requiredEnv: ['DROPSHIPPINGXL_API_TOKEN'],
    testEndpoint: 'https://www.dropshippingxl.com/',
    sampleHeaders: {
      Authorization: 'Bearer ${DROPSHIPPINGXL_API_TOKEN}',
      Accept: 'application/json',
    },
    samplePayload: null,
    notes: 'Szkielet dla dropshippingXL/vidaXL z tokenem API do oferty i automatyzacji zamówień.',
  },
  printful: {
    slug: 'printful',
    label: 'Printful API',
    transport: 'api',
    requiredEnv: ['PRINTFUL_API_KEY'],
    testEndpoint: 'https://api.printful.com/store/products',
    sampleHeaders: {
      Authorization: 'Bearer ${PRINTFUL_API_KEY}',
      Accept: 'application/json',
    },
    samplePayload: null,
    notes: 'Oficjalny konektor POD Printful dla produktów, wariantów, zamówień i fulfillmentu.',
  },
  printify: {
    slug: 'printify',
    label: 'Printify API',
    transport: 'api',
    requiredEnv: ['PRINTIFY_API_TOKEN'],
    testEndpoint: 'https://api.printify.com/v1/shops.json',
    sampleHeaders: {
      Authorization: 'Bearer ${PRINTIFY_API_TOKEN}',
      Accept: 'application/json',
    },
    samplePayload: null,
    notes: 'Oficjalny konektor Printify do produktów, blueprintów, cen, mockupów i zamówień.',
  },
  cjdropshipping: {
    slug: 'cjdropshipping',
    label: 'CJdropshipping API',
    transport: 'api',
    requiredEnv: ['CJDROPSHIPPING_API_KEY'],
    testEndpoint: 'https://developers.cjdropshipping.com/',
    sampleHeaders: {
      'CJ-Access-Token': '${CJDROPSHIPPING_API_KEY}',
      Accept: 'application/json',
    },
    samplePayload: null,
    notes: 'Szkielet oficjalnej integracji CJdropshipping dla katalogu, sourcingu i zamówień.',
  },
  wholesale2b: {
    slug: 'wholesale2b',
    label: 'Wholesale2B Dropship API',
    transport: 'api',
    requiredEnv: ['WHOLESALE2B_API_KEY'],
    testEndpoint: 'https://www.wholesale2b.com/dropship-api-plan.html',
    sampleHeaders: {
      Authorization: 'Bearer ${WHOLESALE2B_API_KEY}',
      Accept: 'application/json',
    },
    samplePayload: null,
    notes: 'Szkielet dla oficjalnego planu API Wholesale2B do białej etykiety i automatyzacji oferty.',
  },
  syncee: {
    slug: 'syncee',
    label: 'Syncee Feed / API onboarding',
    transport: 'hybrid',
    requiredEnv: ['SYNCEE_API_KEY'],
    testEndpoint: 'https://syncee.com/',
    sampleHeaders: {
      Authorization: 'Bearer ${SYNCEE_API_KEY}',
      Accept: 'application/json',
    },
    samplePayload: null,
    notes: 'Szkielet integracji feed/API dla Syncee. Dostęp zwykle zależny od onboardingu partnera i typu konta.',
  },
  avasam: {
    slug: 'avasam',
    label: 'Avasam API onboarding',
    transport: 'hybrid',
    requiredEnv: ['AVASAM_API_URL', 'AVASAM_API_KEY'],
    testEndpoint: '${AVASAM_API_URL}',
    sampleHeaders: {
      Authorization: 'Bearer ${AVASAM_API_KEY}',
      Accept: 'application/json',
    },
    samplePayload: null,
    notes: 'Szkielet dla Avasam z konfiguracją endpointu i klucza po otrzymaniu dostępu API.',
  },
}

function getSupplierConnectorPreset(slug) {
  if (!slug) return null
  return CONNECTOR_PRESETS[String(slug).toLowerCase()] || null
}

function getConnectorEnvStatus(requiredEnv = []) {
  const populated = []
  const missing = []

  for (const envName of requiredEnv) {
    if (process.env[envName]) {
      populated.push(envName)
    } else {
      missing.push(envName)
    }
  }

  return {
    configured: missing.length === 0 && requiredEnv.length > 0,
    populatedEnv: populated,
    missingEnv: missing,
  }
}

function getSupplierConnectorStatus(slug) {
  const connector = getSupplierConnectorPreset(slug)
  if (!connector) return null

  const envStatus = getConnectorEnvStatus(connector.requiredEnv)
  return {
    ...connector,
    ...envStatus,
  }
}

function listSupplierConnectorPresets() {
  return OFFICIAL_SUPPLIER_REGISTRY.map((supplier) => ({
    ...supplier,
    connector: getSupplierConnectorPreset(supplier.slug),
  }))
}

function listSupplierConnectorStatuses() {
  return OFFICIAL_SUPPLIER_REGISTRY.map((supplier) => ({
    ...supplier,
    connector: getSupplierConnectorStatus(supplier.slug),
  }))
}

module.exports = {
  CONNECTOR_PRESETS,
  getSupplierConnectorPreset,
  getSupplierConnectorStatus,
  listSupplierConnectorPresets,
  listSupplierConnectorStatuses,
}
