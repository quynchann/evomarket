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
    const viewer = { id: req.user.id, role: req.user.role }

    const order = await orderService.getOrderDetail(orderId, viewer)

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
    const { page = 1, limit = 20, status } = req.query

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
 * Đếm đơn hàng theo trạng thái (seller)
 * GET /api/seller/orders/counts
 */
export const getSellerOrderCounts = async (req, res, next) => {
  try {
    const sellerId = req.user.id
    const data = await orderService.getSellerOrderCounts(sellerId)

    res.status(StatusCodes.OK).json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Thống kê dashboard seller trong ngày (CURDATE). Gồm cả điểm trung bình shop (reviews).
 * GET /api/seller/stats/today
 */
export const getSellerTodayStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id
    const data = await orderService.getSellerTodayStats(sellerId)
    res.status(StatusCodes.OK).json({
      success: true,
      data,
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
 * Body: { status, carrier_name?, tracking_number?, note? } — tracking_number bỏ qua/để trống → backend tự tạo EVO-…
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id)
    const sellerId = req.user.id

    const order = await orderService.updateOrderStatus(orderId, sellerId, req.body)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: { order }
    })
  } catch (err) {
    next(err)
  }
}

export const buyerConfirmReceived = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id)
    const buyerId = req.user.id
    const order = await orderService.buyerConfirmReceived(orderId, buyerId)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã xác nhận nhận hàng',
      data: { order },
    })
  } catch (err) {
    next(err)
  }
}

export const buyerRequestReturn = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id)
    const buyerId = req.user.id
    const order = await orderService.buyerRequestReturn(orderId, buyerId, {
      note: req.body?.note,
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã ghi nhận yêu cầu trả hàng',
      data: { order },
    })
  } catch (err) {
    next(err)
  }
}

export const buyerCancelOrder = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id)
    const buyerId = req.user.id
    const xff = req.headers['x-forwarded-for']
    let clientIp = '127.0.0.1'
    if (typeof xff === 'string' && xff.length) {
      clientIp = xff.split(',')[0].trim()
    } else if (req.socket?.remoteAddress) {
      clientIp = req.socket.remoteAddress.replace(/^::ffff:/i, '')
    }
    const order = await orderService.buyerCancelOrder(orderId, buyerId, {
      note: req.body?.note,
      clientIp,
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã hủy đơn hàng',
      data: { order },
    })
  } catch (err) {
    next(err)
  }
}

export const sellerAcceptReturn = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id)
    const sellerId = req.user.id
    const order = await orderService.sellerAcceptReturn(orderId, sellerId, {
      note: req.body?.note,
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã chấp nhận trả hàng — chờ hoàn tiền',
      data: { order },
    })
  } catch (err) {
    next(err)
  }
}

export const sellerRejectReturn = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id)
    const sellerId = req.user.id
    const order = await orderService.sellerRejectReturn(orderId, sellerId, {
      note: req.body?.note,
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã từ chối yêu cầu trả hàng',
      data: { order },
    })
  } catch (err) {
    next(err)
  }
}

export const sellerCompleteRefund = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id)
    const sellerId = req.user.id
    const order = await orderService.sellerCompleteRefund(orderId, sellerId, {
      note: req.body?.note,
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã xác nhận hoàn tiền',
      data: { order },
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
