-- HurtDetalUszefaQUALITET – Referral system, seller scripts, analytics snapshots
-- Applies after 013_owner_phone.sql
-- Adds: referral_codes, referral_uses, scripts, analytics_snapshots

-- ─── Referral codes ───────────────────────────────────────────────────────────
-- Each user (typically a seller) can create referral codes they share with buyers
-- or other sellers. Optionally tied to a specific store.

CREATE TABLE IF NOT EXISTS referral_codes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  store_id       UUID REFERENCES stores (id) ON DELETE SET NULL,
  code           VARCHAR(40) UNIQUE NOT NULL,
  description    TEXT,
  discount_type  VARCHAR(20) NOT NULL DEFAULT 'none',    -- none | percent | fixed
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_uses       INTEGER,                                 -- NULL = unlimited
  uses_count     INTEGER NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ,
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_owner_id   ON referral_codes (owner_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_store_id   ON referral_codes (store_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code       ON referral_codes (code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active     ON referral_codes (active);

-- ─── Referral uses ────────────────────────────────────────────────────────────
-- Every time a referral code is redeemed this row is inserted.

CREATE TABLE IF NOT EXISTS referral_uses (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_id            UUID NOT NULL REFERENCES referral_codes (id) ON DELETE CASCADE,
  used_by_user_id    UUID REFERENCES users (id) ON DELETE SET NULL,
  order_id           UUID REFERENCES orders (id) ON DELETE SET NULL,
  reward_amount      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  used_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_uses_code_id         ON referral_uses (code_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_used_by_user_id ON referral_uses (used_by_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_order_id        ON referral_uses (order_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_used_at         ON referral_uses (used_at DESC);

-- ─── Scripts ─────────────────────────────────────────────────────────────────
-- Seller-managed tracking/analytics scripts injected into their storefront.
-- Supports any snippet: Google Analytics, Meta Pixel, live-chat widgets, etc.

CREATE TABLE IF NOT EXISTS scripts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id   UUID NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  type       VARCHAR(30) NOT NULL DEFAULT 'custom',      -- analytics | tracking | chat | pixel | custom
  placement  VARCHAR(30) NOT NULL DEFAULT 'head',        -- head | body_start | body_end
  content    TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scripts_store_id ON scripts (store_id);
CREATE INDEX IF NOT EXISTS idx_scripts_active   ON scripts (store_id, active);

-- ─── Analytics snapshots ──────────────────────────────────────────────────────
-- Periodic (daily/weekly/monthly) aggregated metrics.
-- store_id = NULL → platform-wide snapshot (admin dashboard).
-- store_id = UUID → per-store snapshot (seller dashboard).

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id            UUID REFERENCES stores (id) ON DELETE CASCADE,
  period              VARCHAR(20) NOT NULL DEFAULT 'daily',   -- daily | weekly | monthly
  snapshot_date       DATE NOT NULL,
  total_orders        INTEGER NOT NULL DEFAULT 0,
  total_revenue       NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_products      INTEGER NOT NULL DEFAULT 0,
  total_users         INTEGER NOT NULL DEFAULT 0,
  new_orders          INTEGER NOT NULL DEFAULT 0,
  new_revenue         NUMERIC(14, 2) NOT NULL DEFAULT 0,
  new_users           INTEGER NOT NULL DEFAULT 0,
  avg_order_value     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  platform_commission NUMERIC(14, 2) NOT NULL DEFAULT 0,
  metadata            JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, period, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_store_id      ON analytics_snapshots (store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_period        ON analytics_snapshots (period);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_snapshot_date ON analytics_snapshots (snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_store_period  ON analytics_snapshots (store_id, period, snapshot_date DESC);
