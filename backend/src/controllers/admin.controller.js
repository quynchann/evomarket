import { StatusCodes } from 'http-status-codes'
import * as adminService from '../services/admin.service.js'
import * as couponService from '../services/coupon.service.js'
import * as orderController from './order.controller.js'

export const getAdminOverview = async (req, res, next) => {
  try {
    const data = await adminService.getAdminOverview()
    res.status(StatusCodes.OK).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const listUsers = async (req, res, next) => {
  try {
    const data = await adminService.listUsersForAdmin(req.query)
    res.status(StatusCodes.OK).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const updateUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.updateUserAccountStatus(req.params.id, req.body?.account_status)
    res.status(StatusCodes.OK).json({ success: true, data: { user } })
  } catch (err) {
    next(err)
  }
}

export const listProducts = async (req, res, next) => {
  try {
    const data = await adminService.listProductsForAdmin(req.query)
    res.status(StatusCodes.OK).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const patchProductVisibility = async (req, res, next) => {
  try {
    const product = await adminService.setProductDeletedFlag(req.params.id, req.body?.deleted)
    res.status(StatusCodes.OK).json({
      success: true,
      message: product.deleted ? 'Đã ẩn sản phẩm' : 'Đã hiển thị lại sản phẩm',
      data: { product },
    })
  } catch (err) {
    next(err)
  }
}

export const listReviews = async (req, res, next) => {
  try {
    const data = await adminService.listReviewsForAdmin(req.query)
    res.status(StatusCodes.OK).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const patchReview = async (req, res, next) => {
  try {
    const review = await adminService.moderateReview(req.params.id, {
      report_status: req.body?.report_status,
      is_reported: req.body?.is_reported,
    })
    res.status(StatusCodes.OK).json({ success: true, data: { review } })
  } catch (err) {
    next(err)
  }
}

export const listPlatformCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.listPlatformCouponsForAdmin()
    res.status(StatusCodes.OK).json({ success: true, data: { coupons } })
  } catch (err) {
    next(err)
  }
}

export const createPlatformCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.createPlatformCoupon(req.body ?? {})
    res.status(StatusCodes.CREATED).json({ success: true, data: { coupon } })
  } catch (err) {
    next(err)
  }
}

export const updatePlatformCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.updatePlatformCoupon(req.params.id, req.body ?? {})
    res.status(StatusCodes.OK).json({ success: true, data: { coupon } })
  } catch (err) {
    next(err)
  }
}

export const deletePlatformCoupon = async (req, res, next) => {
  try {
    await couponService.deletePlatformCoupon(req.params.id)
    res.status(StatusCodes.OK).json({ success: true, data: { deleted: true } })
  } catch (err) {
    next(err)
  }
}

export const getAllOrders = orderController.getAllOrders
export const getPlatformRevenue = orderController.getPlatformRevenue
