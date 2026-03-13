-- Migration 021: Gamification – badges, points log, user badges
-- Enables the /api/gamification/* endpoints.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Badge definitions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badge_definitions (
  id                 UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug               VARCHAR(50)  UNIQUE NOT NULL,
  name               VARCHAR(100) NOT NULL,
  description        TEXT,
  icon               VARCHAR(255),
  requirement_type   VARCHAR(50),
  requirement_value  INTEGER      NOT NULL DEFAULT 0,
  points_reward      INTEGER      NOT NULL DEFAULT 0,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── User points log ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_points_log (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID         NOT NULL,
  points       INTEGER      NOT NULL,
  action       VARCHAR(100) NOT NULL,
  reference_id UUID,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── User badges ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id        UUID                     PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID                     NOT NULL,
  badge_id  UUID                     NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_points_log_user_id  ON user_points_log (user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_log_action   ON user_points_log (action);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id      ON user_badges (user_id);

-- ─── Seed badge definitions ───────────────────────────────────────────────────
INSERT INTO badge_definitions (slug, name, description, requirement_type, requirement_value, points_reward)
VALUES
  ('first_order',      'Pierwszy zakup',             'Dokonaj pierwszego zamówienia',            'orders_count',  1,  50),
  ('social_butterfly', 'Aktywny w społeczności',      'Opublikuj 5 postów w społeczności',        'posts_count',   5,  100),
  ('loyal_customer',   'Lojalny klient',              'Złóż łącznie 10 zamówień',                 'orders_count',  10, 200),
  ('influencer',       'Influencer',                  'Poleć platformę 3 nowym użytkownikom',     'referral_count', 3, 300),
  ('top_seller',       'Najlepszy sprzedawca',        'Sprzedaj łącznie 50 produktów',            'sales_count',   50, 500)
ON CONFLICT (slug) DO NOTHING;
