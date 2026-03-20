'use strict';

/**
 * Auth routes – short canonical aliases used by the onboarding flow.
 *
 * POST /api/auth/register        – create a new account (default role: seller)
 * POST /api/auth/login           – obtain a JWT
 * POST /api/auth/refresh         – exchange a valid JWT for a fresh one (extends session)
 * GET  /api/auth/me              – return the authenticated user's profile
 * PUT  /api/auth/me              – update the authenticated user's profile
 * POST /api/auth/forgot-password – request a password reset link by email
 * POST /api/auth/reset-password  – set a new password using the reset token
 */

const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const { authenticate, signToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { PLAN_CONFIG } = require('./subscriptions');
const { nameToSlug, uniqueSlug } = require('../helpers/slug');
const { getPromoTier } = require('../helpers/promo');
const { ensureReferralCode } = require('./referral');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../helpers/mailer');

const router = express.Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
    body('role').optional().isIn(['seller', 'buyer']),
    body('ref_code').optional().trim(),
  ],
  validate,
  async (req, res) => {
    // Default role for new sign-ups through this endpoint is 'seller'
    const { email, password, name, role = 'seller', ref_code } = req.body;
    try {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Użytkownik z tym e-mailem już istnieje' });
      }

      // ── Determine promotional subscription tier ────────────────────────────
      const sellerCountResult = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'seller'`);
      const currentSellerCount = parseInt(sellerCountResult.rows[0].count, 10);
      const promoTier = getPromoTier(currentSellerCount);

      const passwordHash = await bcrypt.hash(password, 12);
      const id = uuidv4();
      const trialEndsAt = new Date(Date.now() + promoTier.durationDays * 24 * 60 * 60 * 1000);

      await db.query(
        `INSERT INTO users (id, email, password_hash, name, role, plan, trial_ends_at, created_at)
         VALUES ($1, $2, $3, $4, $5, 'trial', $6, NOW())`,
        [id, email, passwordHash, name, role, trialEndsAt]
      );

      // ── Auto-create shop for sellers ──────────────────────────────────────
      let shop = null;
      if (role === 'seller' || role === 'owner') {
        const shopId   = uuidv4();
        const shopName = name;
        const slug     = await uniqueSlug(nameToSlug(shopName));
        const subdomain = `${slug}.qualitetmarket.pl`;

        const shopResult = await db.query(
          `INSERT INTO stores (id, owner_id, name, slug, subdomain, margin, plan, status, created_at)
           VALUES ($1, $2, $3, $4, $5, 30, 'trial', 'active', NOW())
           RETURNING *`,
          [shopId, id, shopName, slug, subdomain]
        );
        shop = shopResult.rows[0];

        // Auto-create subscription using promotional tier duration
        const trialConfig = PLAN_CONFIG['trial'];
        const subExpiresAt = new Date(Date.now() + promoTier.durationDays * 24 * 60 * 60 * 1000);
        await db.query(
          `INSERT INTO subscriptions
             (id, shop_id, plan, status, product_limit, commission_rate, started_at, expires_at, created_at)
           VALUES ($1, $2, 'trial', 'active', $3, $4, NOW(), $5, NOW())`,
          [uuidv4(), shopId, trialConfig.product_limit, trialConfig.commission_rate, subExpiresAt]
        );

        // Auto-create referral code for every new seller (non-blocking; failure is safe to ignore)
        ensureReferralCode(id).catch((err) => console.error('auto referral code error:', err.message));
      }

      // ── Record referral use (non-blocking) ────────────────────────────────
      if (ref_code) {
        db.query('SELECT id, user_id FROM referral_codes WHERE code = $1', [ref_code.toUpperCase()])
          .then(async (codeResult) => {
            const refRow = codeResult.rows[0];
            if (!refRow || refRow.user_id === id) return;
            await db.query(
              `INSERT INTO referral_uses (id, code_id, referral_code_id, referrer_id, new_user_id, bonus_months, created_at)
               VALUES ($1, $2, $2, $3, $4, $5, NOW())
               ON CONFLICT DO NOTHING`,
              [uuidv4(), refRow.id, refRow.user_id, id, promoTier.bonusMonths]
            );
          })
          .catch((err) => console.error('referral record error:', err.message));
      }

      const token = signToken({ id, email, role });

      // Send welcome email (fire-and-forget – failure must not block the response)
      sendWelcomeEmail({ userId: id, email, name }).catch(() => {});

      return res.status(201).json({
        token,
        user: { id, email, name, role, plan: 'trial' },
        shop,
        promo: { bonusMonths: promoTier.bonusMonths, label: promoTier.label },
      });
    } catch (err) {
      console.error('auth register error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Accepts either { email, password } or { phone, password }.

router.post(
  '/login',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone(),
    body('password').notEmpty(),
    body().custom((_, { req }) => {
      if (!req.body.email && !req.body.phone) {
        throw new Error('Podaj e-mail lub numer telefonu');
      }
      return true;
    }),
  ],
  validate,
  async (req, res) => {
    const { email, phone, password } = req.body;
    try {
      let result;
      if (email) {
        result = await db.query(
          'SELECT id, email, password_hash, name, role, plan, trial_ends_at FROM users WHERE email = $1',
          [email]
        );
      } else {
        result = await db.query(
          'SELECT id, email, password_hash, name, role, plan, trial_ends_at FROM users WHERE phone = $1',
          [phone]
        );
      }
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ error: 'Nieprawidłowy e-mail/telefon lub hasło' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Nieprawidłowy e-mail/telefon lub hasło' });
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
      console.error('auth login error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
// Exchange a valid (non-expired) Bearer token for a fresh one.
// The client should call this endpoint before the current token expires so that
// the user never sees a forced logout.  A 401 here means the token has already
// expired; the client must redirect to the login page in that case.

router.post('/refresh', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, plan, trial_ends_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Użytkownik nie znaleziony' });
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
    console.error('auth refresh error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

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
    console.error('auth me error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── PUT /api/auth/me ─────────────────────────────────────────────────────────

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
           name       = COALESCE($1, name),
           phone      = COALESCE($2, phone),
           updated_at = NOW()
         WHERE id = $3
         RETURNING id, email, name, phone, role, plan`,
        [name || null, phone || null, req.user.id]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('auth update me error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
// Request a password-reset link.  Always returns 200 to avoid revealing whether
// a given e-mail address is registered on the platform.

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  async (req, res) => {
    const { email } = req.body;
    try {
      const userResult = await db.query(
        'SELECT id, name FROM users WHERE email = $1',
        [email]
      );
      const user = userResult.rows[0];

      if (user) {
        // Generate a cryptographically secure token (48 random bytes → 96 hex chars)
        const token = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Invalidate any existing unused tokens for this user before creating a new one
        await db.query(
          `UPDATE password_reset_tokens
             SET used_at = NOW()
           WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()`,
          [user.id]
        );

        await db.query(
          `INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [uuidv4(), user.id, token, expiresAt]
        );

        // Fire-and-forget; must not block the response even on mail failure
        sendPasswordResetEmail({ userId: user.id, email, name: user.name, token }).catch(() => {});
      }

      // Always respond with 200 – never reveal whether the address exists
      return res.json({ message: 'Jeśli podany adres e-mail istnieje w systemie, wyślemy link do resetowania hasła.' });
    } catch (err) {
      console.error('auth forgot-password error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
// Set a new password using the token received by email.

router.post(
  '/reset-password',
  [
    body('token').trim().notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  async (req, res) => {
    const { token, password } = req.body;
    try {
      const tokenResult = await db.query(
        `SELECT id, user_id, expires_at, used_at
           FROM password_reset_tokens
          WHERE token = $1`,
        [token]
      );
      const tokenRow = tokenResult.rows[0];

      if (!tokenRow) {
        return res.status(400).json({ error: 'Nieprawidłowy lub wygasły token resetowania hasła' });
      }
      if (tokenRow.used_at) {
        return res.status(400).json({ error: 'Token resetowania hasła został już wykorzystany' });
      }
      if (new Date(tokenRow.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Token resetowania hasła wygasł' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await db.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, tokenRow.user_id]
      );

      await db.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
        [tokenRow.id]
      );

      return res.json({ message: 'Hasło zostało zmienione. Możesz się teraz zalogować.' });
    } catch (err) {
      console.error('auth reset-password error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

module.exports = router;
