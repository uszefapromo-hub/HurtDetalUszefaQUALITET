-- Migration 020: Gamification System
-- Adds user levels, points, badges and leaderboards to increase engagement.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Level definitions (static, managed by platform) ─────────────────────────
-- Store levels and creator levels share the same definitions table
-- distinguished by the 'category' column ('store' | 'creator').
CREATE TABLE IF NOT EXISTS level_definitions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category        VARCHAR(20)  NOT NULL CHECK (category IN ('store', 'creator')),
  name            VARCHAR(50)  NOT NULL,  -- Starter | Seller | Pro Seller | Elite | Legend
  level_number    INTEGER      NOT NULL,  -- 1-5
  min_points      INTEGER      NOT NULL DEFAULT 0,
  reward_type     VARCHAR(50),            -- 'free_subscription_month' | 'higher_commission' | 'homepage_promotion'
  reward_value    NUMERIC(10,2),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (category, level_number)
);

-- ─── Per-user level progress ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_levels (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category        VARCHAR(20) NOT NULL CHECK (category IN ('store', 'creator')),
  level_number    INTEGER NOT NULL DEFAULT 1,
  total_points    INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, category)
);

-- ─── Points ledger ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_points (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source      VARCHAR(50) NOT NULL,  -- 'product_sale' | 'affiliate_sale' | 'creator_promotion' | 'live_stream' | 'referral'
  points      INTEGER NOT NULL,
  reference_id UUID,                 -- order_id / affiliate_conversion_id / referral_use_id etc.
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Badge definitions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badge_definitions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        VARCHAR(50) NOT NULL UNIQUE,  -- 'first_sale' | '100_sales' | 'top_creator_week' | 'top_store_month' | 'viral_product'
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  icon        VARCHAR(100),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── User-awarded badges ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_slug    VARCHAR(50) NOT NULL REFERENCES badge_definitions(slug) ON DELETE CASCADE,
  awarded_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, badge_slug)
);

-- ─── Leaderboard snapshots ────────────────────────────────────────────────────
-- Materialised weekly/monthly rankings computed by a background job.
CREATE TABLE IF NOT EXISTS leaderboards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_type  VARCHAR(30) NOT NULL,  -- 'top_creators' | 'top_sellers' | 'top_stores' | 'top_products'
  period      VARCHAR(10) NOT NULL,  -- 'week' | 'month' | 'all_time'
  period_key  VARCHAR(20) NOT NULL,  -- e.g. '2025-W10' or '2025-03'
  rank        INTEGER NOT NULL,
  entity_id   UUID NOT NULL,         -- user_id or product_id depending on board_type
  entity_name VARCHAR(255),
  score       NUMERIC(15,2) NOT NULL DEFAULT 0,
  metadata    JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (board_type, period_key, rank)
);

-- ─── Seed level definitions ───────────────────────────────────────────────────
INSERT INTO level_definitions (category, name, level_number, min_points, reward_type, reward_value)
VALUES
  ('store',   'Starter',    1,    0,    NULL,                       NULL),
  ('store',   'Seller',     2,    500,  NULL,                       NULL),
  ('store',   'Pro Seller', 3,   2000,  'free_subscription_month',  1),
  ('store',   'Elite',      4,   5000,  'higher_commission',        5.00),
  ('store',   'Legend',     5,  15000,  'homepage_promotion',       NULL),
  ('creator', 'Starter',    1,    0,    NULL,                       NULL),
  ('creator', 'Seller',     2,    300,  NULL,                       NULL),
  ('creator', 'Pro Seller', 3,   1000,  'free_subscription_month',  1),
  ('creator', 'Elite',      4,   3000,  'higher_commission',        7.00),
  ('creator', 'Legend',     5,  10000,  'homepage_promotion',       NULL)
ON CONFLICT (category, level_number) DO NOTHING;

-- ─── Seed badge definitions ───────────────────────────────────────────────────
INSERT INTO badge_definitions (slug, name, description, icon)
VALUES
  ('first_sale',        'Pierwsza Sprzedaż',    'Dokonaj swojej pierwszej sprzedaży',                 '🏆'),
  ('100_sales',         '100 Sprzedaży',         'Osiągnij 100 sprzedaży',                             '💯'),
  ('top_creator_week',  'Twórca Tygodnia',       'Zostań najlepszym twórcą tygodnia',                  '⭐'),
  ('top_store_month',   'Sklep Miesiąca',        'Zostań najlepszym sklepem miesiąca',                 '🥇'),
  ('viral_product',     'Viralowy Produkt',      'Jeden z Twoich produktów osiągnął 1000+ kliknięć',   '🔥')
ON CONFLICT (slug) DO NOTHING;

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id      ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id      ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_source       ON user_points(source);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id      ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_board_type  ON leaderboards(board_type, period_key);
