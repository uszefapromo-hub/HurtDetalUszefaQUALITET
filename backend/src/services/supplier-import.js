'use strict';

/**
 * Supplier Import Service
 *
 * Provides importSupplierProducts(supplier_id) for fetching products from a
 * configured supplier endpoint (API / XML / CSV) and upserting them into the
 * central catalogue.
 *
 * Field mapping per spec:
 *   supplier_name        → name
 *   supplier_sku         → sku
 *   supplier_description → description
 *   supplier_price       → price_gross
 *   supplier_stock       → stock
 *   supplier_image       → image_url
 *
 * Deduplication key: supplier_id + sku (per spec section 4).
 * On conflict: updates price_gross, stock, description, image_url.
 */

const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const { parse: csvParse } = require('csv-parse/sync');
const xml2js = require('xml2js');

const db = require('../config/database');

const DEFAULT_TAX_RATE = 23; // Polish standard VAT rate (%)
const FETCH_TIMEOUT_MS = 15000; // 15 seconds

// ─── Field mapping ─────────────────────────────────────────────────────────────

/**
 * Maps a raw supplier product object to the internal catalogue format.
 * Accepts both "supplier_*" prefixed keys and common unprefixed alternatives.
 */
function mapSupplierProduct(item) {
  return {
    name:        item.supplier_name        || item.name        || item.nazwa || item.title || '',
    sku:         item.supplier_sku         || item.sku         || item.SKU   || item.id    || item.kod || null,
    description: item.supplier_description || item.description || item.opis  || '',
    price_gross: parseFloat(
      item.supplier_price  ||
      item.price_gross     || item.cena_brutto ||
      item.price_net       || item.cena_netto  ||
      item.price           || 0
    ),
    stock:       parseInt(item.supplier_stock || item.stock || item.stan || item.quantity || 0, 10),
    image_url:   item.supplier_image || item.image_url || item.zdjecie || item.img || item.image || null,
    category:    item.category || item.kategoria || null,
  };
}

// ─── Parsers ───────────────────────────────────────────────────────────────────

function parseCsv(content) {
  const records = csvParse(content, { columns: true, skip_empty_lines: true, trim: true });
  return records.map(mapSupplierProduct);
}

async function parseXml(content) {
  const parsed = await xml2js.parseStringPromise(content, { explicitArray: false });
  const rootKey = Object.keys(parsed)[0];
  const root = parsed[rootKey];
  let items = root.product || root.products?.product || root.item || root.items?.item || [];
  if (!Array.isArray(items)) items = [items];
  return items.map(mapSupplierProduct);
}

// ─── Fetcher ───────────────────────────────────────────────────────────────────

/**
 * Fetch products from a supplier's configured endpoint.
 * Supports JSON, XML and CSV responses.
 *
 * @param {object} supplier  Row from the suppliers table.
 * @returns {Promise<object[]>} Array of mapped product objects.
 */
async function fetchSupplierProducts(supplier) {
  const url = supplier.api_url || supplier.xml_endpoint || supplier.csv_endpoint;
  if (!url) throw new Error('Supplier has no configured endpoint');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response;
  try {
    const headers = {};
    if (supplier.api_key) headers['Authorization'] = `Bearer ${supplier.api_key}`;
    response = await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) throw new Error(`Supplier endpoint returned ${response.status}`);

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('xml') || url.endsWith('.xml')) {
    return parseXml(await response.text());
  }
  if (contentType.includes('csv') || url.endsWith('.csv')) {
    return parseCsv(await response.text());
  }

  // Default: JSON
  const json = await response.json();
  const items = Array.isArray(json) ? json : json.products || json.items || json.data || [];
  return items.map(mapSupplierProduct);
}

// ─── Upsert ────────────────────────────────────────────────────────────────────

/**
 * Upsert products into the central catalogue for the given supplier.
 *
 * Deduplication: supplier_id + sku.
 *   - Existing product → update price_gross, stock, description, image_url.
 *   - New product      → insert with status = 'active', is_central = true.
 *
 * @param {string}   supplierId
 * @param {object[]} rawProducts  Array of mapped product objects.
 * @returns {Promise<number>} Count of products inserted or updated.
 */
async function upsertSupplierProducts(supplierId, rawProducts) {
  let count = 0;

  for (const raw of rawProducts) {
    if (!raw.name) continue;

    const priceGross = parseFloat(raw.price_gross) || 0;

    if (raw.sku) {
      const existing = await db.query(
        'SELECT id FROM products WHERE supplier_id = $1 AND sku = $2',
        [supplierId, raw.sku]
      );

      if (existing.rows.length > 0) {
        // Update mutable fields per spec (section 4)
        await db.query(
          `UPDATE products SET
             price_gross = $1,
             stock       = $2,
             description = COALESCE($3, description),
             image_url   = COALESCE($4, image_url),
             status      = 'active',
             updated_at  = NOW()
           WHERE supplier_id = $5 AND sku = $6`,
          [
            priceGross.toFixed(2),
            raw.stock,
            raw.description || null,
            raw.image_url   || null,
            supplierId,
            raw.sku,
          ]
        );
        count++;
        continue;
      }
    }

    // Insert new central-catalogue product
    await db.query(
      `INSERT INTO products
         (id, store_id, supplier_id, name, sku, price_net, tax_rate, price_gross,
          selling_price, margin, stock, category, description, image_url,
          is_central, status, created_at)
       VALUES ($1, NULL, $2, $3, $4, 0, $5, $6, $6, 0, $7, $8, $9, $10, true, 'active', NOW())`,
      [
        uuidv4(),
        supplierId,
        raw.name,
        raw.sku      || null,
        DEFAULT_TAX_RATE,
        priceGross.toFixed(2),
        raw.stock,
        raw.category    || null,
        raw.description || null,
        raw.image_url   || null,
      ]
    );
    count++;
  }

  return count;
}

// ─── Main export ───────────────────────────────────────────────────────────────

/**
 * Fetch products from a supplier's configured endpoint and save them to the
 * central catalogue.  Updates last_sync_at on the supplier record.
 *
 * @param {string} supplier_id  UUID of the supplier row.
 * @returns {Promise<number>} Number of products imported or updated.
 */
async function importSupplierProducts(supplier_id) {
  const supplierResult = await db.query('SELECT * FROM suppliers WHERE id = $1', [supplier_id]);
  const supplier = supplierResult.rows[0];
  if (!supplier) throw new Error(`Supplier not found: ${supplier_id}`);

  const rawProducts = await fetchSupplierProducts(supplier);
  const count = await upsertSupplierProducts(supplier_id, rawProducts);

  await db.query(
    `UPDATE suppliers SET last_sync_at = NOW(), status = 'active' WHERE id = $1`,
    [supplier_id]
  );

  return count;
}

module.exports = { importSupplierProducts, upsertSupplierProducts, fetchSupplierProducts, mapSupplierProduct };
