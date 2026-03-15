-- Migration 035: add enabled column to script_runs and create table if missing
-- Allows per-script enable/disable in the Super Admin panel

CREATE TABLE IF NOT EXISTS script_runs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id   TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'idle',
  last_run_at TIMESTAMPTZ,
  last_result TEXT,
  run_count   INTEGER NOT NULL DEFAULT 0,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

-- Add enabled column if the table already exists without it
ALTER TABLE script_runs ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;
