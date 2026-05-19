import {
  Order,
  OrderItem,
  OrderStatusHistory,
  Product,
  ProductVariant,
  PlatformConfig,
  User,
  Cart,
  Coupon,
  CouponRedemption,
  Payment,
  Refund,
  sequelize,
} from '../models/index.js'
import ApiError from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'
import crypto from 'crypto'
import { Op, QueryTypes } from 'sequelize'
import { lockValidateCouponForOrder } from './coupon.service.js'
import { emitOrderStatusUpdatedToBuyer } from '../sockets/emitters/system.emitter.js'
import { createAndPushUserNotification } from './notification.service.js'
import {
  attachReviewsToOrderItemsForBuyer,
  getSellerRatingSummary,
} from './review.service.js'
import {
  ORDER_STATUS,
  ORDER_STATUS_VI,
  SELLER_NEXT_STATUSES,
  BUYER_CANCELABLE_STATUSES,
  SELLER_CANCELABLE_STATUSES,
  REVENUE_COUNTED_ORDER_STATUSES,
} from '../constants/orderStatus.js'
import { env } from '../config/env.js'
import { refundFullPaymentForBuyerCancel } from './vnpayPayment.service.js'

const toBuyerId = (id) => {
  const n = Number(id)
  return Number.isFinite(n) ? n : NaN
}

async function notifyBuyerOrderStatus(order, newStatus) {
  const buyerId = order.user_id
  const label = ORDER_STATUS_VI[newStatus] || newStatus
  if (buyerId != null && buyerId !== '') {
    emitOrderStatusUpdatedToBuyer(buyerId, {
      orderId: order.id,
      status: newStatus,
      title: 'Cập nhật đơn hàng',
      message: `Đơn #${order.id}: ${label}`,
    })
    try {
      await createAndPushUserNotification(buyerId, {
        type: 'order_status',
        title: 'Cập nhật đơn hàng',
        message: `Đơn #${order.id}: ${label}`,
        metadata: { orderId: order.id, status: newStatus },
      })
    } catch (e) {
      console.error('[notifyBuyerOrderStatus] Lưu thông báo thất bại:', e?.message || e)
    }
  }
}

async function appendStatusHistory(
  transaction,
  {
    orderId,
    fromStatus,
    toStatus,
    actorType,
    actorId = null,
    note = null,
    metadata = null,
  },
) {
  await OrderStatusHistory.create(
    {
      order_id: orderId,
      from_status: fromStatus,
      to_status: toStatus,
      actor_type: actorType,
      actor_id: actorId,
      note,
      metadata,
    },
    { transaction },
  )
}

/** Mã nội bộ để shop/khách đối chiếu khi không có mã từ đơn vị vận chuyển. */
async function allocateSellerTrackingNumber(orderId, transaction) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const hex = crypto.randomBytes(4).toString('hex').toUpperCase()
    const code = `EVO-${orderId}-${hex}`
    const conflict = await Order.findOne({
      where: {
        tracking_number: code,
        id: { [Op.ne]: orderId },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!conflict) return code
  }
  throw new ApiError(
    StatusCodes.INTERNAL_SERVER_ERROR,
    'Không tạo được mã vận đơn, vui lòng thử lại',
    'TRACKING_GEN_FAILED',
  )
}

async function restoreOrderInventory(orderId, transaction) {
  const lines = await OrderItem.findAll({
    where: { order_id: orderId },
    transaction,
  })
  for (const line of lines) {
    const q = Number(line.quantity) || 0
    const product = await Product.findByPk(line.product_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!product) continue

    const vid = line.variant_id != null && line.variant_id !== '' ? Number(line.variant_id) : null
    if (Number.isFinite(vid)) {
      const variant = await ProductVariant.findByPk(vid, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      })
      if (variant) {
        await variant.update(
          { stock: (Number(variant.stock) || 0) + q },
          { transaction },
        )
      }
      await product.update(
        { sold: Math.max(0, (Number(product.sold) || 0) - q) },
        { transaction },
      )
    } else {
      await product.update(
        {
          sold: Math.max(0, (Number(product.sold) || 0) - q),
          available: (Number(product.available) || 0) + q,
        },
        { transaction },
      )
    }
  }
}

async function assertBuyerOwnsOrder(order, buyerId) {
  if (order.user_id !== buyerId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền thao tác đơn này', 'FORBIDDEN')
  }
}

async function lockOrderForSeller(orderId, sellerId, transaction) {
  const order = await Order.findByPk(orderId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
    include: [
      {
        model: OrderItem,
        where: { seller_id: sellerId },
        required: true,
      },
    ],
  })
  if (!order) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Không tìm thấy đơn hàng hoặc bạn không có quyền',
      'ORDER_NOT_FOUND',
    )
  }
  return order
}

async function forbidCancelIfPaidOnline(order, transaction) {
  if (order.payment_method !== 'Online') return
  const payment = await Payment.findOne({
    where: { order_id: order.id },
    transaction,
  })
  if (payment && payment.status === 'Success') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Đơn đã thanh toán online, không thể hủy qua kênh này',
      'CANCEL_PAID_FORBIDDEN',
    )
  }
}

/** Khớp Checkout: standard = 0đ, express = 15.000đ — chỉ tin option, không tin số tiền client gửi. */
function resolveCheckoutShipping(raw) {
  const key = String(raw ?? 'standard').trim().toLowerCase()
  if (key === 'express') return { shippingFee: 15000, shippingMethodUi: 'express' }
  if (key === 'standard') return { shippingFee: 0, shippingMethodUi: 'standard' }
  throw new ApiError(
    StatusCodes.BAD_REQUEST,
    'Phương thức vận chuyển không hợp lệ',
    'INVALID_SHIPPING_METHOD',
  )
}

/**
 * Lấy phí sàn hiện tại
 */
export const getPlatformFeePercent = async () => {
  const config = await PlatformConfig.findOne({
    where: { config_key: 'platform_fee_percent' }
  })
  return config ? parseFloat(config.config_value) : 5.0 // Mặc định 5%
}

/**
 * TẠO ĐƠN HÀNG VỚI KỸ THUẬT SNAPSHOT
 * 
 * Kỹ thuật "Snapshotting" - Đóng băng thông tin tại thời điểm đặt hàng:
 * 1. Selling_Price: Giá bán ra do Seller quyết định
 * 2. Import_Price: Giá vốn/nhập của Seller
 * 3. Platform_Fee: Phí sàn (số tiền hoặc %)
 * 4. Thông tin sản phẩm: tên, ảnh, biến thể
 * 
 * Lợi ích:
 * - Bất chấp Seller thay đổi giá sau này, đơn hàng cũ không bị ảnh hưởng
 * - Báo cáo tài chính luôn chính xác
 * - Audit trail đầy đủ cho mục đích pháp lý
 */
export const createOrder = async (userId, orderData) => {
  const buyerId = toBuyerId(userId)
  if (!Number.isFinite(buyerId)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Không xác định được người mua',
      'INVALID_BUYER',
    )
  }

  const transaction = await sequelize.transaction()

  try {
    const {
      items,
      fullname,
      email,
      phone,
      address,
      payment_method,
      coupon_code,
      shop_coupons,
      shipping_method,
      buyer_note,
    } = orderData

    if (!items || items.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Giỏ hàng trống',
        'EMPTY_CART'
      )
    }

    const platformFeePercent = await getPlatformFeePercent()

    let totalPrice = 0
    const orderItemsData = []
    const sellerSubtotals = new Map()
    /** @type {Array<{ product: import('sequelize').Model; variant: import('sequelize').Model | null; qty: number }>} */
    const stockDeltas = []

    for (const item of items) {
      const product_id = Number(item.product_id)
      const quantity = Number(item.quantity)
      const variantRaw = item.variant_id
      const vid =
        variantRaw != null && variantRaw !== '' && variantRaw !== undefined
          ? Number(variantRaw)
          : null

      if (!Number.isFinite(product_id) || !Number.isFinite(quantity) || quantity < 1) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Thông tin sản phẩm không hợp lệ', 'INVALID_ITEM')
      }

      const product = await Product.findByPk(product_id, {
        include: [
          {
            model: User,
            as: 'Seller',
            attributes: ['id', 'fullname', 'email', 'shop_name'],
          },
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      })

      if (!product) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Sản phẩm ID ${product_id} không tồn tại`,
          'PRODUCT_NOT_FOUND'
        )
      }

      let variant = null
      if (Number.isFinite(vid)) {
        variant = await ProductVariant.findByPk(vid, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        })
        if (!variant || Number(variant.product_id) !== product_id) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Biến thể sản phẩm không hợp lệ', 'INVALID_VARIANT')
        }
        const vStock = Number(variant.stock) || 0
        if (vStock < quantity) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Sản phẩm "${product.title}" (phân loại) không đủ hàng (còn ${vStock})`,
            'INSUFFICIENT_STOCK',
          )
        }
      } else {
        if (product.available < quantity) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Sản phẩm "${product.title}" không đủ hàng (còn ${product.available})`,
            'INSUFFICIENT_STOCK'
          )
        }
      }

      const sellingPrice = product.price
      const importPrice = product.import_price || 0
      const itemTotalPrice = sellingPrice * quantity
      const platformFee = Math.round((itemTotalPrice * platformFeePercent) / 100)
      const productTitle = product.title
      const productThumbnail = product.thumbnail

      let variantName = null
      if (variant) {
        const parts = [variant.size, variant.color].filter(Boolean)
        variantName = parts.length ? parts.join(' · ') : null
      }

      orderItemsData.push({
        product_id,
        variant_id: Number.isFinite(vid) ? vid : null,
        seller_id: product.seller_id,
        quantity,
        price: sellingPrice,
        total_price: itemTotalPrice,
        selling_price: sellingPrice,
        import_price: importPrice,
        platform_fee: platformFee,
        platform_fee_percent: platformFeePercent,
        product_title: productTitle,
        product_thumbnail: productThumbnail,
        variant_name: variantName,
      })

      totalPrice += itemTotalPrice
      const sid = Number(product.seller_id) || 0
      sellerSubtotals.set(sid, (sellerSubtotals.get(sid) || 0) + itemTotalPrice)
      stockDeltas.push({ product, variant, qty: quantity })
    }

    let shopDiscountTotal = 0
    const shopCouponModels = []
    const rawShopMap = shop_coupons && typeof shop_coupons === 'object' ? shop_coupons : {}
    const shopKeys = Object.keys(rawShopMap).sort()
    for (const key of shopKeys) {
      const code = rawShopMap[key]
      const trimmed = code != null ? String(code).trim() : ''
      if (!trimmed) continue
      const sellerIdForCoupon = Number(key)
      if (!Number.isFinite(sellerIdForCoupon)) continue

      const subForShop = sellerSubtotals.get(sellerIdForCoupon) || 0
      const {
        coupon: shopC,
        discountAmount: shopDiscRaw,
      } = await lockValidateCouponForOrder({
        transaction,
        userId: buyerId,
        couponCode: trimmed,
        orderSubtotal: subForShop,
        scope: 'shop',
        shopSellerId: sellerIdForCoupon,
      })
      const d = Math.floor(Number(shopDiscRaw) || 0)
      shopDiscountTotal += d
      if (shopC) shopCouponModels.push(shopC)
    }

    let platformCoupon = null
    let platformDiscount = 0
    if (coupon_code != null && String(coupon_code).trim() !== '') {
      const {
        coupon: platC,
        discountAmount: platDiscRaw,
      } = await lockValidateCouponForOrder({
        transaction,
        userId: buyerId,
        couponCode: coupon_code,
        orderSubtotal: totalPrice,
        scope: 'platform',
      })
      platformDiscount = Math.floor(Number(platDiscRaw) || 0)
      platformCoupon = platC
    }

    const couponDiscountTotal = Math.floor(
      (Number(shopDiscountTotal) || 0) + (Number(platformDiscount) || 0),
    )

    const { shippingFee, shippingMethodUi } = resolveCheckoutShipping(shipping_method)
    const normalizedPayment = (payment_method || 'COD').toUpperCase() === 'ONLINE'
      ? 'Online'
      : 'COD'

    const finalTotal = Math.max(
      0,
      Math.round(totalPrice - couponDiscountTotal + shippingFee),
    )

    const noteSanitized =
      typeof buyer_note === 'string' && buyer_note.trim() !== ''
        ? String(buyer_note).trim().slice(0, 500)
        : null

    const order = await Order.create(
      {
        user_id: buyerId,
        fullname,
        email,
        phone,
        address,
        total_price: finalTotal,
        coupon_id: platformCoupon ? platformCoupon.id : null,
        coupon_discount: couponDiscountTotal,
        shipping_fee: shippingFee,
        shipping_method_ui: shippingMethodUi,
        payment_method: normalizedPayment,
        status: ORDER_STATUS.PENDING_CONFIRMATION,
        buyer_note: noteSanitized,
      },
      { transaction },
    )

    await appendStatusHistory(transaction, {
      orderId: order.id,
      fromStatus: null,
      toStatus: ORDER_STATUS.PENDING_CONFIRMATION,
      actorType: 'buyer',
      actorId: buyerId,
      note: 'Đặt hàng thành công',
    })

    if (normalizedPayment === 'Online') {
      await Payment.create(
        {
          order_id: order.id,
          user_id: buyerId,
          amount: finalTotal,
          method: 'Online',
          status: 'Pending',
          coupons_id: platformCoupon ? platformCoupon.id : null,
        },
        { transaction },
      )
    }

    const orderItems = await OrderItem.bulkCreate(
      orderItemsData.map((row) => ({
        ...row,
        order_id: order.id,
      })),
      { transaction },
    )

    for (const line of items) {
      const pid = line.product_id
      const variantRaw = line.variant_id
      await Cart.destroy({
        where: {
          userId: buyerId,
          productId: pid,
          variantId:
            variantRaw != null && variantRaw !== ''
              ? variantRaw
              : { [Op.is]: null }
        },
        transaction
      })
    }

    for (const { product, variant, qty } of stockDeltas) {
      const q = Number(qty) || 0
      if (variant) {
        await variant.update(
          { stock: Math.max(0, (Number(variant.stock) || 0) - q) },
          { transaction },
        )
        await product.update(
          { sold: (Number(product.sold) || 0) + q },
          { transaction },
        )
      } else {
        await product.update(
          {
            sold: (Number(product.sold) || 0) + q,
            available: (Number(product.available) || 0) - q,
          },
          { transaction },
        )
      }
    }

    const redeemIds = new Set()
    const recordRedeem = async (couponModel) => {
      if (!couponModel || redeemIds.has(couponModel.id)) return
      redeemIds.add(couponModel.id)
      await CouponRedemption.create(
        {
          user_id: buyerId,
          coupon_id: couponModel.id,
          order_id: order.id,
        },
        { transaction },
      )
      await Coupon.increment('used_count', {
        by: 1,
        where: { id: couponModel.id },
        transaction,
      })
    }

    for (const c of shopCouponModels) {
      await recordRedeem(c)
    }
    if (platformCoupon) {
      await recordRedeem(platformCoupon)
    }

    await transaction.commit()

    return {
      order,
      items: orderItems
    }

  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

/**
 * BÁO CÁO DOANH THU CHO SELLER
 * Tính toán dựa trên dữ liệu snapshot, không bị ảnh hưởng bởi thay đổi giá
 */
export const getSellerRevenue = async (sellerId, fromDate, toDate) => {
  const whereClause = {
    seller_id: sellerId
  }

  const orderItems = await OrderItem.findAll({
    where: whereClause,
    include: [
      {
        model: Order,
        where: {
          status: { [Op.in]: REVENUE_COUNTED_ORDER_STATUSES },
          created_at: {
            [Op.between]: [fromDate, toDate],
          },
        },
      }
    ]
  })

  let totalRevenue = 0      // Tổng doanh thu bán hàng
  let totalCost = 0         // Tổng chi phí vốn
  let totalPlatformFee = 0  // Tổng phí sàn
  let totalProfit = 0       // Lợi nhuận ròng

  orderItems.forEach(item => {
    const revenue = item.selling_price * item.quantity
    const cost = item.import_price * item.quantity
    const fee = item.platform_fee

    totalRevenue += revenue
    totalCost += cost
    totalPlatformFee += fee
    totalProfit += (revenue - cost - fee)
  })

  return {
    seller_id: sellerId,
    period: { from: fromDate, to: toDate },
    total_revenue: totalRevenue,
    total_cost: totalCost,
    total_platform_fee: totalPlatformFee,
    net_profit: totalProfit,
    order_count: orderItems.length
  }
}

/**
 * BÁO CÁO DOANH THU CHO ADMIN (CHỦ SÀN)
 * Admin chỉ quan tâm GMV và phí sàn thu được
 */
export const getPlatformRevenue = async (fromDate, toDate) => {
  const orderItems = await OrderItem.findAll({
    include: [
      {
        model: Order,
        where: {
          status: { [Op.in]: REVENUE_COUNTED_ORDER_STATUSES },
          created_at: {
            [Op.between]: [fromDate, toDate],
          },
        },
      }
    ]
  })

  let gmv = 0               // Gross Merchandise Value
  let totalPlatformFee = 0  // Tổng doanh thu sàn

  orderItems.forEach(item => {
    gmv += item.selling_price * item.quantity
    totalPlatformFee += item.platform_fee
  })

  return {
    period: { from: fromDate, to: toDate },
    gmv: gmv,
    platform_revenue: totalPlatformFee,
    order_count: orderItems.length
  }
}

/**
 * CHI TIẾT ĐơN HÀNG (Hiển thị thông tin snapshot)
 * @param {number} orderId
 * @param {{ id: number, role: string } | null} viewer - buyer chỉ xem đơn của mình; seller chỉ thấy dòng của shop; admin xem hết
 */
export const getOrderDetail = async (orderId, viewer = null) => {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: Payment,
        required: false,
      },
      {
        model: OrderStatusHistory,
        as: 'OrderStatusHistories',
        separate: true,
        order: [['created_at', 'ASC']],
      },
      {
        model: Refund,
        separate: true,
        order: [['created_at', 'DESC']],
      },
      {
        model: OrderItem,
        include: [
          {
            model: User,
            as: 'Seller',
            attributes: ['id', 'fullname', 'email', 'shop_name']
          }
        ]
      }
    ]
  })

  if (!order) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Không tìm thấy đơn hàng',
      'ORDER_NOT_FOUND'
    )
  }

  const plain = order.get({ plain: true })

  if (!viewer || viewer.role === 'admin') {
    return plain
  }

  if (viewer.role === 'buyer') {
    if (plain.user_id !== viewer.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền xem đơn hàng này', 'FORBIDDEN')
    }
    await attachReviewsToOrderItemsForBuyer(plain)
    return plain
  }

  if (viewer.role === 'seller') {
    const items = (plain.OrderItems || []).filter((i) => i.seller_id === viewer.id)
    if (items.length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Không tìm thấy đơn hàng',
        'ORDER_NOT_FOUND'
      )
    }
    return { ...plain, OrderItems: items }
  }

  throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền xem đơn hàng này', 'FORBIDDEN')
}

/**
 * DANH SÁCH ĐƠN HÀNG CỦA BUYER
 */
export const getBuyerOrders = async (userId, options = {}) => {
  const buyerId = toBuyerId(userId)
  if (!Number.isFinite(buyerId)) {
    return {
      orders: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    }
  }

  const { page = 1, limit = 10, status } = options
  const offset = (page - 1) * limit

  const whereClause = { user_id: buyerId }
  if (status) whereClause.status = status

  const { count, rows } = await Order.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: OrderItem,
        include: [
          {
            model: User,
            as: 'Seller',
            attributes: ['id', 'fullname', 'shop_name']
          }
        ]
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  })

  return {
    orders: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  }
}

/**
 * DANH SÁCH ĐƠN HÀNG CỦA SELLER
 * Phân trang theo đơn (Order), không theo từng dòng OrderItem.
 * Dùng SQL tham số hóa — tránh lỗi Sequelize findAndCountAll + distinct + JOIN trên MySQL.
 */
export const getSellerOrders = async (sellerId, options = {}) => {
  const sellerIdNum = Number(sellerId)
  const page = Math.max(1, parseInt(options.page, 10) || 1)
  const limit = 20
  const offset = (page - 1) * limit
  const { status } = options

  const statusFilter = status ? 'AND o.status = :status' : ''
  const baseRepl = { sellerId: sellerIdNum }
  if (status) baseRepl.status = status

  const countSql = `
    SELECT COUNT(*) AS cnt FROM (
      SELECT o.id
      FROM Orders o
      INNER JOIN OrderItems oi ON oi.order_id = o.id AND oi.seller_id = :sellerId
      WHERE 1=1 ${statusFilter}
      GROUP BY o.id
    ) AS sub
  `
  const [countRow] = await sequelize.query(countSql, {
    replacements: baseRepl,
    type: QueryTypes.SELECT
  })
  const total = parseInt(countRow?.cnt ?? countRow?.CNT, 10) || 0
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0

  if (total === 0) {
    return {
      orders: [],
      pagination: { total: 0, page, limit, totalPages: 0 }
    }
  }

  const idSql = `
    SELECT o.id
    FROM Orders o
    INNER JOIN OrderItems oi ON oi.order_id = o.id AND oi.seller_id = :sellerId
    WHERE 1=1 ${statusFilter}
    GROUP BY o.id, o.created_at
    ORDER BY o.created_at DESC
    LIMIT :limit OFFSET :offset
  `
  const idRows = await sequelize.query(idSql, {
    replacements: { ...baseRepl, limit, offset },
    type: QueryTypes.SELECT
  })
  const orderIds = idRows.map((r) => r.id).filter((id) => id != null)

  if (orderIds.length === 0) {
    return {
      orders: [],
      pagination: { total, page, limit, totalPages }
    }
  }

  const items = await OrderItem.findAll({
    where: { seller_id: sellerIdNum, order_id: { [Op.in]: orderIds } },
    include: [{ model: Order, required: true }]
  })

  const orderIdRank = Object.fromEntries(orderIds.map((id, i) => [id, i]))
  items.sort((a, b) => {
    const d = orderIdRank[a.order_id] - orderIdRank[b.order_id]
    if (d !== 0) return d
    return (a.id ?? 0) - (b.id ?? 0)
  })

  const flat = []
  for (const item of items) {
    const orderPlain = item.Order.get({ plain: true })
    const itemPlain = item.get({ plain: true })
    const { Order: _drop, ...restItem } = itemPlain
    flat.push({ ...restItem, Order: orderPlain })
  }

  return {
    orders: flat,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  }
}

/**
 * Đếm số đơn hàng (distinct Order) của seller theo từng trạng thái — dùng thống kê trên UI
 */
export const getSellerOrderCounts = async (sellerId) => {
  const sellerIdNum = Number(sellerId)

  const allSql = `
    SELECT COUNT(*) AS cnt FROM (
      SELECT o.id
      FROM Orders o
      INNER JOIN OrderItems oi ON oi.order_id = o.id AND oi.seller_id = :sellerId
      GROUP BY o.id
    ) AS sub
  `
  const [allRow] = await sequelize.query(allSql, {
    replacements: { sellerId: sellerIdNum },
    type: QueryTypes.SELECT
  })
  const all = parseInt(allRow?.cnt ?? allRow?.CNT, 10) || 0

  const byStatusRows = await sequelize.query(
    `SELECT o.status, COUNT(DISTINCT o.id) AS cnt
     FROM Orders o
     INNER JOIN OrderItems oi ON oi.order_id = o.id AND oi.seller_id = :sellerId
     GROUP BY o.status`,
    { replacements: { sellerId: sellerIdNum }, type: QueryTypes.SELECT }
  )

  const byStatus = {}
  for (const row of byStatusRows) {
    byStatus[row.status] = parseInt(row.cnt ?? row.CNT, 10) || 0
  }

  return { all, byStatus }
}

/**
 * Thống kê nhanh trên dashboard seller (theo ngày DB — CURDATE).
 * - revenueVnd: GMV dòng hàng của shop, đơn tạo hôm nay và đang trong nhóm tính doanh thu
 * - ordersToday: số đơn (distinct) có dòng của shop được tạo hôm nay
 * - visitorsToday: số khách duy nhất xem ít nhất một SP của shop trong ngày (SellerShopVisits)
 * - followerCount: tổng số người theo dõi shop (SellerShopFollows)
 * - ratingSummary: trung bình sao + số lượng đánh giá (Reviews trên SP của shop, giống trang cửa hàng công khai)
 */
export const getSellerTodayStats = async (sellerId) => {
  const sellerIdNum = Number(sellerId)
  const ph = REVENUE_COUNTED_ORDER_STATUSES.map(() => '?').join(',')
  const sql = `
    SELECT
      COALESCE(SUM(
        CASE
          WHEN o.status IN (${ph}) AND DATE(o.created_at) = CURDATE()
          THEN oi.total_price
          ELSE 0
        END
      ), 0) AS revenue_today,
      COUNT(DISTINCT CASE WHEN DATE(o.created_at) = CURDATE() THEN o.id END) AS orders_today
    FROM OrderItems oi
    INNER JOIN Orders o ON o.id = oi.order_id
    WHERE oi.seller_id = ?
  `
  const [row] = await sequelize.query(sql, {
    replacements: [...REVENUE_COUNTED_ORDER_STATUSES, sellerIdNum],
    type: QueryTypes.SELECT,
  })

  const [vrow] = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM SellerShopVisits WHERE seller_id = ? AND visit_date = CURDATE()`,
    { replacements: [sellerIdNum], type: QueryTypes.SELECT },
  )

  const [frow] = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM SellerShopFollows WHERE seller_id = ?`,
    { replacements: [sellerIdNum], type: QueryTypes.SELECT },
  )

  const rev = row?.revenue_today ?? row?.REVENUE_TODAY
  const ord = row?.orders_today ?? row?.ORDERS_TODAY
  const vc = vrow?.cnt ?? vrow?.CNT
  const fc = frow?.cnt ?? frow?.CNT

  const ratingSummary = await getSellerRatingSummary(sellerIdNum)

  return {
    revenueVnd: Number(rev) || 0,
    ordersToday: parseInt(String(ord ?? '0'), 10) || 0,
    visitorsToday: parseInt(String(vc ?? '0'), 10) || 0,
    followerCount: parseInt(String(fc ?? '0'), 10) || 0,
    ratingSummary,
  }
}

/**
 * DANH SÁCH TẤT CẢ ĐƠN HÀNG (ADMIN)
 */
export const getAllOrders = async (options = {}) => {
  const { page = 1, limit = 10, status } = options
  const offset = (page - 1) * limit

  const whereClause = {}
  if (status) whereClause.status = status

  const { count, rows } = await Order.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: OrderItem,
        include: [
          {
            model: User,
            as: 'Seller',
            attributes: ['id', 'fullname', 'shop_name']
          }
        ]
      },
      {
        model: User,
        as: 'Buyer',
        attributes: ['id', 'fullname', 'email']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  })

  return {
    orders: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  }
}

/**
 * CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (SELLER) — chỉ chuyển tuần tự theo SELLER_NEXT_STATUSES
 * Body: { status, carrier_name?, tracking_number?, note? } — bắt buộc carrier_name khi chuyển sang SHIPPED;
 * tracking_number để trống → hệ thống tự sinh mã nội bộ (EVO-…).
 */
export const updateOrderStatus = async (
  orderId,
  sellerId,
  { status: newStatus, carrier_name, tracking_number, note } = {},
) => {
  if (!newStatus || typeof newStatus !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu trạng thái', 'INVALID_STATUS')
  }

  const transaction = await sequelize.transaction()
  try {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
      include: [
        {
          model: OrderItem,
          where: { seller_id: sellerId },
          required: true,
        },
      ],
    })

    if (!order) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Không tìm thấy đơn hàng hoặc bạn không có quyền',
        'ORDER_NOT_FOUND',
      )
    }

    const prev = order.status
    const allowed = SELLER_NEXT_STATUSES[prev] || []
    if (!allowed.includes(newStatus)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Không thể chuyển đơn sang trạng thái này từ trạng thái hiện tại',
        'INVALID_STATUS_TRANSITION',
      )
    }

    if (newStatus === ORDER_STATUS.CANCELLED && !SELLER_CANCELABLE_STATUSES.has(prev)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Shop không thể hủy đơn ở trạng thái này', 'INVALID_STATUS_TRANSITION')
    }

    const patch = { status: newStatus }
    const meta = {}

    if (newStatus === ORDER_STATUS.SHIPPED) {
      const carrier = String(carrier_name ?? '').trim()
      if (!carrier) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Vui lòng nhập tên đơn vị vận chuyển',
          'CARRIER_REQUIRED',
        )
      }
      patch.carrier_name = carrier
      let tn = String(tracking_number ?? '').trim()
      if (!tn) {
        tn = await allocateSellerTrackingNumber(order.id, transaction)
      }
      patch.tracking_number = tn
      patch.shipped_at = new Date()
      meta.carrier_name = carrier
      meta.tracking_number = tn
    }

    if (newStatus === ORDER_STATUS.CANCELLED) {
      await forbidCancelIfPaidOnline(order, transaction)
      await restoreOrderInventory(order.id, transaction)
    }

    await order.update(patch, { transaction })

    await appendStatusHistory(transaction, {
      orderId: order.id,
      fromStatus: prev,
      toStatus: newStatus,
      actorType: 'seller',
      actorId: sellerId,
      note: note || (newStatus === ORDER_STATUS.CANCELLED ? 'Shop hủy đơn' : null),
      metadata: Object.keys(meta).length ? meta : null,
    })

    await transaction.commit()

    await notifyBuyerOrderStatus(order, newStatus)
    return getOrderDetail(orderId, { id: sellerId, role: 'seller' })
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}

/**
 * Buyer xác nhận đã nhận hàng: SHIPPED → COMPLETED
 */
export const buyerConfirmReceived = async (orderId, buyerId) => {
  const transaction = await sequelize.transaction()
  try {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng', 'ORDER_NOT_FOUND')
    }
    await assertBuyerOwnsOrder(order, buyerId)
    if (order.status !== ORDER_STATUS.SHIPPED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Chỉ có thể xác nhận khi đơn đã được giao cho đơn vị vận chuyển',
        'INVALID_STATUS_TRANSITION',
      )
    }
    const prev = order.status
    await order.update({ status: ORDER_STATUS.COMPLETED }, { transaction })
    await appendStatusHistory(transaction, {
      orderId: order.id,
      fromStatus: prev,
      toStatus: ORDER_STATUS.COMPLETED,
      actorType: 'buyer',
      actorId: buyerId,
      note: 'Người mua xác nhận đã nhận hàng',
    })
    await transaction.commit()
    await notifyBuyerOrderStatus(order, ORDER_STATUS.COMPLETED)
    return getOrderDetail(orderId, { id: buyerId, role: 'buyer' })
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}

/**
 * Buyer yêu cầu trả hàng: SHIPPED → RETURN_REQUESTED
 */
export const buyerRequestReturn = async (orderId, buyerId, { note } = {}) => {
  const transaction = await sequelize.transaction()
  try {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng', 'ORDER_NOT_FOUND')
    }
    await assertBuyerOwnsOrder(order, buyerId)
    if (order.status !== ORDER_STATUS.SHIPPED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Chỉ có thể yêu cầu trả hàng khi đơn đang trên đường giao',
        'INVALID_STATUS_TRANSITION',
      )
    }
    const prev = order.status
    await order.update({ status: ORDER_STATUS.RETURN_REQUESTED }, { transaction })
    await appendStatusHistory(transaction, {
      orderId: order.id,
      fromStatus: prev,
      toStatus: ORDER_STATUS.RETURN_REQUESTED,
      actorType: 'buyer',
      actorId: buyerId,
      note: note || 'Yêu cầu trả hàng',
    })
    await transaction.commit()
    await notifyBuyerOrderStatus(order, ORDER_STATUS.RETURN_REQUESTED)
    return getOrderDetail(orderId, { id: buyerId, role: 'buyer' })
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}

/**
 * Buyer hủy đơn (PENDING_CONFIRMATION, CONFIRMED).
 * Đơn đã thanh toán online thành công: gọi VNPay hoàn tiền toàn phần rồi mới hủy.
 */
export const buyerCancelOrder = async (orderId, buyerId, { note, clientIp } = {}) => {
  const transaction = await sequelize.transaction()
  try {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng', 'ORDER_NOT_FOUND')
    }
    await assertBuyerOwnsOrder(order, buyerId)
    if (!BUYER_CANCELABLE_STATUSES.has(order.status)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Đơn không thể hủy ở trạng thái hiện tại',
        'INVALID_STATUS_TRANSITION',
      )
    }

    const payment =
      order.payment_method === 'Online'
        ? await Payment.findOne({
            where: { order_id: order.id },
            transaction,
            lock: transaction.LOCK.UPDATE,
          })
        : null

    if (payment?.status === 'Success') {
      if (payment.refunded_at) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Đơn đã được hoàn tiền, không thể hủy lại',
          'ALREADY_REFUNDED',
        )
      }
      if (!env.VNPAY_TMN_CODE || !env.VNPAY_HASH_SECRET) {
        throw new ApiError(
          StatusCodes.SERVICE_UNAVAILABLE,
          'Chưa cấu hình VNPay — không thể hoàn tiền khi hủy đơn đã thanh toán',
          'VNPAY_NOT_CONFIGURED',
        )
      }
      await refundFullPaymentForBuyerCancel(order, payment, clientIp || '127.0.0.1')
      await payment.update({ refunded_at: new Date() }, { transaction })
      await Refund.create(
        {
          order_id: order.id,
          user_id: order.user_id,
          payment_id: payment.id,
          amount: order.total_price,
          reason: String(note || 'Người mua hủy đơn — hoàn tiền VNPay').slice(0, 255),
          status: 'Approved',
        },
        { transaction },
      )
    }

    const prev = order.status
    await order.update({ status: ORDER_STATUS.CANCELLED }, { transaction })
    await restoreOrderInventory(order.id, transaction)
    await appendStatusHistory(transaction, {
      orderId: order.id,
      fromStatus: prev,
      toStatus: ORDER_STATUS.CANCELLED,
      actorType: 'buyer',
      actorId: buyerId,
      note:
        note ||
        (payment?.status === 'Success'
          ? 'Người mua hủy đơn, đã hoàn tiền VNPay'
          : 'Người mua hủy đơn'),
    })
    await transaction.commit()
    await notifyBuyerOrderStatus(order, ORDER_STATUS.CANCELLED)
    return getOrderDetail(orderId, { id: buyerId, role: 'buyer' })
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}

/**
 * Shop chấp nhận yêu cầu trả hàng — tạo bản ghi hoàn tiền (Pending), chờ xác nhận đã chuyển khoản / hoàn qua cổng.
 */
export const sellerAcceptReturn = async (orderId, sellerId, { note } = {}) => {
  const transaction = await sequelize.transaction()
  try {
    const order = await lockOrderForSeller(orderId, sellerId, transaction)
    if (order.status !== ORDER_STATUS.RETURN_REQUESTED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Chỉ chấp nhận khi khách đang yêu cầu trả hàng',
        'INVALID_STATUS',
      )
    }
    const dup = await Refund.findOne({
      where: { order_id: order.id, status: 'Pending' },
      transaction,
    })
    if (dup) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Đơn đã có hoàn tiền chờ xử lý',
        'REFUND_PENDING_EXISTS',
      )
    }
    const payment =
      order.payment_method === 'Online'
        ? await Payment.findOne({ where: { order_id: order.id }, transaction })
        : null
    if (order.payment_method === 'Online') {
      if (!payment || payment.status !== 'Success') {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Thanh toán online chưa ghi nhận thành công, chưa thể lập hoàn tiền',
          'PAYMENT_NOT_SUCCESS',
        )
      }
    }

    await Refund.create(
      {
        order_id: order.id,
        user_id: order.user_id,
        payment_id: payment ? payment.id : null,
        amount: order.total_price,
        reason: String(note || 'Chấp nhận trả hàng').slice(0, 255),
        status: 'Pending',
      },
      { transaction },
    )
    const prev = order.status
    await order.update({ status: ORDER_STATUS.RETURN_ACCEPTED }, { transaction })
    await appendStatusHistory(transaction, {
      orderId: order.id,
      fromStatus: prev,
      toStatus: ORDER_STATUS.RETURN_ACCEPTED,
      actorType: 'seller',
      actorId: sellerId,
      note: note || 'Shop chấp nhận trả hàng — chờ hoàn tiền cho khách',
    })
    await transaction.commit()
    await notifyBuyerOrderStatus(order, ORDER_STATUS.RETURN_ACCEPTED)
    return getOrderDetail(orderId, { id: sellerId, role: 'seller' })
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}

/**
 * Shop từ chối yêu cầu trả hàng — đơn quay lại đang giao (SHIPPED).
 */
export const sellerRejectReturn = async (orderId, sellerId, { note } = {}) => {
  const transaction = await sequelize.transaction()
  try {
    const order = await lockOrderForSeller(orderId, sellerId, transaction)
    if (order.status !== ORDER_STATUS.RETURN_REQUESTED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Chỉ từ chối khi khách đang yêu cầu trả hàng',
        'INVALID_STATUS',
      )
    }
    const prev = order.status
    await order.update({ status: ORDER_STATUS.SHIPPED }, { transaction })
    await appendStatusHistory(transaction, {
      orderId: order.id,
      fromStatus: prev,
      toStatus: ORDER_STATUS.SHIPPED,
      actorType: 'seller',
      actorId: sellerId,
      note: note || 'Shop từ chối yêu cầu trả hàng',
    })
    await transaction.commit()
    await notifyBuyerOrderStatus(order, ORDER_STATUS.SHIPPED)
    return getOrderDetail(orderId, { id: sellerId, role: 'seller' })
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}

/**
 * Shop xác nhận đã hoàn tiền (chuyển khoản thủ công hoặc đã xử lý trên cổng thanh toán).
 * Hoàn tồn kho. VNPay API hoàn tiền tự động không gọi từ đây.
 */
export const sellerCompleteRefund = async (orderId, sellerId, { note } = {}) => {
  const transaction = await sequelize.transaction()
  try {
    const order = await lockOrderForSeller(orderId, sellerId, transaction)
    if (order.status !== ORDER_STATUS.RETURN_ACCEPTED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Chỉ xác nhận hoàn tiền khi đơn đã chấp nhận trả hàng',
        'INVALID_STATUS',
      )
    }
    const refund = await Refund.findOne({
      where: { order_id: order.id, status: 'Pending' },
      transaction,
      lock: transaction.LOCK.UPDATE,
    })
    if (!refund) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Không tìm thấy bản ghi hoàn tiền chờ xử lý',
        'REFUND_NOT_FOUND',
      )
    }
    await refund.update({ status: 'Approved' }, { transaction })
    const prev = order.status
    await order.update({ status: ORDER_STATUS.REFUNDED }, { transaction })
    await restoreOrderInventory(order.id, transaction)
    await appendStatusHistory(transaction, {
      orderId: order.id,
      fromStatus: prev,
      toStatus: ORDER_STATUS.REFUNDED,
      actorType: 'seller',
      actorId: sellerId,
      note: note || 'Shop xác nhận đã hoàn tiền cho người mua',
    })
    await transaction.commit()
    await notifyBuyerOrderStatus(order, ORDER_STATUS.REFUNDED)
    return getOrderDetail(orderId, { id: sellerId, role: 'seller' })
  } catch (e) {
    await transaction.rollback()
    throw e
  }
}

/**
 * Tự động hoàn tất đơn SHIPPED sau N ngày (cấu hình env), trừ khi RETURN_REQUESTED
 */
export const runAutoCompleteShippedOrders = async () => {
  const days = Math.max(1, Number(env.ORDER_AUTO_COMPLETE_DAYS_AFTER_SHIPPED) || 7)
  const cutoff = new Date(Date.now() - days * 86400000)
  const candidates = await Order.findAll({
    where: {
      status: ORDER_STATUS.SHIPPED,
      shipped_at: { [Op.lte]: cutoff },
    },
  })
  for (const order of candidates) {
    const transaction = await sequelize.transaction()
    try {
      const locked = await Order.findByPk(order.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      })
      if (!locked || locked.status !== ORDER_STATUS.SHIPPED) {
        await transaction.commit()
        continue
      }
      const prev = locked.status
      await locked.update({ status: ORDER_STATUS.COMPLETED }, { transaction })
      await appendStatusHistory(transaction, {
        orderId: locked.id,
        fromStatus: prev,
        toStatus: ORDER_STATUS.COMPLETED,
        actorType: 'system',
        actorId: null,
        note: `Tự động hoàn tất sau ${days} ngày kể từ khi bàn giao đơn vị vận chuyển`,
        metadata: { auto_complete_days: days },
      })
      await transaction.commit()
      await notifyBuyerOrderStatus(locked, ORDER_STATUS.COMPLETED)
    } catch (e) {
      await transaction.rollback()
      console.error('[runAutoCompleteShippedOrders]', order.id, e)
    }
  }
}
