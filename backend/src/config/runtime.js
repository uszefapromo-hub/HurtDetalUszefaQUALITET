'use strict';

const INSECURE_JWT_SECRETS = new Set([
  'change_this_secret',
  'your_super_secret_jwt_key_change_this_in_production',
]);

function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'change_this_secret';

  if (process.env.NODE_ENV === 'production' && INSECURE_JWT_SECRETS.has(secret)) {
    throw new Error('JWT_SECRET musi być ustawiony na bezpieczną wartość w środowisku production');
  }

  return secret;
}

function validateRuntimeConfig() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (getAllowedOrigins().length === 0) {
    throw new Error('ALLOWED_ORIGINS musi być ustawione w środowisku production');
  }

  getJwtSecret();
}

module.exports = {
  getAllowedOrigins,
  getJwtSecret,
  validateRuntimeConfig,
};
