-- Migration 014: Referral program & promotional subscription tiers
-- Adds referral_codes, referral_uses tables and promo tracking columns.

-- ─── Promo tier tracking on users ─────────────────────────────────────────────
-- promo_tier: 1 = first 10 (12 months), 2 = next 10 (6 months),
--             3 = next 10 (3 months),   0 = no promo (registrations > 30)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS promo_tier       SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(32);

CREATE INDEX IF NOT EXISTS idx_users_referred_by_code ON users (referred_by_code)
  WHERE referred_by_code IS NOT NULL;

-- ─── Referral codes ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_codes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  code       VARCHAR(32) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes (user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code    ON referral_codes (code);

-- ─── Referral uses ────────────────────────────────────────────────────────────
-- Records each time a referral code is used at registration.
-- bonus_days: how many days of free subscription were granted to the referrer.
CREATE TABLE IF NOT EXISTS referral_uses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(32) NOT NULL,
  referrer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  new_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  bonus_days  INTEGER NOT NULL DEFAULT 30,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_uses_referrer_id ON referral_uses (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_new_user_id ON referral_uses (new_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_code        ON referral_uses (code);
