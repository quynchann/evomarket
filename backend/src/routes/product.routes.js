import express from 'express'
import * as productController from '../controllers/product.controller.js'

const router = express.Router()

/**
 * Product Routes
 * Base path: /api-v1/products
 * Routes công khai - không cần authentication
 */

// Public routes - specific routes phải đặt trước dynamic routes
router.get('/featured', productController.getFeaturedProducts)
router.get('/search', productController.searchProducts)
router.get('/', productController.getProducts)
router.get('/:id', productController.getProductDetail)

export default router
