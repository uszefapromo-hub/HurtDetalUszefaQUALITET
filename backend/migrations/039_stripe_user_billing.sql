-- Migration 039: Stripe billing columns on users table
--
-- Adds per-user Stripe tracking so that after each login the system can
-- verify the subscription status directly against Stripe and automatically
-- unlock/revoke features without manual admin intervention.
--
-- New columns:
--   stripe_customer_id     – Stripe Customer object ID (cus_...)
--   stripe_subscription_id – Stripe Subscription object ID (sub_...)
--   subscription_status    – Mirrors Stripe status: active | trialing |
--                            past_due | canceled | unpaid | incomplete |
--                            incomplete_expired | paused | null
--   subscription_plan      – Platform plan name tied to the active Stripe
--                            subscription (basic | pro | elite | ...)
--   current_period_end     – Timestamp when the current billing period ends
--                            (used to show renewal date and for expiry checks)
--
-- All columns are nullable so existing rows are unaffected.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id     VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS subscription_status    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS subscription_plan      VARCHAR(30),
  ADD COLUMN IF NOT EXISTS current_period_end     TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id     ON users (stripe_customer_id)     WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
