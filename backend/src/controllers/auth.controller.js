import { StatusCodes } from 'http-status-codes'
import * as authService from '@/services/auth.service.js'
import * as cookieHelper from '@/utils/cookie-helper.js'
import ApiError from '@/utils/api-error.js'

/**
 * Helpers to get device info from request
 */
const getDeviceInfo = (req) =>
  req.headers['user-agent'] || req.body.deviceInfo || null

/**
 * Register a new user
 * POST /api-v1/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, fullname, role } = req.body

    const result = await authService.register({
      email,
      password,
      fullname,
      role
    })

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Login user
 * POST /api-v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const deviceInfo = getDeviceInfo(req)
    const result = await authService.login({ email, password, deviceInfo })

    // Set token in cookie
    cookieHelper.setRefreshTokenCookie(res, result.refreshToken)

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Refresh access token using refresh token in httpOnly cookie
 */
export const refreshToken = async (req, res, next) => {
  try {
    const deviceInfo = getDeviceInfo(req)
    const refreshToken = cookieHelper.getRefreshTokenFromCookie(req)

    if (!refreshToken)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Refresh token not found',
        'REFRESH_TOKEN_NOT_FOUND'
      )

    const result = await authService.refreshToken({
      requestToken: refreshToken,
      deviceInfo
    })

    // Set refresh token mới trong httpOnly cookie
    cookieHelper.setRefreshTokenCookie(res, result.refreshToken)

    // Không trả refreshToken
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user
      }
    })
  } catch (error) {
    // Nếu token bị revoke hoặc invalid, xóa cookie để tránh gửi lại token cũ
    if (
      error.code === 'REVOKED_REFRESH_TOKEN' ||
      error.code === 'INVALID_REFRESH_TOKEN' ||
      error.code === 'REFRESH_TOKEN_EXPIRED'
    ) {
      cookieHelper.clearRefreshTokenCookie(res)
    }
    next(error)
  }
}

/**
 * Logout user
 * POST /api-v1/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const deviceInfo = getDeviceInfo(req)
    const refreshToken = cookieHelper.getRefreshTokenFromCookie(req)

    await authService.logout({ refreshToken, deviceInfo })

    cookieHelper.clearAuthCookie(res)

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        message: 'Logout successful'
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get current user profile
 * GET /api-v1/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id // From auth middleware

    const user = await authService.getProfile(userId)

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user
      }
    })
  } catch (error) {
    next(error)
  }
}
