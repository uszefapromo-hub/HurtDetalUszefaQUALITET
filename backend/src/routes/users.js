'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const { authenticate, requireRole, signToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// ─── Register ──────────────────────────────────────────────────────────────────

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
    body('role').optional().isIn(['seller', 'buyer']),
  ],
  validate,
  async (req, res) => {
    const { email, password, name, role = 'buyer' } = req.body;
    try {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Użytkownik z tym e-mailem już istnieje' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const id = uuidv4();
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db.query(
        `INSERT INTO users (id, email, password_hash, name, role, plan, trial_ends_at, created_at)
         VALUES ($1, $2, $3, $4, $5, 'trial', $6, NOW())`,
        [id, email, passwordHash, name, role, trialEndsAt]
      );

      const token = signToken({ id, email, role });
      return res.status(201).json({ token, user: { id, email, name, role, plan: 'trial' } });
    } catch (err) {
      console.error('register error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── Login ─────────────────────────────────────────────────────────────────────

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await db.query(
        'SELECT id, email, password_hash, name, role, plan, trial_ends_at FROM users WHERE email = $1',
        [email]
      );
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ error: 'Nieprawidłowy e-mail lub hasło' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Nieprawidłowy e-mail lub hasło' });
      }

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          trialEndsAt: user.trial_ends_at,
        },
      });
    } catch (err) {
      console.error('login error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── Get current user profile ──────────────────────────────────────────────────

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, plan, trial_ends_at, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('get me error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── Update user profile ───────────────────────────────────────────────────────

router.put(
  '/me',
  authenticate,
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone(),
  ],
  validate,
  async (req, res) => {
    const { name, phone } = req.body;
    try {
      const result = await db.query(
        `UPDATE users SET
           name  = COALESCE($1, name),
           phone = COALESCE($2, phone),
           updated_at = NOW()
         WHERE id = $3
         RETURNING id, email, name, phone, role, plan`,
        [name || null, phone || null, req.user.id]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('update me error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── Change password ───────────────────────────────────────────────────────────

router.put(
  '/me/password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  validate,
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
      const user = result.rows[0];
      if (!user) return res.status(404).json({ error: 'Użytkownik nie znaleziony' });

      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Nieprawidłowe aktualne hasło' });

      const newHash = await bcrypt.hash(newPassword, 12);
      await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);
      return res.json({ message: 'Hasło zmienione' });
    } catch (err) {
      console.error('change password error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── Admin: list all users ─────────────────────────────────────────────────────

router.get('/', authenticate, requireRole('owner', 'admin'), async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
  const offset = (page - 1) * limit;

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await db.query(
      'SELECT id, email, name, role, plan, trial_ends_at, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return res.json({ total, page, limit, users: result.rows });
  } catch (err) {
    console.error('list users error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router;
