import { StatusCodes } from 'http-status-codes'
import * as orderService from '../services/order.service.js'

/**
 * Tạo đơn hàng mới
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id
    const orderData = req.body

    const result = await orderService.createOrder(userId, orderData)

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: result
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Lấy chi tiết đơn hàng
 * GET /api/orders/:id
 */
export const getOrderDetail = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id)
    const userId = req.user.role === 'admin' ? null : req.user.id

    const order = await orderService.getOrderDetail(orderId, userId)

    res.status(StatusCodes.OK).json({
      success: true,
      data: { order }
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Lấy danh sách đơn hàng của buyer
 * GET /api/orders
 */
export const getBuyerOrders = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status } = req.query

    const orders = await orderService.getBuyerOrders(userId, { page, limit, status })

    res.status(StatusCodes.OK).json({
      success: true,
      data: orders
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Lấy danh sách đơn hàng của seller
 * GET /api/seller/orders
 */
export const getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user.id
    const { page = 1, limit = 10, status } = req.query

    const orders = await orderService.getSellerOrders(sellerId, { page, limit, status })

    res.status(StatusCodes.OK).json({
      success: true,
      data: orders
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Lấy tất cả đơn hàng (Admin)
 * GET /api/admin/orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query

    const orders = await orderService.getAllOrders({ page, limit, status })

    res.status(StatusCodes.OK).json({
      success: true,
      data: orders
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Cập nhật trạng thái đơn hàng (Seller)
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id)
    const sellerId = req.user.id
    const { status } = req.body

    const order = await orderService.updateOrderStatus(orderId, sellerId, status)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: { order }
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Báo cáo doanh thu cho Seller
 * GET /api/seller/revenue
 */
export const getSellerRevenue = async (req, res, next) => {
  try {
    const sellerId = req.user.id
    const { from, to } = req.query

    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1)) // Đầu tháng
    const toDate = to ? new Date(to) : new Date() // Hôm nay

    const report = await orderService.getSellerRevenue(sellerId, fromDate, toDate)

    res.status(StatusCodes.OK).json({
      success: true,
      data: report
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Báo cáo doanh thu cho Admin (Chủ sàn)
 * GET /api/admin/revenue
 */
export const getPlatformRevenue = async (req, res, next) => {
  try {
    const { from, to } = req.query

    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1))
    const toDate = to ? new Date(to) : new Date()

    const report = await orderService.getPlatformRevenue(fromDate, toDate)

    res.status(StatusCodes.OK).json({
      success: true,
      data: report
    })
  } catch (err) {
    next(err)
  }
}
