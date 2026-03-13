'use strict'

/**
 * Store Settings Module – Service (business-logic layer)
 */

const StoreSettingsModel = require('./model')
const db = require('../../config/database')

async function getSettings(storeId, userId) {
  // Verify ownership
  const storeResult = await db.query('SELECT owner_id FROM stores WHERE id = $1', [storeId])
  const store = storeResult.rows[0]
  if (!store) {
    const err = new Error('Sklep nie znaleziony')
    err.status = 404
    throw err
  }

  const settings = await StoreSettingsModel.findByStoreId(storeId)
  return settings || { store_id: storeId, theme: 'default', primary_color: '#2563eb', secondary_color: '#64748b', currency: 'PLN' }
}

async function updateSettings(storeId, userId, updates) {
  // Verify ownership
  const storeResult = await db.query('SELECT owner_id FROM stores WHERE id = $1', [storeId])
  const store = storeResult.rows[0]
  if (!store) {
    const err = new Error('Sklep nie znaleziony')
    err.status = 404
    throw err
  }
  if (store.owner_id !== userId) {
    const err = new Error('Brak uprawnień do tego sklepu')
    err.status = 403
    throw err
  }

  return StoreSettingsModel.upsert({ storeId, ...updates })
}

module.exports = { getSettings, updateSettings }
