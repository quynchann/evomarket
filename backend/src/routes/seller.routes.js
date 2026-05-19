import express from 'express'
import * as sellerProductController from '../controllers/sellerProduct.controller.js'
import * as orderController from '../controllers/order.controller.js'
import * as couponController from '../controllers/coupon.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

/**
 * Seller Routes
 * Base path: /api-v1/seller
 *
 * Note: authMiddleware đã được apply trong api.js trước khi mount /seller
 * Ở đây chỉ cần check role = 'seller'
 */

// Apply role check cho tất cả seller routes
router.use(authorizeRoles('seller'))

// Dashboard / đơn hàng (đặt route cụ thể trước /orders)
router.get('/stats/today', orderController.getSellerTodayStats)
router.get('/orders/counts', orderController.getSellerOrderCounts)
router.get('/orders', orderController.getSellerOrders)
router.post('/orders/:id/accept-return', orderController.sellerAcceptReturn)
router.post('/orders/:id/reject-return', orderController.sellerRejectReturn)
router.post('/orders/:id/complete-refund', orderController.sellerCompleteRefund)

// Quản lý sản phẩm
router.get('/categories', sellerProductController.listCategories)
router.get('/products', sellerProductController.listProducts)
router.post('/products', sellerProductController.createProduct)
router.put('/products/:id', sellerProductController.updateProduct)
router.delete('/products/:id', sellerProductController.deleteProduct)

// Mã khuyến mãi shop
router.get('/coupons', couponController.listSellerCoupons)
router.post('/coupons', couponController.createSellerCoupon)
router.put('/coupons/:id', couponController.updateSellerCoupon)
router.delete('/coupons/:id', couponController.deleteSellerCoupon)

export default router
