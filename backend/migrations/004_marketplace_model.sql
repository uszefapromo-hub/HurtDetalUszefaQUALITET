-- HurtDetalUszefaQUALITET – marketplace model foundations
-- Run after 003_product_status.sql
-- Adds columns required for the operator marketplace model.

-- ─── Shop products: marketplace listing fields ─────────────────────────────────
-- margin_value    numeric amount of margin (percentage points or fixed PLN)
-- selling_price   computed and stored for fast querying
-- source_snapshot JSONB snapshot of the global product at listing time
-- status          listing visibility: active | inactive | suspended

ALTER TABLE shop_products
  ADD COLUMN IF NOT EXISTS margin_value    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS selling_price   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS status          VARCHAR(30) NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_shop_products_store_status
  ON shop_products (store_id, status);

-- ─── Cart items: reference to the shop_products listing ───────────────────────
-- Marketplace carts reference shop_products so the cart carries the seller-
-- specific listing (computed price, custom title, etc.) rather than the raw
-- global product.

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS shop_product_id UUID REFERENCES shop_products (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cart_items_shop_product_id
  ON cart_items (shop_product_id);

-- ─── Status reference (informational) ────────────────────────────────────────
-- shops        : pending | active | suspended | banned
-- products     : draft   | pending | active | archived
-- shop_products: active  | inactive | suspended
-- orders       : created | paid | processing | shipped | delivered | cancelled
-- payments     : pending | paid | failed | refunded
