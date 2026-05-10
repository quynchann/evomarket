import express from 'express'
import authRoutes from './auth.routes.js'
import productRoutes from './product.routes.js'
import sellerRoutes from './seller.routes.js'
import uploadRoutes from './upload.routes.js'
import cartRoutes from './cart.routes.js'
import orderRoutes from './order.routes.js'
import chatRoutes from './chat.routes.js'
import * as productController from '../controllers/product.controller.js'
import * as orderController from '../controllers/order.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

// Route public
router.get('/', async (req, res) => {
  res.status(200).json({
    message: 'API is running...'
  })
})

// Public routes
router.use('/auth', authRoutes)
router.use('/products', productRoutes)

// Category routes (tách riêng để tránh conflict với /products/:id)
router.get('/categories', productController.getCategories)
router.get('/categories/:id/products', productController.getProductsByCategory)

// Apply authentication middleware for all routes below
router.use(authMiddleware)

// Protected routes
router.use('/cart', cartRoutes)
router.use('/orders', orderRoutes)
router.use('/seller', sellerRoutes)
router.use('/upload', uploadRoutes)
router.use('/chat', chatRoutes)

// Seller order routes
router.get('/seller/orders', authorizeRoles('seller'), orderController.getSellerOrders)
router.get('/seller/revenue', authorizeRoles('seller'), orderController.getSellerRevenue)

// Admin routes
router.get('/admin/orders', authorizeRoles('admin'), orderController.getAllOrders)
router.get('/admin/revenue', authorizeRoles('admin'), orderController.getPlatformRevenue)

export default router
