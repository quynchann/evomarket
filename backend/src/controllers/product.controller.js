import { StatusCodes } from 'http-status-codes'
import * as productService from '../services/product.service.js'
import * as reviewService from '../services/review.service.js'

/**
 * GET /api/products
 * Get all products (public)
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy,
      sellerId,
      page = 1,
      limit = 20
    } = req.query

    const filters = {
      categoryId: categoryId ? Number(categoryId) : undefined,
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      sellerId: sellerId ? Number(sellerId) : undefined,
      page: Number(page),
      limit: Number(limit)
    }

    const result = await productService.getPublicProducts(filters)

    res.status(StatusCodes.OK).json({
      success: true,
      data: result.products,
      pagination: result.pagination
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/products/:id/view
 * Ghi nhận khách xem sản phẩm (đếm unique/shop/ngày), có thể gửi kèm Bearer buyer.
 */
export const trackProductView = async (req, res, next) => {
  try {
    const productId = Number(req.params.id)
    const { visitorKey } = req.body ?? {}
    const result = await productService.recordProductView(productId, {
      buyerUserId: req.user?.role === 'buyer' ? req.user.id : null,
      visitorKey,
      viewerUserId: req.user?.id != null ? req.user.id : null,
    })
    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/products/:id
 * Get product detail
 */
export const getProductDetail = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await productService.getProductById(id)

    res.status(StatusCodes.OK).json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/products/:id/reviews
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 10 } = req.query
    const data = await reviewService.listPublicReviewsForProduct(id, {
      page: Number(page),
      limit: Number(limit),
    })
    res.status(StatusCodes.OK).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/categories
 * Get all categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getAllCategories()

    res.status(StatusCodes.OK).json({
      success: true,
      data: categories
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/categories/:id/products
 * Get products by category
 */
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 20, sortBy } = req.query

    const filters = {
      page: Number(page),
      limit: Number(limit),
      sortBy
    }

    const result = await productService.getProductsByCategory(id, filters)

    res.status(StatusCodes.OK).json({
      success: true,
      data: result.products,
      pagination: result.pagination
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/products/featured
 * Get featured products
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query
    const products = await productService.getFeaturedProducts(Number(limit))

    res.status(StatusCodes.OK).json({
      success: true,
      data: products
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/products/search
 * Search products
 */
export const searchProducts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20, sortBy } = req.query

    if (!q || !q.trim()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Search query is required'
      })
    }

    const filters = {
      page: Number(page),
      limit: Number(limit),
      sortBy
    }

    const result = await productService.searchProducts(q, filters)

    res.status(StatusCodes.OK).json({
      success: true,
      data: result.products,
      pagination: result.pagination
    })
  } catch (error) {
    next(error)
  }
}
