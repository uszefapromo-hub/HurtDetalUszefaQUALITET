-- HurtDetalUszefaQUALITET – initial database schema
-- Run: psql -U postgres -d hurtdetal_qualitet -f 001_initial_schema.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  phone         VARCHAR(30),
  role          VARCHAR(30) NOT NULL DEFAULT 'buyer',   -- buyer | seller | admin | owner
  plan          VARCHAR(30) NOT NULL DEFAULT 'trial',   -- trial | basic | pro | elite
  trial_ends_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- ─── Subscriptions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  plan              VARCHAR(30) NOT NULL,
  price             NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_reference VARCHAR(255),
  status            VARCHAR(30) NOT NULL DEFAULT 'active',  -- active | cancelled | expired | superseded
  starts_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at           TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions (status);

-- ─── Suppliers (wholesalers / hurtownie) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(255) NOT NULL,
  integration_type VARCHAR(20) NOT NULL DEFAULT 'manual',  -- api | xml | csv | manual
  api_url          TEXT,
  api_key          TEXT,
  margin           NUMERIC(5, 2) NOT NULL DEFAULT 0,
  notes            TEXT,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  last_sync_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ
);

-- ─── Stores ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(80) UNIQUE NOT NULL,
  description TEXT,
  margin      NUMERIC(5, 2) NOT NULL DEFAULT 15,
  plan        VARCHAR(30) NOT NULL DEFAULT 'basic',
  status      VARCHAR(30) NOT NULL DEFAULT 'active',  -- active | inactive | suspended
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores (owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug     ON stores (slug);
CREATE INDEX IF NOT EXISTS idx_stores_status   ON stores (status);

-- ─── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id      UUID NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
  supplier_id   UUID REFERENCES suppliers (id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  sku           VARCHAR(100),
  price_net     NUMERIC(12, 2) NOT NULL,
  tax_rate      NUMERIC(5, 2) NOT NULL DEFAULT 23,
  price_gross   NUMERIC(12, 2) NOT NULL,
  selling_price NUMERIC(12, 2) NOT NULL,
  margin        NUMERIC(5, 2) NOT NULL DEFAULT 15,
  category      VARCHAR(100),
  description   TEXT,
  stock         INTEGER NOT NULL DEFAULT 0,
  image_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_products_store_id    ON products (store_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products (supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_sku         ON products (store_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products (category);

-- ─── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id         UUID NOT NULL REFERENCES stores (id),
  store_owner_id   UUID NOT NULL REFERENCES users (id),
  buyer_id         UUID NOT NULL REFERENCES users (id),
  status           VARCHAR(30) NOT NULL DEFAULT 'pending',  -- pending | confirmed | shipped | delivered | cancelled
  subtotal         NUMERIC(12, 2) NOT NULL,
  platform_fee     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total            NUMERIC(12, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id       ON orders (store_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id       ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_owner_id ON orders (store_owner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders (status);

-- ─── Order items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products (id) ON DELETE SET NULL,
  name        VARCHAR(255) NOT NULL,
  quantity    INTEGER NOT NULL,
  unit_price  NUMERIC(12, 2) NOT NULL,
  line_total  NUMERIC(12, 2) NOT NULL,
  margin      NUMERIC(5, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
