'use strict';

/**
 * Middleware: resolveStoreFromSubdomain
 *
 * Reads the Host header, extracts the subdomain from *.qualitetmarket.pl,
 * looks up the store by slug, and attaches it to req.store.
 *
 * If the host is not a subdomain of BASE_DOMAIN the middleware calls next()
 * without setting req.store (the route handler is responsible for the 404).
 *
 * If the subdomain resolves to a blocked or non-existent store the middleware
 * responds with 404 immediately.
 */

const db = require('../config/database');

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'qualitetmarket.pl';

async function resolveStoreFromSubdomain(req, res, next) {
  const rawHost = (req.headers.host || '').toLowerCase();
  const host = rawHost.split(':')[0]; // strip optional port

  if (!host.endsWith(`.${BASE_DOMAIN}`)) {
    // Not a subdomain request – let the route handler decide
    return next();
  }

  const slug = host.slice(0, host.length - BASE_DOMAIN.length - 1);

  // Reject empty or nested subdomain (e.g. a.b.qualitetmarket.pl)
  if (!slug || slug.includes('.')) {
    return next();
  }

  try {
    const result = await db.query(
      `SELECT id, name, slug, description, logo_url, status, subdomain_blocked, created_at
       FROM stores
       WHERE slug = $1
         AND status IN ('active', 'pending')
         AND subdomain_blocked = false`,
      [slug]
    );

    const store = result.rows[0];
    if (!store) {
      return res.status(404).json({ error: 'Sklep nie znaleziony' });
    }

    req.store = store;
    return next();
  } catch (err) {
    console.error('resolveStoreFromSubdomain error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
}

module.exports = { resolveStoreFromSubdomain };
