import jwt from 'jsonwebtoken'
import ApiError from '@/utils/api-error'
import { StatusCodes } from 'http-status-codes'
import { User } from '@/models/index.js'

/**
 * Gắn req.user nếu có Bearer hợp lệ; không lỗi nếu thiếu token (route public + tùy chọn đăng nhập).
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  const auth = req.headers['authorization'] || req.headers['Authorization']
  if (!auth || !auth.startsWith('Bearer ')) {
    return next()
  }
  try {
    const token = auth.substring('Bearer '.length)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const sub = payload.sub
    const userId = typeof sub === 'string' && /^\d+$/.test(sub) ? Number(sub) : sub
    
    // Check if user account is locked
    const user = await User.findByPk(userId, {
      attributes: ['id', 'account_status', 'role']
    })
    
    // If user not found or locked, don't attach to req.user (treat as guest)
    if (user && user.account_status !== 'LOCKED') {
      req.user = {
        id: userId,
        role: payload.role,
      }
    }
  } catch {
    // Token hết hạn / sai: coi như khách, không fail request
  }
  return next()
}

export const authMiddleware = async (req, res, next) => {
  // Whitelist paths that do not require authentication
  const whitelists = []
  if (whitelists.find((path) => '/api-v1' + path === req.originalUrl))
    return next()

  try {
    const auth = req.headers['authorization'] || req.headers['Authorization']
    if (!auth || !auth.startsWith('Bearer ')) {
      return next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Missing authentication token',
          'UNAUTHORIZED'
        )
      )
    }
    const token = auth.substring('Bearer '.length)
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const sub = payload.sub
    const userId = typeof sub === 'string' && /^\d+$/.test(sub) ? Number(sub) : sub
    
    // Check if user account is locked
    const user = await User.findByPk(userId, {
      attributes: ['id', 'account_status', 'role']
    })
    
    if (!user) {
      return next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          'User not found',
          'USER_NOT_FOUND'
        )
      )
    }
    
    if (user.account_status === 'LOCKED') {
      return next(
        new ApiError(
          StatusCodes.FORBIDDEN,
          'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ với quản trị viên để được hỗ trợ.',
          'ACCOUNT_LOCKED'
        )
      )
    }
    
    req.user = {
      id: userId,
      role: payload.role
    }
    return next()
  } catch (err) {
    if (err instanceof ApiError) return next(err)
    return next(
      new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Invalid or expired token',
        'UNAUTHORIZED'
      )
    )
  }
}
