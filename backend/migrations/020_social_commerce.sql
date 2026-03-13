-- Migration 020: Social commerce – posts, likes, comments, product rankings
-- Enables the /api/social/* endpoints.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Social posts ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_posts (
  id           UUID                     PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID                     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_type    VARCHAR(20)              NOT NULL CHECK (post_type IN ('product', 'store', 'general')),
  reference_id UUID,
  content      TEXT                     NOT NULL,
  media_url    TEXT,
  is_active    BOOLEAN                  NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Post likes ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  id         UUID                     PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID                     NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id    UUID                     NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- ─── Post comments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_comments (
  id         UUID                     PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID                     NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id    UUID                     NOT NULL,
  content    TEXT                     NOT NULL,
  is_active  BOOLEAN                  NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Product rankings ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_rankings (
  id          UUID                     PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID                     NOT NULL,
  store_id    UUID,
  score       DECIMAL(10,4)            NOT NULL DEFAULT 0,
  period      VARCHAR(10)              NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (product_id, period)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id    ON social_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_active  ON social_posts (is_active);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id      ON post_likes (post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id   ON post_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_product_rankings_period ON product_rankings (period, score DESC);
