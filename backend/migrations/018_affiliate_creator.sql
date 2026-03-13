-- Migration 018: Affiliate Creator Module
-- Adds full affiliate/creator system:
--   - affiliate_enabled + commission_rate on shop_products
--   - affiliate_code on orders (for attribution)
--   - affiliate_links, affiliate_clicks, affiliate_commissions tables
--   - creator_payout_requests table

-- ─── Extend shop_products with affiliate settings ─────────────────────────────
ALTER TABLE shop_products
  ADD COLUMN IF NOT EXISTS affiliate_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS commission_rate    NUMERIC(5, 2) NOT NULL DEFAULT 10; -- commission_rate: percentage 0–80

-- ─── Extend orders with affiliate attribution ─────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS affiliate_code TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_affiliate_code ON orders (affiliate_code);

-- ─── Affiliate links ─────────────────────────────────────────────────────────
-- Each creator generates a unique short code per shop_product.
CREATE TABLE IF NOT EXISTS affiliate_links (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  shop_product_id UUID NOT NULL REFERENCES shop_products (id) ON DELETE CASCADE,
  code            VARCHAR(32) UNIQUE NOT NULL,
  clicks          INTEGER NOT NULL DEFAULT 0,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ,
  UNIQUE (creator_id, shop_product_id)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_links_creator_id      ON affiliate_links (creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_shop_product_id ON affiliate_links (shop_product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code            ON affiliate_links (code);

-- ─── Affiliate clicks ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id    UUID NOT NULL REFERENCES affiliate_links (id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_link_id    ON affiliate_clicks (link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks (created_at DESC);

-- ─── Affiliate commissions ───────────────────────────────────────────────────
-- Created when an order is placed via an affiliate link.
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id    UUID NOT NULL REFERENCES affiliate_links (id) ON DELETE CASCADE,
  order_id   UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  amount     NUMERIC(12, 2) NOT NULL,
  rate       NUMERIC(5, 2) NOT NULL,
  status     VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending | approved | paid | rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_creator_id ON affiliate_commissions (creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_order_id   ON affiliate_commissions (order_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_link_id    ON affiliate_commissions (link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status     ON affiliate_commissions (status);

-- ─── Creator payout requests ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creator_payout_requests (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  amount     NUMERIC(12, 2) NOT NULL,
  status     VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending | approved | paid | rejected
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_creator_payout_requests_creator_id ON creator_payout_requests (creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_payout_requests_status     ON creator_payout_requests (status);
