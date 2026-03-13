'use strict'

/**
 * Users Module – Service (business-logic layer)
 */

const UsersModel = require('./model')

async function getProfile(userId) {
  const user = await UsersModel.findById(userId)
  if (!user) {
    const err = new Error('Użytkownik nie znaleziony')
    err.status = 404
    throw err
  }
  const profile = await UsersModel.findProfile(userId)
  return { ...user, profile: profile || null }
}

async function updateProfile(userId, { name, phone, bio, country, language, socialLinks }) {
  const user = await UsersModel.updateUser(userId, { name, phone })
  if (!user) {
    const err = new Error('Użytkownik nie znaleziony')
    err.status = 404
    throw err
  }

  if (bio !== undefined || country !== undefined || language !== undefined || socialLinks !== undefined) {
    await UsersModel.upsertProfile({ userId, bio, country, language, socialLinks })
  }

  return user
}

module.exports = { getProfile, updateProfile }
