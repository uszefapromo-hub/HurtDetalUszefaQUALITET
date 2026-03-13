'use strict'

/**
 * Store Settings Module – Model (data-access layer)
 */

const db = require('../../config/database')
const { v4: uuidv4 } = require('uuid')

async function findByStoreId(storeId) {
  const result = await db.query(
    'SELECT * FROM store_settings WHERE store_id = $1',
    [storeId]
  )
  return result.rows[0] || null
}

async function upsert({ storeId, theme, primaryColor, secondaryColor, currency }) {
  const result = await db.query(
    `INSERT INTO store_settings (id, store_id, theme, primary_color, secondary_color, currency, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (store_id) DO UPDATE SET
       theme           = COALESCE(EXCLUDED.theme, store_settings.theme),
       primary_color   = COALESCE(EXCLUDED.primary_color, store_settings.primary_color),
       secondary_color = COALESCE(EXCLUDED.secondary_color, store_settings.secondary_color),
       currency        = COALESCE(EXCLUDED.currency, store_settings.currency),
       updated_at      = NOW()
     RETURNING *`,
    [uuidv4(), storeId, theme || null, primaryColor || null, secondaryColor || null, currency || null]
  )
  return result.rows[0]
}

module.exports = { findByStoreId, upsert }
