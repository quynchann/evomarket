import { StatusCodes } from 'http-status-codes'
import * as couponService from '../services/coupon.service.js'

/**
 * GET /api-v1/coupons/platform
 * Mã giảm giá sàn có thể dùng (đã lọc theo hạn, lượt, người mới, đã dùng)
 */
export const getPlatformCoupons = async (req, res, next) => {
  try {
    const userId = req.user.id
    const vouchers = await couponService.listPlatformCouponsForBuyer(userId)

    res.status(StatusCodes.OK).json({
      success: true,
      data: { vouchers },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api-v1/coupons/shop/:sellerId
 * Mã giảm giá theo shop
 */
export const getShopCoupons = async (req, res, next) => {
  try {
    const sellerId = Number(req.params.sellerId)
    if (!Number.isFinite(sellerId)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'sellerId không hợp lệ',
      })
      return
    }
    const userId = req.user.id
    const vouchers = await couponService.listShopCouponsForBuyer(userId, sellerId)

    res.status(StatusCodes.OK).json({
      success: true,
      data: { vouchers },
    })
  } catch (err) {
    next(err)
  }
}

/** GET /api-v1/seller/coupons */
export const listSellerCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.listSellerShopCoupons(req.user.id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: { coupons },
    })
  } catch (err) {
    next(err)
  }
}

/** POST /api-v1/seller/coupons */
export const createSellerCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.createSellerShopCoupon(req.user.id, req.body ?? {})
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: { coupon },
    })
  } catch (err) {
    next(err)
  }
}

/** PUT /api-v1/seller/coupons/:id */
export const updateSellerCoupon = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'id không hợp lệ',
      })
      return
    }
    const coupon = await couponService.updateSellerShopCoupon(req.user.id, id, req.body ?? {})
    res.status(StatusCodes.OK).json({
      success: true,
      data: { coupon },
    })
  } catch (err) {
    next(err)
  }
}

/** DELETE /api-v1/seller/coupons/:id */
export const deleteSellerCoupon = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'id không hợp lệ',
      })
      return
    }
    await couponService.deleteSellerShopCoupon(req.user.id, id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: { deleted: true },
    })
  } catch (err) {
    next(err)
  }
}
