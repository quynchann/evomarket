import { env } from '@/config'

/**
 * Cookie configuration constants
 */
export const COOKIE_NAMES = {
  REFRESH_TOKEN: 'refreshToken'
}

/**
 * Get cookie options for refresh token
 */
export const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', // 'lax' cho dev, 'none' cho prod (cần secure=true)
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
})

/**
 * Set refresh token cookie
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, getRefreshTokenCookieOptions())
}

/**
 * Clear refresh token cookie
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
  })
}

/**
 * Get refresh token from request cookies
 */
export const getRefreshTokenFromCookie = (req) => {
  return req.cookies[COOKIE_NAMES.REFRESH_TOKEN]
}
