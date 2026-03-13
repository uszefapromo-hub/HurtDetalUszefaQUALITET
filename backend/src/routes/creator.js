'use strict';

/**
 * Creator / Affiliate routes – endpoints for creators and affiliate management.
 *
 * Phase 1 – MVP:
 *   POST   /api/creator/register             – upgrade account to creator role
 *   POST   /api/creator/links                – generate affiliate link for a shop_product
 *   GET    /api/creator/links                – list my affiliate links
 *   POST   /api/creator/click                – track a click on an affiliate link
 *   GET    /api/creator/stats                – creator dashboard stats
 *   GET    /api/creator/commissions          – list my commissions
 *
 * Phase 2 – Payouts:
 *   POST   /api/creator/payouts              – request a payout
 *   GET    /api/creator/payouts              – payout history
 *
 * Phase 3 – Discovery & AI:
 *   GET    /api/creator/top-products         – top affiliate products to promote
 *   GET    /api/creator/leaderboard          – top creators leaderboard
 *   POST   /api/creator/generate/copy        – AI promotional copy generator
 *   POST   /api/creator/generate/hook        – AI video hook generator
 *
 * Seller affiliate management (in my.js):
 *   GET    /api/my/affiliate/products        – products with affiliate settings
 *   PATCH  /api/my/affiliate/products/:id    – toggle affiliate_enabled / commission_rate
 *   GET    /api/my/affiliate/stats           – seller affiliate performance
 *   GET    /api/my/affiliate/commissions     – commissions owed to creators
 */

const express = require('express');
const { body, param } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { auditLog } = require('../helpers/audit');

const router = express.Router();

// ─── Helper: generate short unique affiliate code ────────────────────────────

function generateAffiliateCode(length = 8) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length).toUpperCase();
}

// ─── POST /api/creator/register – upgrade account to creator role ─────────────

router.post('/register', authenticate, async (req, res) => {
  try {
    const user = await db.query('SELECT id, role FROM users WHERE id = $1', [req.user.id]);
    if (!user.rows[0]) return res.status(404).json({ error: 'Użytkownik nie istnieje' });

    const result = await db.query(
      `UPDATE users SET role = 'creator', updated_at = NOW() WHERE id = $1 RETURNING id, email, name, role`,
      [req.user.id]
    );

    auditLog({ actorUserId: req.user.id, action: 'creator.register', resource: 'user', resourceId: req.user.id, ipAddress: req.ip });

    return res.json({ message: 'Konto kreatora aktywowane', user: result.rows[0] });
  } catch (err) {
    console.error('creator register error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── POST /api/creator/links – generate affiliate link ───────────────────────

router.post(
  '/links',
  authenticate,
  requireRole('creator', 'seller', 'owner', 'admin'),
  [
    body('shop_product_id').isUUID(),
  ],
  validate,
  async (req, res) => {
    const { shop_product_id } = req.body;
    try {
      // Verify product exists and is affiliate-enabled
      const productResult = await db.query(
        `SELECT sp.id, sp.affiliate_enabled, sp.commission_rate,
                p.name, p.image_url, sp.price_override,
                s.name AS store_name, s.slug AS store_slug
         FROM shop_products sp
         JOIN products p ON p.id = sp.product_id
         JOIN stores s ON s.id = sp.store_id
         WHERE sp.id = $1 AND sp.active = TRUE`,
        [shop_product_id]
      );

      const product = productResult.rows[0];
      if (!product) {
        return res.status(404).json({ error: 'Produkt nie istnieje lub jest nieaktywny' });
      }
      if (!product.affiliate_enabled) {
        return res.status(403).json({ error: 'Ten produkt nie obsługuje programu partnerskiego' });
      }

      // Check if link already exists for this creator + product
      const existing = await db.query(
        'SELECT * FROM affiliate_links WHERE creator_id = $1 AND shop_product_id = $2',
        [req.user.id, shop_product_id]
      );
      if (existing.rows[0]) {
        return res.json({ link: existing.rows[0], product });
      }

      // Generate unique code
      let code;
      let attempts = 0;
      do {
        code = generateAffiliateCode(8);
        const conflict = await db.query('SELECT id FROM affiliate_links WHERE code = $1', [code]);
        if (!conflict.rows[0]) break;
        attempts++;
      } while (attempts < 10);

      if (attempts >= 10) {
        return res.status(500).json({ error: 'Nie udało się wygenerować unikalnego kodu. Spróbuj ponownie.' });
      }

      const id = uuidv4();
      const result = await db.query(
        `INSERT INTO affiliate_links (id, creator_id, shop_product_id, code, clicks, active, created_at)
         VALUES ($1, $2, $3, $4, 0, TRUE, NOW())
         RETURNING *`,
        [id, req.user.id, shop_product_id, code]
      );

      auditLog({ actorUserId: req.user.id, action: 'affiliate.link.created', resource: 'affiliate_links', resourceId: id, ipAddress: req.ip });

      return res.status(201).json({ link: result.rows[0], product });
    } catch (err) {
      console.error('create affiliate link error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── GET /api/creator/links – list my affiliate links ────────────────────────

router.get(
  '/links',
  authenticate,
  requireRole('creator', 'seller', 'owner', 'admin'),
  async (req, res) => {
    const page   = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit  = Math.min(100, parseInt(req.query.limit || '20', 10));
    const offset = (page - 1) * limit;

    try {
      const countResult = await db.query(
        'SELECT COUNT(*) FROM affiliate_links WHERE creator_id = $1',
        [req.user.id]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await db.query(
        `SELECT al.id, al.code, al.clicks, al.active, al.created_at,
                p.name AS product_name, p.image_url AS product_image,
                sp.price_override, sp.commission_rate,
                s.name AS store_name, s.slug AS store_slug,
                COUNT(ac.id) FILTER (WHERE ac.created_at > NOW() - INTERVAL '30 days') AS clicks_30d,
                COALESCE(SUM(acom.amount) FILTER (WHERE acom.status = 'pending'), 0) AS pending_commission,
                COALESCE(SUM(acom.amount) FILTER (WHERE acom.status = 'paid'), 0)    AS paid_commission
         FROM affiliate_links al
         JOIN shop_products sp ON sp.id = al.shop_product_id
         JOIN products p       ON p.id  = sp.product_id
         JOIN stores s         ON s.id  = sp.store_id
         LEFT JOIN affiliate_clicks ac      ON ac.link_id = al.id
         LEFT JOIN affiliate_commissions acom ON acom.link_id = al.id
         WHERE al.creator_id = $1
         GROUP BY al.id, p.name, p.image_url, sp.price_override, sp.commission_rate, s.name, s.slug
         ORDER BY al.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.id, limit, offset]
      );

      return res.json({ total, page, limit, links: result.rows });
    } catch (err) {
      console.error('list affiliate links error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/creator/click – track a click on an affiliate link ─────────────
// Called from frontend when user lands on a product page via affiliate link.

router.post(
  '/click',
  [
    body('code').trim().notEmpty(),
  ],
  validate,
  async (req, res) => {
    const { code } = req.body;
    try {
      const linkResult = await db.query(
        'SELECT id FROM affiliate_links WHERE code = $1 AND active = TRUE',
        [code]
      );
      const link = linkResult.rows[0];
      if (!link) {
        return res.status(404).json({ error: 'Link partnerski nie istnieje' });
      }

      // Record click
      await db.query(
        `INSERT INTO affiliate_clicks (id, link_id, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), link.id, req.ip || null, req.headers['user-agent'] || null]
      );

      // Increment click counter
      await db.query(
        'UPDATE affiliate_links SET clicks = clicks + 1, updated_at = NOW() WHERE id = $1',
        [link.id]
      );

      return res.json({ tracked: true });
    } catch (err) {
      console.error('track affiliate click error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── GET /api/creator/stats – creator dashboard stats ────────────────────────

router.get(
  '/stats',
  authenticate,
  requireRole('creator', 'seller', 'owner', 'admin'),
  async (req, res) => {
    try {
      const [linksResult, commissionsResult, clicksResult] = await Promise.all([
        db.query(
          'SELECT COUNT(*) AS total_links, SUM(clicks) AS total_clicks FROM affiliate_links WHERE creator_id = $1',
          [req.user.id]
        ),
        db.query(
          `SELECT
             COUNT(*) AS total_commissions,
             COALESCE(SUM(amount), 0) AS total_earned,
             COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) AS pending,
             COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) AS approved,
             COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) AS paid
           FROM affiliate_commissions
           WHERE creator_id = $1`,
          [req.user.id]
        ),
        db.query(
          `SELECT COUNT(*) AS clicks_30d
           FROM affiliate_clicks ac
           JOIN affiliate_links al ON al.id = ac.link_id
           WHERE al.creator_id = $1
             AND ac.created_at > NOW() - INTERVAL '30 days'`,
          [req.user.id]
        ),
      ]);

      const links       = linksResult.rows[0];
      const commissions = commissionsResult.rows[0];
      const clicks      = clicksResult.rows[0];

      return res.json({
        total_links:        parseInt(links.total_links || 0, 10),
        total_clicks:       parseInt(links.total_clicks || 0, 10),
        clicks_30d:         parseInt(clicks.clicks_30d || 0, 10),
        total_commissions:  parseInt(commissions.total_commissions || 0, 10),
        total_earned:       parseFloat(commissions.total_earned),
        pending_commission: parseFloat(commissions.pending),
        approved_commission: parseFloat(commissions.approved),
        paid_commission:    parseFloat(commissions.paid),
      });
    } catch (err) {
      console.error('creator stats error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── GET /api/creator/commissions – list my commissions ──────────────────────

router.get(
  '/commissions',
  authenticate,
  requireRole('creator', 'seller', 'owner', 'admin'),
  async (req, res) => {
    const page   = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit  = Math.min(100, parseInt(req.query.limit || '20', 10));
    const offset = (page - 1) * limit;
    const status = req.query.status || null;

    try {
      const countResult = await db.query(
        `SELECT COUNT(*) FROM affiliate_commissions WHERE creator_id = $1 ${status ? 'AND status = $2' : ''}`,
        status ? [req.user.id, status] : [req.user.id]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await db.query(
        `SELECT ac.id, ac.amount, ac.rate, ac.status, ac.created_at,
                o.id AS order_id, o.total AS order_total,
                al.code AS affiliate_code,
                p.name AS product_name
         FROM affiliate_commissions ac
         JOIN affiliate_links al ON al.id = ac.link_id
         JOIN shop_products sp   ON sp.id = al.shop_product_id
         JOIN products p         ON p.id  = sp.product_id
         JOIN orders o           ON o.id  = ac.order_id
         WHERE ac.creator_id = $1
           ${status ? 'AND ac.status = $4' : ''}
         ORDER BY ac.created_at DESC
         LIMIT $2 OFFSET $3`,
        status ? [req.user.id, limit, offset, status] : [req.user.id, limit, offset]
      );

      return res.json({ total, page, limit, commissions: result.rows });
    } catch (err) {
      console.error('list commissions error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/creator/payouts – request a payout ────────────────────────────

router.post(
  '/payouts',
  authenticate,
  requireRole('creator', 'seller', 'owner', 'admin'),
  [
    body('amount').isFloat({ min: 0.01 }),
    body('notes').optional().trim(),
  ],
  validate,
  async (req, res) => {
    const { amount, notes } = req.body;
    try {
      // Verify creator has enough approved commissions
      const balanceResult = await db.query(
        `SELECT COALESCE(SUM(amount), 0) AS approved_balance
         FROM affiliate_commissions
         WHERE creator_id = $1 AND status = 'approved'`,
        [req.user.id]
      );
      const approvedBalance = parseFloat(balanceResult.rows[0].approved_balance);

      if (amount > approvedBalance) {
        return res.status(400).json({
          error: 'Kwota wypłaty przekracza dostępne saldo',
          available_balance: approvedBalance,
        });
      }

      const id = uuidv4();
      const result = await db.query(
        `INSERT INTO creator_payout_requests (id, creator_id, amount, status, notes, created_at)
         VALUES ($1, $2, $3, 'pending', $4, NOW())
         RETURNING *`,
        [id, req.user.id, amount, notes || null]
      );

      auditLog({ actorUserId: req.user.id, action: 'creator.payout.requested', resource: 'creator_payout_requests', resourceId: id, ipAddress: req.ip });

      return res.status(201).json({ payout: result.rows[0] });
    } catch (err) {
      console.error('request payout error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── GET /api/creator/payouts – payout history ───────────────────────────────

router.get(
  '/payouts',
  authenticate,
  requireRole('creator', 'seller', 'owner', 'admin'),
  async (req, res) => {
    const page   = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit  = Math.min(100, parseInt(req.query.limit || '20', 10));
    const offset = (page - 1) * limit;

    try {
      const countResult = await db.query(
        'SELECT COUNT(*) FROM creator_payout_requests WHERE creator_id = $1',
        [req.user.id]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await db.query(
        `SELECT id, amount, status, notes, created_at, updated_at
         FROM creator_payout_requests
         WHERE creator_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.id, limit, offset]
      );

      return res.json({ total, page, limit, payouts: result.rows });
    } catch (err) {
      console.error('list payouts error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── GET /api/creator/top-products – products available for affiliate ─────────

router.get('/top-products', async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit || '12', 10));

  try {
    const result = await db.query(
      `SELECT sp.id AS shop_product_id,
              p.name, p.image_url, p.category,
              sp.price_override, sp.commission_rate,
              s.name AS store_name, s.slug AS store_slug,
              COUNT(DISTINCT al.id) AS affiliate_count,
              COUNT(DISTINCT o.id)  AS order_count
       FROM shop_products sp
       JOIN products p ON p.id = sp.product_id
       JOIN stores s   ON s.id = sp.store_id
       LEFT JOIN affiliate_links al ON al.shop_product_id = sp.id
       LEFT JOIN affiliate_commissions acom ON acom.link_id = al.id
       LEFT JOIN orders o ON o.id = acom.order_id AND o.status = 'delivered'
       WHERE sp.affiliate_enabled = TRUE AND sp.active = TRUE
       GROUP BY sp.id, p.name, p.image_url, p.category, sp.price_override, sp.commission_rate, s.name, s.slug
       ORDER BY order_count DESC, affiliate_count DESC
       LIMIT $1`,
      [limit]
    );

    return res.json({ products: result.rows });
  } catch (err) {
    console.error('top products error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── GET /api/creator/leaderboard – top creators ─────────────────────────────

router.get('/leaderboard', async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit || '10', 10));

  try {
    const result = await db.query(
      `SELECT u.id, u.name,
              COUNT(DISTINCT al.id) AS links_count,
              COALESCE(SUM(al.clicks), 0) AS total_clicks,
              COUNT(DISTINCT acom.order_id) AS orders_referred,
              COALESCE(SUM(acom.amount) FILTER (WHERE acom.status IN ('approved', 'paid')), 0) AS total_earned
       FROM users u
       JOIN affiliate_links al ON al.creator_id = u.id
       LEFT JOIN affiliate_commissions acom ON acom.creator_id = u.id
       WHERE u.role = 'creator'
       GROUP BY u.id, u.name
       ORDER BY total_earned DESC, orders_referred DESC
       LIMIT $1`,
      [limit]
    );

    return res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error('leaderboard error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ─── POST /api/creator/generate/copy – AI promotional copy generator ──────────

router.post(
  '/generate/copy',
  authenticate,
  requireRole('creator', 'seller', 'owner', 'admin'),
  [
    body('shop_product_id').isUUID(),
    body('style').optional().isIn(['casual', 'professional', 'hype', 'tiktok', 'instagram']),
  ],
  validate,
  async (req, res) => {
    const { shop_product_id, style = 'tiktok' } = req.body;
    try {
      const productResult = await db.query(
        `SELECT p.name, p.description, p.category,
                sp.price_override, sp.commission_rate,
                s.name AS store_name
         FROM shop_products sp
         JOIN products p ON p.id = sp.product_id
         JOIN stores s   ON s.id = sp.store_id
         WHERE sp.id = $1 AND sp.affiliate_enabled = TRUE`,
        [shop_product_id]
      );

      const product = productResult.rows[0];
      if (!product) {
        return res.status(404).json({ error: 'Produkt nie istnieje lub nie obsługuje programu partnerskiego' });
      }

      const price = product.price_override || 'N/A';
      const commission = product.commission_rate;

      // Template-based copy generation (AI placeholder – extend with real LLM)
      const templates = {
        tiktok: [
          `✨ Odkryłem/am ${product.name} i jestem w szoku! 🛒 Sprawdź sam/a → link w bio! #${product.category || 'shopping'} #musthave`,
          `POV: Zamówiłem/am ${product.name} za ${price} zł i to był najlepszy zakup roku 🔥 Link w bio!`,
          `Nie mogę przestać polecać ${product.name} od ${product.store_name}! Idź po to TERAZ zanim się skończy 👇`,
        ],
        instagram: [
          `Przedstawiam wam mój nowy ulubiony produkt – ${product.name} ✨ Szczegóły w linku w bio!`,
          `${product.name} z ${product.store_name} to must-have tej sezonu 🛍️ Kliknij w link w bio, żeby zamówić!`,
          `Zakupy, które polecam z całego serca 💛 ${product.name} już w moim ulubionym sklepie!`,
        ],
        hype: [
          `🚀 OGROMNA OKAZJA! ${product.name} za ${price} zł – ZAMAWIAJ TERAZ, zanim wyprzeda się do zera!`,
          `‼️ LIMITOWANA ILOŚĆ ‼️ ${product.name} – najlepszy zakup tego roku! Link poniżej 👇`,
        ],
        casual: [
          `Hej! Chcę wam pokazać ${product.name} – fajny produkt, który ostatnio zamówiłem/am. Warto sprawdzić!`,
          `Polecam ${product.name} od ${product.store_name} – dobra jakość za rozsądną cenę 👌`,
        ],
        professional: [
          `Polecam Państwu ${product.name} ze sklepu ${product.store_name}. Produkt wysokiej jakości w przystępnej cenie.`,
          `${product.name} – profesjonalne rozwiązanie w kategorii ${product.category || 'produkty'}. Sprawdź ofertę sklepu ${product.store_name}.`,
        ],
      };

      const styleTemplates = templates[style] || templates.tiktok;
      const copy = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];

      return res.json({
        copy,
        style,
        product_name: product.name,
        store_name: product.store_name,
        commission_rate: commission,
      });
    } catch (err) {
      console.error('generate copy error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

// ─── POST /api/creator/generate/hook – AI video hook generator ───────────────

router.post(
  '/generate/hook',
  authenticate,
  requireRole('creator', 'seller', 'owner', 'admin'),
  [
    body('shop_product_id').isUUID(),
    body('platform').optional().isIn(['tiktok', 'instagram', 'youtube']),
  ],
  validate,
  async (req, res) => {
    const { shop_product_id, platform = 'tiktok' } = req.body;
    try {
      const productResult = await db.query(
        `SELECT p.name, p.description, p.category,
                sp.price_override
         FROM shop_products sp
         JOIN products p ON p.id = sp.product_id
         WHERE sp.id = $1 AND sp.affiliate_enabled = TRUE`,
        [shop_product_id]
      );

      const product = productResult.rows[0];
      if (!product) {
        return res.status(404).json({ error: 'Produkt nie istnieje lub nie obsługuje programu partnerskiego' });
      }

      const hooks = {
        tiktok: [
          `Zatrzymaj się – to zmieni sposób, w jaki myślisz o ${product.name} 👀`,
          `Nikt ci nie powie o tej sekrecie dotyczącej ${product.name}… ale ja ci powiem 🤫`,
          `Gdybym wiedział/a o ${product.name} rok temu, zaoszczędził/abym masę kasy 💸`,
          `ZACZEKAJ – czy ty w ogóle wiesz czym jest ${product.name}? #mustsee`,
        ],
        instagram: [
          `Swipe ➡️ żeby zobaczyć, jak ${product.name} zmienił/a moje życie na co dzień`,
          `Jeden produkt, który musisz mieć w ${new Date().getFullYear()} ✨`,
          `Mój sekret do idealnego ${product.category || 'stylu życia'}: ${product.name} 🙌`,
        ],
        youtube: [
          `W tym filmie pokażę ci dlaczego ${product.name} jest absolutnym game-changerem`,
          `Zrecenzowałem/am ${product.name} po 30 dniach używania – oto prawda`,
          `Czy ${product.name} jest warty swojej ceny? Przekonaj się sam/a`,
        ],
      };

      const platformHooks = hooks[platform] || hooks.tiktok;
      const hook = platformHooks[Math.floor(Math.random() * platformHooks.length)];

      return res.json({
        hook,
        platform,
        product_name: product.name,
      });
    } catch (err) {
      console.error('generate hook error:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  }
);

module.exports = router;
