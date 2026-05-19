import jwt from 'jsonwebtoken'
import ApiError from '@/utils/api-error'
import { StatusCodes } from 'http-status-codes'

/**
 * Gắn req.user nếu có Bearer hợp lệ; không lỗi nếu thiếu token (route public + tùy chọn đăng nhập).
 */
export const optionalAuthMiddleware = (req, res, next) => {
  const auth = req.headers['authorization'] || req.headers['Authorization']
  if (!auth || !auth.startsWith('Bearer ')) {
    return next()
  }
  try {
    const token = auth.substring('Bearer '.length)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const sub = payload.sub
    req.user = {
      id: typeof sub === 'string' && /^\d+$/.test(sub) ? Number(sub) : sub,
      role: payload.role,
    }
  } catch {
    // Token hết hạn / sai: coi như khách, không fail request
  }
  return next()
}

export const authMiddleware = (req, res, next) => {
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
    req.user = {
      id: typeof sub === 'string' && /^\d+$/.test(sub) ? Number(sub) : sub,
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
