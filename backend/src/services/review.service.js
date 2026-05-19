import {
  Order,
  OrderItem,
  Product,
  Review,
  User,
  sequelize,
} from '../models/index.js'
import ApiError from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'
import { Op, QueryTypes } from 'sequelize'
import { ORDER_STATUS } from '../constants/orderStatus.js'

/**
 * Đính kèm review đã có (theo order_item) vào chi tiết đơn — buyer đã nhận hàng và đánh giá.
 */
export const attachReviewsToOrderItemsForBuyer = async (orderPlain) => {
  if (!orderPlain?.OrderItems?.length) return orderPlain
  const ids = orderPlain.OrderItems.map((i) => i.id).filter((x) => x != null)
  if (!ids.length) return orderPlain
  const rows = await Review.findAll({
    where: { order_item_id: { [Op.in]: ids } },
    attributes: ['id', 'order_item_id', 'rating', 'comment', 'created_at'],
  })
  const byItem = new Map(rows.map((r) => [r.order_item_id, r.get({ plain: true })]))
  orderPlain.OrderItems = orderPlain.OrderItems.map((item) => ({
    ...item,
    review: byItem.get(item.id) ?? null,
  }))
  return orderPlain
}

/**
 * Đăng đánh giá theo một dòng OrderItem — chỉ khi đơn COMPLETED và người mua là chủ đơn.
 * Mỗi dòng chỉ đánh giá một lần, không cho sửa sau khi gửi.
 */
export const submitBuyerProductReview = async (buyerId, { order_item_id: orderItemId, rating, comment }) => {
  const oid = Number(orderItemId)
  const buyer = Number(buyerId)
  if (!Number.isFinite(oid) || !Number.isFinite(buyer)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Dữ liệu không hợp lệ', 'INVALID_INPUT')
  }
  const stars = Number(rating)
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Số sao từ 1 đến 5', 'INVALID_RATING')
  }

  const line = await OrderItem.findByPk(oid, {
    include: [
      {
        model: Order,
        attributes: ['id', 'user_id', 'status'],
      },
    ],
  })
  if (!line) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm trong đơn', 'ORDER_ITEM_NOT_FOUND')
  }
  const ord = line.Order
  if (!ord || ord.user_id !== buyer) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền đánh giá dòng đơn này', 'FORBIDDEN')
  }
  if (ord.status !== ORDER_STATUS.COMPLETED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Chỉ đánh giá được sau khi đơn hàng đã hoàn tất (đã nhận hàng)',
      'ORDER_NOT_COMPLETED',
    )
  }

  const productId = line.product_id
  const existing = await Review.findOne({ where: { order_item_id: oid } })
  if (existing) {
    if (existing.user_id !== buyer) {
      throw new ApiError(StatusCodes.CONFLICT, 'Dòng đơn đã có đánh giá', 'REVIEW_EXISTS')
    }
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Đánh giá đã được gửi và không thể chỉnh sửa.',
      'REVIEW_IMMUTABLE',
    )
  }

  const trimmed = comment == null ? '' : String(comment).trim()
  const payload = {
    user_id: buyer,
    product_id: productId,
    order_id: ord.id,
    order_item_id: oid,
    rating: stars,
    comment: trimmed === '' ? null : trimmed.slice(0, 2000),
    is_reported: false,
    report_status: 'Pending',
    report_reason: null,
  }

  const created = await Review.create(payload)
  return created.get({ plain: true })
}

export async function getProductRatingBatch(productIds) {
  const ids = [...new Set((productIds || []).map(Number).filter((x) => Number.isFinite(x) && x > 0))]
  if (!ids.length) return new Map()
  const rows = await sequelize.query(
    `
    SELECT r.product_id AS productId,
           AVG(r.rating) AS avgRating,
           COUNT(*) AS cnt
    FROM Reviews r
    WHERE r.product_id IN (:ids)
      AND (r.report_status IS NULL OR r.report_status <> :rejected)
      AND r.rating BETWEEN 1 AND 5
    GROUP BY r.product_id
    `,
    {
      replacements: { ids, rejected: 'Rejected' },
      type: QueryTypes.SELECT,
    },
  )
  const map = new Map()
  for (const row of rows) {
    const pid = Number(row.productId)
    const cnt = Number(row.cnt) || 0
    const avg = row.avgRating != null ? Number(row.avgRating) : null
    map.set(pid, {
      average: avg != null ? Math.round(avg * 10) / 10 : null,
      count: cnt,
    })
  }
  return map
}

/** Trung bình sao của tất cả đánh giá sản phẩm (đã duyệt hiển thị) thuộc shop = seller_id */
export async function getSellerRatingSummary(sellerId) {
  const sid = Number(sellerId)
  if (!Number.isFinite(sid)) {
    return { average: null, count: 0 }
  }
  const [row] = await sequelize.query(
    `
    SELECT AVG(r.rating) AS avgRating, COUNT(*) AS cnt
    FROM Reviews r
    INNER JOIN Products p ON p.id = r.product_id
    WHERE p.seller_id = :sid
      AND (r.report_status IS NULL OR r.report_status <> :rejected)
      AND r.rating BETWEEN 1 AND 5
    `,
    {
      replacements: { sid, rejected: 'Rejected' },
      type: QueryTypes.SELECT,
    },
  )
  if (!row || !row.cnt) {
    return { average: null, count: 0 }
  }
  const avg = row.avgRating != null ? Number(row.avgRating) : null
  return {
    average: avg != null ? Math.round(avg * 10) / 10 : null,
    count: Number(row.cnt) || 0,
  }
}

/** Danh sách đánh giá công khai theo sản phẩm */
export async function listPublicReviewsForProduct(productId, { page = 1, limit = 10 } = {}) {
  const pid = Number(productId)
  if (!Number.isFinite(pid)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID sản phẩm không hợp lệ', 'INVALID_PRODUCT_ID')
  }
  const exists = await Product.findOne({
    where: { id: pid, deleted: false },
    attributes: ['id'],
  })
  if (!exists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm', 'PRODUCT_NOT_FOUND')
  }

  const take = Math.min(Math.max(Number(limit) || 10, 1), 50)
  const offset = (Math.max(Number(page) || 1, 1) - 1) * take

  const { count, rows } = await Review.findAndCountAll({
    where: {
      product_id: pid,
      [Op.or]: [{ report_status: { [Op.ne]: 'Rejected' } }, { report_status: null }],
      rating: { [Op.between]: [1, 5] },
    },
    include: [
      {
        model: User,
        attributes: ['id', 'fullname', 'avatar'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: take,
    offset,
  })

  const reviews = rows.map((r) => {
    const p = r.get({ plain: true })
    return {
      id: p.id,
      rating: p.rating,
      comment: p.comment,
      created_at: p.created_at,
      user: p.User
        ? {
            id: p.User.id,
            fullname: p.User.fullname || '',
            avatar: p.User.avatar || null,
          }
        : null,
    }
  })

  return {
    reviews,
    pagination: {
      total: count,
      page: Math.max(Number(page) || 1, 1),
      limit: take,
      totalPages: Math.ceil(count / take) || 1,
    },
  }
}
