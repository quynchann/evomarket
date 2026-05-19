import express from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'

const router = express.Router()

/**
 * Authentication Routes
 * Base path: /api-v1/auth
 */

// Public routes - Không cần authentication
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/refresh-token', authController.refreshToken)

router.use(authMiddleware)

// Protected routes - Cần authentication
router.get('/me', authController.getMe)
router.patch('/me', authController.updateMe)
router.post('/change-password', authController.changePassword)

export default router
