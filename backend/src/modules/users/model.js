'use strict'

/**
 * Users Module – Model (data-access layer)
 */

const db = require('../../config/database')

async function findById(id) {
  const result = await db.query(
    'SELECT id, email, name, role, plan, trial_ends_at, created_at FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

async function findProfile(userId) {
  const result = await db.query(
    'SELECT bio, country, language, social_links FROM user_profiles WHERE user_id = $1',
    [userId]
  )
  return result.rows[0] || null
}

async function upsertProfile({ userId, bio, country, language, socialLinks }) {
  const result = await db.query(
    `INSERT INTO user_profiles (user_id, bio, country, language, social_links, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       bio          = COALESCE(EXCLUDED.bio, user_profiles.bio),
       country      = COALESCE(EXCLUDED.country, user_profiles.country),
       language     = COALESCE(EXCLUDED.language, user_profiles.language),
       social_links = COALESCE(EXCLUDED.social_links, user_profiles.social_links),
       updated_at   = NOW()
     RETURNING *`,
    [userId, bio || null, country || null, language || null, socialLinks ? JSON.stringify(socialLinks) : null]
  )
  return result.rows[0]
}

async function updateUser(id, { name, phone }) {
  const result = await db.query(
    `UPDATE users SET
       name       = COALESCE($1, name),
       phone      = COALESCE($2, phone),
       updated_at = NOW()
     WHERE id = $3
     RETURNING id, email, name, phone, role, plan`,
    [name || null, phone || null, id]
  )
  return result.rows[0] || null
}

module.exports = { findById, findProfile, upsertProfile, updateUser }
