/**
 * Socket.IO Authentication Middleware
 * Verify JWT token và attach user info vào socket
 */

import jwt from 'jsonwebtoken'
import { findByIdWithoutPassword } from '@/repositories/user.repo.js'

/**
 * Socket authentication middleware
 * Verifies JWT token from handshake.auth and attaches user to socket
 * @param {import('socket.io').Socket} socket
 * @param {Function} next
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Lấy token từ handshake.auth
    const token = socket.handshake.auth.token

    if (!token) {
      return next(
        new Error('[Socket Auth] Auth error: Missing authentication token'),
      )
    }

    // Verify JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    if (!payload || !payload.sub) {
      return next(new Error('[Socket Auth] Auth error: Invalid token payload'))
    }

    // Lấy thông tin user từ database
    const user = await findByIdWithoutPassword(payload.sub)

    if (!user) {
      return next(new Error('[Socket Auth] Auth error: User not found'))
    }

    // Kiểm tra user có bị khóa/vô hiệu hóa không
    if (user.account_status === 'LOCKED') {
      return next(new Error('[Socket Auth] Auth error: User account is locked'))
    }

    // Attach user info vào socket
    socket.user = user
    console.log(`[Socket Auth] User authenticated: ${user.id} (${user.role})`)
    next()
  } catch (error) {
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Invalid token'))
    }
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token expired'))
    }

    return next(new Error('Authentication failed'))
  }
}
