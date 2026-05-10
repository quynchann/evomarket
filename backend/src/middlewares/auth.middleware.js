import jwt from 'jsonwebtoken'
import ApiError from '@/utils/api-error'
import { StatusCodes } from 'http-status-codes'

export const authMiddleware = (req, res, next) => {
  // Whitelist paths that do not require authentication
  const whitelists = []
  if (whitelists.find((path) => '/api-v1' + path === req.originalUrl))
    return next()

  try {
    const auth = req.headers['authorization'] || req.headers['Authorization']
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Missing authentication token',
        'UNAUTHORIZED'
      )
    }
    const token = auth.substring('Bearer '.length)
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    req.user = {
      id: payload.sub,
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
