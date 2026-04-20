-- Migration 041: Seed default test/development admin account
-- Creates the platform owner account (admin@test.pl) used for local
-- development and testing.
--
-- Credentials:
--   email:    admin@test.pl
--   password: 1234
--
-- The password hash below is a bcrypt hash (cost 12) of "1234".
-- Idempotent: uses ON CONFLICT DO NOTHING.

INSERT INTO users (id, email, password_hash, name, role, plan, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'admin@test.pl',
  '$2a$12$dd4N/0Mb5EqpNl73VKQCtuM0kMNbM8PIW2FPYm.hdzSS9WOWGuA/a',
  'Admin',
  'owner',
  'elite',
  NOW()
)
ON CONFLICT DO NOTHING;
