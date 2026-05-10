import express from 'express'
import * as sellerProductController from '../controllers/sellerProduct.controller.js'
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

// Product management routes
router.get('/categories', sellerProductController.listCategories)
router.get('/products', sellerProductController.listProducts)
router.post('/products', sellerProductController.createProduct)
router.put('/products/:id', sellerProductController.updateProduct)
router.delete('/products/:id', sellerProductController.deleteProduct)

export default router
