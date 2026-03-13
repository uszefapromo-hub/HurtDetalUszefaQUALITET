-- Migration 022: Collaboration – team stores, invitations, revenue sharing
-- Enables the /api/collaboration/* endpoints.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Collaborative stores ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collaborative_stores (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID         NOT NULL,
  name        VARCHAR(255),
  description TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Team members ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id  UUID        NOT NULL,
  user_id   UUID        NOT NULL,
  role      VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (store_id, user_id)
);

-- ─── Team invitations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_invitations (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id       UUID         NOT NULL,
  invited_email  VARCHAR(255) NOT NULL,
  token          VARCHAR(255) UNIQUE NOT NULL,
  role           VARCHAR(50)  NOT NULL DEFAULT 'member',
  status         VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invited_by     UUID         NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at     TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- ─── Revenue sharing rules ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue_sharing_rules (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id      UUID          NOT NULL,
  user_id       UUID          NOT NULL,
  share_percent DECIMAL(5,2)  NOT NULL CHECK (share_percent >= 0 AND share_percent <= 100),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (store_id, user_id)
);

-- ─── Team activity logs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_activity_logs (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id    UUID         NOT NULL,
  actor_id    UUID         NOT NULL,
  action      VARCHAR(100) NOT NULL,
  resource    VARCHAR(100),
  resource_id UUID,
  metadata    JSONB        NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_collaborative_stores_store_id ON collaborative_stores (store_id);
CREATE INDEX IF NOT EXISTS idx_team_members_store_id         ON team_members (store_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id          ON team_members (user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token        ON team_invitations (token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_store_id     ON team_invitations (store_id);
CREATE INDEX IF NOT EXISTS idx_revenue_sharing_store_id      ON revenue_sharing_rules (store_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_logs_store_id   ON team_activity_logs (store_id);
