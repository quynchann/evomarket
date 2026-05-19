import { StatusCodes } from 'http-status-codes'
import ApiError from '@/utils/api-error'

/**
 * Middleware to authorize user based on roles.
 */
export const authorizeRoles = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles]
  }

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          StatusCodes.FORBIDDEN,
          'Permission denied',
          'FORBIDDEN'
        )
      )
    }
    next()
  }
}
