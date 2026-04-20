
'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '../../storage');
const CONFIG_FILE = path.join(CONFIG_DIR, 'runtime-config.json');

const DEFAULTS = {
  app: {
    app_url: '',
    dashboard_url: '',
    allowed_origins: '',
    public_domain: 'https://www.qualitet-market.com',
    api_base_url: '',
  },
  stripe: {
    secret_key: '',
    publishable_key: '',
    webhook_secret: '',
    price_ids: {
      basic: '',
      pro: '',
      elite: '',
      premium: '',
      supplier_basic: '',
      supplier_pro: '',
      brand: '',
      artist_pro: '',
    },
  },
  netlify: {
    site_id: '',
    access_token: '',
    build_hook_url: '',
    publish_dir: '.',
    build_command: '',
    production_branch: 'main',
  },
  zoho: {
    org_email: '',
    smtp_host: 'smtp.zoho.eu',
    smtp_port: '465',
    smtp_secure: 'true',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    imap_host: 'imap.zoho.eu',
    imap_port: '993',
  },
};

function ensureDir() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

function deepMerge(target, source) {
  const out = Array.isArray(target) ? [...target] : { ...target };
  for (const [key, value] of Object.entries(source || {})) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      target &&
      typeof target[key] === 'object' &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      out[key] = deepMerge(target[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function sanitizeConfig(config) {
  return deepMerge(DEFAULTS, config || {});
}

function loadControlConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return sanitizeConfig({});
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    return sanitizeConfig(JSON.parse(raw));
  } catch (err) {
    console.error('[controlConfig] load error:', err.message);
    return sanitizeConfig({});
  }
}

function saveControlConfig(partialConfig) {
  ensureDir();
  const current = loadControlConfig();
  const merged = sanitizeConfig(deepMerge(current, partialConfig || {}));
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

function getConfigValue(pathKey, fallback = '') {
  const config = loadControlConfig();
  const value = pathKey.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), config);
  return value !== undefined && value !== null && value !== '' ? value : fallback;
}

function getRuntimeValue(envKey, pathKey, fallback = '') {
  const envValue = process.env[envKey];
  if (envValue !== undefined && envValue !== null && String(envValue).trim() !== '') return envValue;
  return getConfigValue(pathKey, fallback);
}

function getPublicControlConfig() {
  const config = loadControlConfig();
  return {
    app: config.app,
    stripe: {
      publishable_key: config.stripe.publishable_key || '',
      webhook_secret_masked: config.stripe.webhook_secret ? maskSecret(config.stripe.webhook_secret) : '',
      secret_key_masked: config.stripe.secret_key ? maskSecret(config.stripe.secret_key) : '',
      price_ids: config.stripe.price_ids,
    },
    netlify: {
      ...config.netlify,
      access_token_masked: config.netlify.access_token ? maskSecret(config.netlify.access_token) : '',
    },
    zoho: {
      ...config.zoho,
      smtp_pass_masked: config.zoho.smtp_pass ? maskSecret(config.zoho.smtp_pass) : '',
    },
  };
}

function maskSecret(value) {
  if (!value) return '';
  const s = String(value);
  if (s.length <= 8) return '••••••••';
  return `${s.slice(0, 4)}••••${s.slice(-4)}`;
}

module.exports = {
  DEFAULTS,
  CONFIG_FILE,
  loadControlConfig,
  saveControlConfig,
  getRuntimeValue,
  getConfigValue,
  getPublicControlConfig,
  maskSecret,
};
