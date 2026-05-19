import express from 'express'
import authRoutes from './auth.routes'
import productRoutes from './product.routes'
import sellerRoutes from './seller.routes'
import uploadRoutes from './upload.routes'
import cartRoutes from './cart.routes'
import orderRoutes from './order.routes'
import addressRoutes from './address.routes'
import chatRoutes from './chat.routes'
import couponRoutes from './coupon.routes'
import * as paymentController from '@/controllers/payment.controller'
import * as productController from '@/controllers/product.controller'
import * as orderController from '@/controllers/order.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { authorizeRoles } from '@/middlewares/role.middleware'
import paymentRoutes from './payments.routes'
import notificationRoutes from './notification.routes'
import adminRoutes from './admin.routes'
import shopRoutes from './shop.routes.js'
import reviewRoutes from './review.routes.js'

const router = express.Router()

// Route public
router.get('/', async (req, res) => {
  res.status(200).json({
    message: 'API is running...',
  })
})

// Public routes
router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/shops', shopRoutes)

// Category routes (tách riêng để tránh conflict với /products/:id)
router.get('/categories', productController.getCategories)
router.get('/categories/:id/products', productController.getProductsByCategory)

// VNPay: Return / IPN (public — không dùng JWT)
router.get('/payments/vnpay/return', paymentController.vnpayReturn)
router.get('/payments/vnpay/ipn', paymentController.vnpayIpn)
router.post('/payments/vnpay/ipn', paymentController.vnpayIpn)

// Apply authentication middleware for all routes below
router.use(authMiddleware)

// Protected routes
router.use('/payments', paymentRoutes)
router.use('/cart', cartRoutes)
router.use('/addresses', addressRoutes)
router.use('/coupons', couponRoutes)
router.use('/orders', orderRoutes)
router.use('/reviews', reviewRoutes)
router.use('/seller', sellerRoutes)
router.use('/upload', uploadRoutes)
router.use('/chat', chatRoutes)
router.use('/notifications', notificationRoutes)
router.use('/admin', adminRoutes)

router.get(
  '/seller/revenue',
  authorizeRoles('seller'),
  orderController.getSellerRevenue,
)

export default router
