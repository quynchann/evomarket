import { StatusCodes } from 'http-status-codes'
import { User } from '@/models/index.js'
import ApiError from '@/utils/api-error.js'
import * as productService from '@/services/product.service.js'
import * as shopService from '@/services/shop.service.js'

const viewerFromReq = (req) =>
  req.user?.id != null && req.user?.role
    ? { id: Number(req.user.id), role: String(req.user.role) }
    : null

/**
 * GET /api-v1/shops/:sellerId
 */
export const getShop = async (req, res, next) => {
  try {
    const sellerId = Number(req.params.sellerId)
    const data = await shopService.getPublicShopProfile(sellerId, viewerFromReq(req))
    res.status(StatusCodes.OK).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api-v1/shops/:sellerId/products
 */
export const getShopProducts = async (req, res, next) => {
  try {
    const sellerId = Number(req.params.sellerId)
    if (!Number.isFinite(sellerId)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { message: 'ID shop không hợp lệ', code: 'INVALID_SELLER_ID' },
      })
      return
    }
    const sellerExists = await User.findOne({
      where: { id: sellerId, role: 'seller' },
      attributes: ['id'],
    })
    if (!sellerExists) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy cửa hàng', 'SHOP_NOT_FOUND')
    }
    const { page = 1, limit = 20, sortBy } = req.query
    const result = await productService.getPublicProducts({
      sellerId,
      page: Number(page),
      limit: Number(limit),
      sortBy,
    })
    res.status(StatusCodes.OK).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api-v1/shops/:sellerId/follow
 */
export const followShop = async (req, res, next) => {
  try {
    const sellerId = Number(req.params.sellerId)
    const data = await shopService.followShop(sellerId, req.user.id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: { followerCount: data.followerCount, isFollowing: true },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api-v1/shops/:sellerId/follow
 */
export const unfollowShop = async (req, res, next) => {
  try {
    const sellerId = Number(req.params.sellerId)
    const data = await shopService.unfollowShop(sellerId, req.user.id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: { followerCount: data.followerCount, isFollowing: false },
    })
  } catch (err) {
    next(err)
  }
}
