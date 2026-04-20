/**
 * qm-runtime.js – Early-stage bootstrap for QualitetMarket pages.
 *
 * Loaded synchronously (no defer/async) in <head> so that downstream scripts
 * and inline handlers can rely on the globals set here.
 *
 * Responsibilities:
 *  1. Ensure window.QM_API_BASE points at the production API (if not already
 *     set by an inline <script> above this tag).
 *  2. Expose window.QMSafeRedirect if security-guard.js was not loaded on
 *     this page (dashboard pages omit security-guard.js).
 *  3. Mark the runtime as initialised so other scripts can feature-detect.
 */
(function () {
  'use strict';

  // ── 1. API base URL ─────────────────────────────────────────────────────────
  if (!window.QM_API_BASE) {
    window.QM_API_BASE = 'https://api.qualitet-market.com/api';
  }

  // ── 2. Safe-redirect shim (if security-guard.js was not loaded) ─────────────
  if (typeof window.QMSafeRedirect !== 'function') {
    var ALLOWED_ORIGINS = [
      window.location.origin,
      'https://www.qualitet-market.com',
      'https://qualitet-market.com'
    ];

    window.QMSafeRedirect = function (url, fallback) {
      if (!url) { window.location.href = fallback || '/'; return; }
      try {
        var parsed = new URL(url, window.location.origin);
        for (var i = 0; i < ALLOWED_ORIGINS.length; i++) {
          if (parsed.origin === ALLOWED_ORIGINS[i]) {
            window.location.href = url;
            return;
          }
        }
      } catch (_) { /* malformed URL – fall through to fallback */ }
      window.location.href = fallback || '/';
    };
  }

  // ── 3. Runtime flag ─────────────────────────────────────────────────────────
  window.QM_RUNTIME_READY = true;
})();
