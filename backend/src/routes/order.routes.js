import express from 'express'
import * as orderController from '../controllers/order.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

/**
 * Order Routes
 * Base path: /api/orders
 * 
 * Note: authMiddleware đã được apply trong api.js
 * Các routes ở đây yêu cầu authentication
 */

// Buyer routes - Tạo và xem đơn hàng
router.post('/', authorizeRoles('buyer'), orderController.createOrder)
router.get('/', authorizeRoles('buyer'), orderController.getBuyerOrders)

router.post('/:id/confirm-delivery', authorizeRoles('buyer'), orderController.buyerConfirmReceived)
router.post('/:id/request-return', authorizeRoles('buyer'), orderController.buyerRequestReturn)
router.post('/:id/cancel', authorizeRoles('buyer'), orderController.buyerCancelOrder)

// Order detail - Buyer có thể xem đơn của mình, Admin có thể xem tất cả
router.get('/:id', orderController.getOrderDetail)

// Seller routes - Cập nhật trạng thái đơn hàng
router.patch('/:id/status', authorizeRoles('seller'), orderController.updateOrderStatus)

export default router
