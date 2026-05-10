import { Order, OrderItem, Product, PlatformConfig, User, sequelize } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'

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
  const transaction = await sequelize.transaction()

  try {
    const { items, fullname, email, phone, address, payment_method } = orderData

    if (!items || items.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Giỏ hàng trống',
        'EMPTY_CART'
      )
    }

    // Lấy phí sàn hiện tại (sẽ được snapshot vào từng item)
    const platformFeePercent = await getPlatformFeePercent()

    let totalPrice = 0
    const orderItemsData = []

    // Xử lý từng item trong giỏ hàng
    for (const item of items) {
      const { product_id, variant_id, quantity } = item

      // Lấy thông tin sản phẩm đầy đủ (bao gồm seller_id, giá, giá nhập)
      const product = await Product.findByPk(product_id, {
        include: [
          {
            model: User,
            as: 'Seller',
            attributes: ['id', 'fullname', 'email']
          }
        ],
        transaction
      })

      if (!product) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Sản phẩm ID ${product_id} không tồn tại`,
          'PRODUCT_NOT_FOUND'
        )
      }

      // Kiểm tra tồn kho
      if (product.available < quantity) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Sản phẩm "${product.title}" không đủ hàng (còn ${product.available})`,
          'INSUFFICIENT_STOCK'
        )
      }

      // ===== SNAPSHOT CÁC GIÁ TRỊ QUAN TRỌNG =====
      
      // 1. Giá bán ra (Selling Price)
      const sellingPrice = product.price

      // 2. Giá nhập/vốn (Import Price) - Trung bình gia quyền
      const importPrice = product.import_price || 0

      // 3. Tính phí sàn
      const itemTotalPrice = sellingPrice * quantity
      const platformFee = Math.round((itemTotalPrice * platformFeePercent) / 100)

      // 4. Thông tin sản phẩm
      const productTitle = product.title
      const productThumbnail = product.thumbnail

      // TODO: Xử lý variant nếu có
      let variantName = null
      if (variant_id) {
        // const variant = await ProductVariant.findByPk(variant_id, { transaction })
        // variantName = variant ? variant.name : null
      }

      // Lưu snapshot vào OrderItem
      orderItemsData.push({
        product_id,
        variant_id,
        seller_id: product.seller_id,
        quantity,
        // Giá cũ (để tương thích)
        price: sellingPrice,
        total_price: itemTotalPrice,
        // ===== SNAPSHOT FIELDS =====
        selling_price: sellingPrice,
        import_price: importPrice,
        platform_fee: platformFee,
        platform_fee_percent: platformFeePercent,
        product_title: productTitle,
        product_thumbnail: productThumbnail,
        variant_name: variantName
      })

      totalPrice += itemTotalPrice

      // Cập nhật tồn kho
      await product.update({
        sold: product.sold + quantity,
        available: product.available - quantity
      }, { transaction })
    }

    // Tạo đơn hàng
    const order = await Order.create({
      user_id: userId,
      fullname,
      email,
      phone,
      address,
      total_price: totalPrice,
      payment_method: payment_method || 'COD',
      status: 'Pending'
    }, { transaction })

    // Tạo các OrderItem với snapshot
    const orderItems = await OrderItem.bulkCreate(
      orderItemsData.map(item => ({
        ...item,
        order_id: order.id
      })),
      { transaction }
    )

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
          status: { $in: ['Delivered', 'Processing', 'Shipped'] },
          created_at: {
            $between: [fromDate, toDate]
          }
        }
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
          status: { $in: ['Delivered', 'Processing', 'Shipped'] },
          created_at: {
            $between: [fromDate, toDate]
          }
        }
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
 */
export const getOrderDetail = async (orderId, userId = null) => {
  const whereClause = { id: orderId }
  if (userId) whereClause.user_id = userId

  const order = await Order.findOne({
    where: whereClause,
    include: [
      {
        model: OrderItem,
        include: [
          {
            model: User,
            as: 'Seller',
            attributes: ['id', 'fullname', 'email']
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

  return order
}

/**
 * DANH SÁCH ĐƠN HÀNG CỦA BUYER
 */
export const getBuyerOrders = async (userId, options = {}) => {
  const { page = 1, limit = 10, status } = options
  const offset = (page - 1) * limit

  const whereClause = { user_id: userId }
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
            attributes: ['id', 'fullname']
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
 */
export const getSellerOrders = async (sellerId, options = {}) => {
  const { page = 1, limit = 10, status } = options
  const offset = (page - 1) * limit

  const whereClause = { seller_id: sellerId }
  if (status) whereClause.status = status

  const { count, rows } = await OrderItem.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Order,
        required: true
      }
    ],
    order: [[Order, 'created_at', 'DESC']],
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
            attributes: ['id', 'fullname']
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
 * CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (SELLER)
 */
export const updateOrderStatus = async (orderId, sellerId, newStatus) => {
  // Kiểm tra trạng thái hợp lệ
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Trạng thái không hợp lệ',
      'INVALID_STATUS'
    )
  }

  // Tìm đơn hàng và kiểm tra seller có quyền
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        where: { seller_id: sellerId },
        required: true
      }
    ]
  })

  if (!order) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Không tìm thấy đơn hàng hoặc bạn không có quyền',
      'ORDER_NOT_FOUND'
    )
  }

  // Cập nhật trạng thái
  await order.update({ status: newStatus })

  return order
}
