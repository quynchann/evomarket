import * as userRepo from '@/repositories/user.repo.js'
import * as refreshTokenRepo from '@/repositories/refreshToken.repo.js'
import { hashPassword, comparePassword } from '@/utils/hash-password.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '@/utils/api-error.js'
import jwt from 'jsonwebtoken'
import ms from 'ms'
import { env } from '@/config/env.js'

/**
 * Helpers to generate access and refresh tokens
 */
const generateTokens = async (user, deviceInfo = null) => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role
  }

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRE
  })

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRE
  })

  const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRE))

  await refreshTokenRepo.create({
    token: refreshToken,
    user_id: user.id,
    expires_at: expiresAt,
    is_revoked: false,
    device_info: deviceInfo
  })

  return { accessToken, refreshToken }
}

/**
 * Helpers to remove sensitive fields from user object
 */
const publicUser = (user) => {
  const safeUser = { ...user.get() }
  delete safeUser.password
  delete safeUser.createdAt
  delete safeUser.updatedAt

  return safeUser
}

/**
 * Register new patient (chỉ patient mới được đăng ký, doctor và admin sẽ do admin tạo thủ công)
 */
export const register = async ({ email, password, fullname, role }) => {
  // Kiểm tra email tồn tại
  const existingEmail = await userRepo.findByEmail(email)
  if (existingEmail)
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Email already exists',
      'EMAIL_EXISTS'
    )

  const hashedPassword = await hashPassword(password)

  // Tạo user mới
  const newUser = await userRepo.create({
    email,
    password: hashedPassword,
    fullname,
    role
  })

  return publicUser(newUser)
}

export const login = async ({ email, password, deviceInfo }) => {
  const user = await userRepo.findByEmail(email)
  if (!user)
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Invalid credentials',
      'INVALID_CREDENTIALS'
    )

  const isMatch = await comparePassword(password, user.password)
  if (!isMatch)
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Invalid credentials',
      'INVALID_CREDENTIALS'
    )

  const tokens = await generateTokens(user, deviceInfo)

  return {
    user: publicUser(user),
    ...tokens
  }
}

export const refreshToken = async ({ requestToken, deviceInfo = null }) => {
  try {
    // Verify token (xem có hợp lệ về chữ ký & thời gian không)
    const payload = jwt.verify(requestToken, env.JWT_REFRESH_SECRET)

    const tokenDoc = await refreshTokenRepo.findByToken(requestToken)
    if (!tokenDoc)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Refresh token is invalid',
        'INVALID_REFRESH_TOKEN'
      )

    if (tokenDoc.isRevoked) {
      // Phát hiện hành vi bất thường: Token đã hủy mà vẫn đem ra dùng -> Có thể bị trộm
      // Nếu có deviceInfo, bạn có thể log lại cảnh báo bảo mật kèm thông tin thiết bị đang cố dùng token cũ
      if (deviceInfo) {
        console.warn(
          `[SECURITY] Suspicious token reuse detected from device: ${deviceInfo}`
        )
      }
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Refresh token has been revoked',
        'REVOKED_REFRESH_TOKEN'
      )
    }

    const user = await userRepo.findById(payload.sub)
    if (!user)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'User not found',
        'USER_NOT_FOUND'
      )

    // (Cơ chế Rotation) Hủy token cũ, cấp token mới
    await refreshTokenRepo.revoke(requestToken)

    const newTokens = await generateTokens(user, deviceInfo)
    return {
      ...newTokens,
      user: publicUser(user)
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Refresh token has expired, please log in again',
        'REFRESH_TOKEN_EXPIRED'
      )
    }
    throw error
  }
}

export const logout = async ({ refreshToken, deviceInfo = null }) => {
  if (refreshToken) {
    // Log thông tin thiết bị đăng xuất (nếu cần audit log)
    if (deviceInfo) {
      // console.log(`User logged out from device: ${deviceInfo}`)
    }

    await refreshTokenRepo.revoke(refreshToken)
  }
}

export const getProfile = async (userId) => {
  const user = await userRepo.findById(userId)
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'User not found',
      'USER_NOT_FOUND'
    )
  }
  return publicUser(user)
}
