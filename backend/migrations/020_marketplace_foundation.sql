-- Migration 020: Marketplace foundation – user profiles, store settings,
-- product trends, analytics events, notifications, reports, affiliate programs,
-- affiliate commissions and payout requests.
--
-- These tables complete the data model described in the platform architecture spec
-- and enable the full set of MVP API endpoints.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── user_profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio           TEXT,
  country       VARCHAR(100),
  language      VARCHAR(10) DEFAULT 'pl',
  social_links  JSONB DEFAULT '{}',
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ─── store_settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id         UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  theme            VARCHAR(50) DEFAULT 'default',
  primary_color    VARCHAR(20) DEFAULT '#2563eb',
  secondary_color  VARCHAR(20) DEFAULT '#64748b',
  currency         VARCHAR(10) DEFAULT 'PLN',
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_settings_store_id ON store_settings(store_id);

-- ─── affiliate_programs ────────────────────────────────────────────────────────
-- Higher-level affiliate program per product (separate from per-store settings).
CREATE TABLE IF NOT EXISTS affiliate_programs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id          UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  commission_percent  NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_programs_product ON affiliate_programs(product_id);

-- ─── affiliate_commissions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES products(id) ON DELETE SET NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_creator ON affiliate_commissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_order   ON affiliate_commissions(order_id);

-- ─── payout_requests ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payout_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          NUMERIC(12,2) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  payment_method  VARCHAR(50),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_creator ON payout_requests(creator_id);

-- ─── product_trends ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_trends (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  trend_score  NUMERIC(8,2) NOT NULL DEFAULT 0,
  views        INTEGER NOT NULL DEFAULT 0,
  sales        INTEGER NOT NULL DEFAULT 0,
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_trends_score ON product_trends(trend_score DESC);

-- ─── analytics_events ──────────────────────────────────────────────────────────
-- Raw event stream for product views, clicks, cart additions and purchases.
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type  VARCHAR(50) NOT NULL
              CHECK (event_type IN ('product_view', 'product_click', 'add_to_cart', 'purchase')),
  event_data  JSONB DEFAULT '{}',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user      ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type      ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created   ON analytics_events(created_at DESC);

-- ─── notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'unread'
              CHECK (status IN ('unread', 'read')),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- ─── reports ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        VARCHAR(100) NOT NULL,
  data        JSONB DEFAULT '{}',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
