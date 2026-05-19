import { Op } from 'sequelize'
import { User, Product, Review, Order, sequelize } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'
import * as orderService from './order.service.js'

/**
 * Bảng điều khiển: doanh thu kỳ + đếm nhanh
 */
export const getAdminOverview = async () => {
  const toDate = new Date()
  const fromDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1)

  const [
    revenueReport,
    orderStatusRows,
    buyers,
    sellers,
    productsListed,
    reviewsReported,
  ] = await Promise.all([
    orderService.getPlatformRevenue(fromDate, toDate),
    Order.findAll({
      attributes: [
        'status',
        // Bảng SQL là `Orders` nhưng alias trong query Sequelize là `Order` — dùng sai `Orders.id` sẽ 400 (SequelizeBaseError).
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    }),
    User.count({ where: { role: 'buyer' } }),
    User.count({ where: { role: 'seller' } }),
    Product.count({ where: { deleted: false } }),
    Review.count({ where: { is_reported: true } }),
  ])

  const orderByStatus = {}
  for (const row of orderStatusRows) {
    orderByStatus[row.status] = Number(row.count) || 0
  }

  const totalOrders = Object.values(orderByStatus).reduce((a, b) => a + b, 0)

  return {
    period: revenueReport.period,
    gmv: revenueReport.gmv,
    platform_revenue: revenueReport.platform_revenue,
    order_count_revenue: revenueReport.order_count,
    order_by_status: orderByStatus,
    total_orders: totalOrders,
    user_counts: { buyers, sellers, total: buyers + sellers },
    products_listed: productsListed,
    reviews_reported_pending: reviewsReported,
  }
}

export const listUsersForAdmin = async ({
  page = 1,
  limit = 10,
  role,
  q,
  account_status: accountStatus,
} = {}) => {
  const p = Math.max(1, parseInt(page, 10) || 1)
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const offset = (p - 1) * l

  const where = {}
  if (role && ['buyer', 'seller', 'admin'].includes(String(role))) {
    where.role = String(role)
  }
  if (accountStatus && ['ACTIVE', 'LOCKED'].includes(String(accountStatus))) {
    where.account_status = String(accountStatus)
  }
  const search = q != null ? String(q).trim() : ''
  if (search) {
    where[Op.or] = [
      { fullname: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone_number: { [Op.like]: `%${search}%` } },
    ]
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['id', 'DESC']],
    limit: l,
    offset,
  })

  return {
    users: rows.map((u) => u.get({ plain: true })),
    pagination: {
      total: count,
      page: p,
      limit: l,
      totalPages: Math.ceil(count / l) || 0,
    },
  }
}

export const updateUserAccountStatus = async (userId, accountStatus) => {
  const id = Number(userId)
  if (!Number.isFinite(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'id không hợp lệ', 'INVALID_ID')
  }
  const status = String(accountStatus || '').toUpperCase()
  if (!['ACTIVE', 'LOCKED'].includes(status)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'account_status phải là ACTIVE hoặc LOCKED',
      'INVALID_STATUS',
    )
  }

  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } })
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng', 'NOT_FOUND')
  }
  if (user.role === 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Không thể khóa tài khoản admin', 'FORBIDDEN')
  }

  user.account_status = status
  await user.save()
  return user.get({ plain: true })
}

export const listProductsForAdmin = async ({
  page = 1,
  limit = 10,
  deleted,
  q,
} = {}) => {
  const p = Math.max(1, parseInt(page, 10) || 1)
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const offset = (p - 1) * l

  const where = {}
  if (deleted === 'true' || deleted === true || deleted === '1') {
    where.deleted = true
  } else if (deleted === 'false' || deleted === false || deleted === '0') {
    where.deleted = false
  }

  const search = q != null ? String(q).trim() : ''
  if (search) {
    where.title = { [Op.like]: `%${search}%` }
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'Seller',
        attributes: ['id', 'fullname', 'email', 'shop_name'],
      },
    ],
    order: [['id', 'DESC']],
    limit: l,
    offset,
  })

  return {
    products: rows.map((r) => r.get({ plain: true })),
    pagination: {
      total: count,
      page: p,
      limit: l,
      totalPages: Math.ceil(count / l) || 0,
    },
  }
}

export const setProductDeletedFlag = async (productId, deleted) => {
  const id = Number(productId)
  if (!Number.isFinite(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'id không hợp lệ', 'INVALID_ID')
  }
  const flag =
    deleted === true || deleted === 'true' || deleted === 1 || deleted === '1'

  const product = await Product.findByPk(id)
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm', 'NOT_FOUND')
  }
  product.deleted = !!flag
  await product.save()
  return product.get({ plain: true })
}

export const listReviewsForAdmin = async ({
  page = 1,
  limit = 10,
  reported_only: reportedOnly,
} = {}) => {
  const p = Math.max(1, parseInt(page, 10) || 1)
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const offset = (p - 1) * l

  const where = {}
  if (reportedOnly === 'true' || reportedOnly === true || reportedOnly === '1') {
    where.is_reported = true
  }

  const { count, rows } = await Review.findAndCountAll({
    where,
    include: [
      { model: User, attributes: ['id', 'fullname', 'email'] },
      { model: Product, attributes: ['id', 'title', 'thumbnail'] },
    ],
    order: [['id', 'DESC']],
    limit: l,
    offset,
  })

  return {
    reviews: rows.map((r) => r.get({ plain: true })),
    pagination: {
      total: count,
      page: p,
      limit: l,
      totalPages: Math.ceil(count / l) || 0,
    },
  }
}

export const moderateReview = async (reviewId, { report_status: reportStatus, is_reported: isReported } = {}) => {
  const id = Number(reviewId)
  if (!Number.isFinite(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'id không hợp lệ', 'INVALID_ID')
  }

  const review = await Review.findByPk(id)
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đánh giá', 'NOT_FOUND')
  }

  if (reportStatus != null) {
    const rs = String(reportStatus)
    if (!['Pending', 'Reviewed', 'Rejected'].includes(rs)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'report_status không hợp lệ', 'INVALID_STATUS')
    }
    review.report_status = rs
  }

  if (is_reported !== undefined && is_reported !== null) {
    review.is_reported = !!(is_reported === true || is_reported === 'true' || is_reported === 1 || is_reported === '1')
  }

  await review.save()
  return review.get({ plain: true })
}
