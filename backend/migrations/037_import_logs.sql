-- Migration 037: import_logs table for tracking supplier sync history
--
-- Stores a record for each supplier sync / import run so admins can audit
-- what was imported, when, and whether it succeeded.

CREATE TABLE IF NOT EXISTS import_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id     UUID        REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name   TEXT,
  status          TEXT        NOT NULL DEFAULT 'success', -- success | failure | partial
  products_count  INTEGER     NOT NULL DEFAULT 0,
  featured_count  INTEGER     NOT NULL DEFAULT 0,
  skipped_count   INTEGER     NOT NULL DEFAULT 0,
  error_message   TEXT,
  triggered_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_logs_supplier_id ON import_logs (supplier_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at  ON import_logs (created_at DESC);
