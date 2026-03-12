'use strict';

const { v4: uuidv4 } = require('uuid');

// Lazy-require db to avoid circular dependency issues
let db;
function getDb() {
  if (!db) db = require('../config/database');
  return db;
}

/**
 * Fire-and-forget audit log writer.
 * Writes an entry into the audit_logs table; never throws.
 *
 * @param {object} opts
 * @param {string}  opts.actorUserId  – UUID of the user performing the action
 * @param {string}  opts.action       – e.g. 'user.deleted', 'store.status_changed'
 * @param {string}  [opts.resource]   – entity type, e.g. 'user', 'store', 'product'
 * @param {string}  [opts.resourceId] – UUID of the affected entity
 * @param {object}  [opts.metadata]   – additional context (serialised as JSONB)
 * @param {string}  [opts.ipAddress]  – originating IP address
 */
async function auditLog({ actorUserId, action, resource = null, resourceId = null, metadata = null, ipAddress = null }) {
  try {
    await getDb().query(
      `INSERT INTO audit_logs
         (id, user_id, action, resource, resource_id, metadata, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        uuidv4(),
        actorUserId || null,
        action,
        resource,
        resourceId || null,
        metadata ? JSON.stringify(metadata) : null,
        ipAddress || null,
      ]
    );
  } catch (err) {
    // Audit logging is non-critical; log but never fail the main request.
    console.error('audit log write error:', err.message);
  }
}

module.exports = { auditLog };
