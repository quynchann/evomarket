import { RefreshToken } from '@/models/index.js'

/**
 * Create refresh token
 */
export const create = async (data) => {
  return await RefreshToken.create(data)
}

/**
 * Find refresh token by token string
 */
export const findByToken = async (token) => {
  return await RefreshToken.findOne({ where: { token } })
}

/**
 * Revoke refresh token (mark as revoked)
 */
export const revoke = async (token) => {
  return await RefreshToken.update({ is_revoked: true }, { where: { token } })
}

/**
 * Revoke all refresh tokens for an user
 */
export const revokeAllUserTokens = async (user_id) => {
  return await RefreshToken.update({ is_revoked: true }, { where: { user_id } })
}

/**
 * Delete refresh token by ID
 */
export const deleteRefreshToken = async (id) => {
  return await RefreshToken.destroy({ where: { id } })
}
