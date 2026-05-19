import { Coupon, CouponRedemption, Order, User, sequelize } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'
import { QueryTypes, Op } from 'sequelize'

const toBuyerId = (userId) => {
  const n = Number(userId)
  return Number.isFinite(n) ? n : NaN
}

/** Mã dạng WELCOME / WELCOME10 — coi là ưu đãi người mới kể cả khi DB chưa bật new_user_only. */
const isWelcomeStyleNewUserCode = (code) => /^WELCOME\d*$/i.test(String(code ?? '').trim())

/** Ưu đãi chỉ cho khách chưa/đang đơn đầu (cờ DB hoặc convention mã WELCOME*). */
const couponTreatAsNewUserOffer = (plain) => {
  const raw = plain.new_user_only
  const fromDb = raw === true || raw === 1 || raw === '1'
  return fromDb || isWelcomeStyleNewUserCode(plain.code)
}

const withinSchedule = (coupon, now) => {
  if (coupon.start_date && now < new Date(coupon.start_date)) return false
  if (coupon.end_date && now > new Date(coupon.end_date)) return false
  return true
}

const computeDiscountAmount = (coupon, orderSubtotal) => {
  const subtotal = Math.floor(Number(orderSubtotal) || 0)
  const minOrder = Math.floor(Number(coupon.min_order_value) || 0)
  if (subtotal < minOrder) {
    return 0
  }
  const val = Number(coupon.discount_value) || 0
  let off = 0
  if (coupon.discount_type === 'Percentage') {
    off = Math.floor((subtotal * val) / 100)
  } else {
    off = Math.floor(val)
  }
  return Math.min(off, subtotal)
}

const buildListTitle = (coupon) => {
  const val = Number(coupon.discount_value) || 0
  if (coupon.discount_type === 'Percentage') {
    return `Giảm ${val}% cho đơn từ ${Math.floor(Number(coupon.min_order_value) || 0).toLocaleString('vi-VN')}đ`
  }
  return `Giảm ${Math.floor(val).toLocaleString('vi-VN')}đ cho đơn từ ${Math.floor(Number(coupon.min_order_value) || 0).toLocaleString('vi-VN')}đ`
}

export const toPlatformVoucherDto = (coupon) => {
  const maxDiscount =
    coupon.discount_type === 'Percentage'
      ? Number.MAX_SAFE_INTEGER
      : Math.floor(Number(coupon.discount_value) || 0)

  return {
    id: String(coupon.id),
    code: coupon.code,
    title: buildListTitle(coupon),
    description: coupon.new_user_only
      ? 'Ưu đãi dành cho khách hàng mới — mỗi tài khoản chỉ dùng một lần'
      : 'Voucher sàn EvoMarket — mỗi tài khoản chỉ dùng một lần cho mã này',
    discount: Number(coupon.discount_value) || 0,
    minOrder: Math.floor(Number(coupon.min_order_value) || 0),
    maxDiscount,
    expiry: coupon.end_date ? new Date(coupon.end_date).toISOString().slice(0, 10) : null,
    startDate: coupon.start_date ? new Date(coupon.start_date).toISOString().slice(0, 10) : null,
    type: coupon.discount_type === 'Percentage' ? 'percentage' : 'fixed',
    newUserOnly: !!coupon.new_user_only,
    quantity: coupon.max_uses != null ? Math.max(0, coupon.max_uses - coupon.used_count) : null,
  }
}

/** DTO voucher shop (cùng shape FE với sàn) */
export const toShopVoucherDto = (coupon) => {
  const base = toPlatformVoucherDto(coupon)
  return {
    ...base,
    shopId: coupon.seller_id != null ? Number(coupon.seller_id) : null,
    description:
      coupon.new_user_only
        ? 'Ưu đãi shop — dành cho khách mới (mỗi tài khoản một lần cho mã này)'
        : 'Voucher shop — áp dụng cho sản phẩm của shop; mỗi tài khoản chỉ dùng một lần cho mã này',
  }
}

/**
 * User đã từng đổi bất kỳ mã new_user_only nào (một lần cho cả nhóm ưu đãi người mới).
 * Dùng SQL tham số hóa — tránh lỗi Sequelize count + JOIN.
 */
export const userHasRedeemedAnyNewUserCoupon = async (userId, { transaction } = {}) => {
  const buyerId = toBuyerId(userId)
  if (!Number.isFinite(buyerId)) return false

  const rows = await sequelize.query(
    `SELECT cr.id AS id
     FROM CouponRedemptions AS cr
     INNER JOIN Coupons AS c ON c.id = cr.coupon_id
     WHERE cr.user_id = :buyerId
       AND (
         c.new_user_only = 1
         OR UPPER(TRIM(c.code)) REGEXP '^WELCOME[0-9]*$'
       )
     LIMIT 1`,
    { replacements: { buyerId }, type: QueryTypes.SELECT, transaction },
  )
  return Array.isArray(rows) && rows.length > 0
}

/**
 * Danh sách mã sàn khả dụng với buyer: còn hạn, còn lượt toàn sàn, user chưa dùng, đủ điều kiện new-user
 */
export const listPlatformCouponsForBuyer = async (userId) => {
  const buyerId = toBuyerId(userId)
  if (!Number.isFinite(buyerId)) {
    return []
  }

  const now = new Date()
  const [orderCount, coupons, redemptions, hasUsedNewUserOffer] = await Promise.all([
    Order.count({ where: { user_id: buyerId } }),
    Coupon.findAll({ order: [['id', 'ASC']] }),
    CouponRedemption.findAll({
      where: { user_id: buyerId },
      attributes: ['coupon_id'],
    }),
    userHasRedeemedAnyNewUserCoupon(buyerId),
  ])

  const usedCouponIds = new Set(redemptions.map((r) => r.coupon_id))

  const out = []
  for (const c of coupons) {
    const plain = c.get ? c.get({ plain: true }) : c
    if (plain.seller_id != null && plain.seller_id !== '') {
      continue
    }
    const treatAsNewUser = couponTreatAsNewUserOffer(plain)
    if (!withinSchedule(plain, now)) continue
    if (plain.max_uses != null && plain.used_count >= plain.max_uses) continue
    if (usedCouponIds.has(plain.id)) continue
    if (treatAsNewUser && (orderCount > 0 || hasUsedNewUserOffer)) continue
    out.push(toPlatformVoucherDto({ ...plain, new_user_only: treatAsNewUser }))
  }
  return out
}

/**
 * Mã shop của một seller (cùng luật lọc với mã sàn, chỉ khác filter seller_id)
 */
export const listShopCouponsForBuyer = async (userId, shopSellerId) => {
  const buyerId = toBuyerId(userId)
  const sid = Number(shopSellerId)
  if (!Number.isFinite(buyerId) || !Number.isFinite(sid)) {
    return []
  }

  const now = new Date()
  const [orderCount, coupons, redemptions, hasUsedNewUserOffer] = await Promise.all([
    Order.count({ where: { user_id: buyerId } }),
    Coupon.findAll({ order: [['id', 'ASC']] }),
    CouponRedemption.findAll({
      where: { user_id: buyerId },
      attributes: ['coupon_id'],
    }),
    userHasRedeemedAnyNewUserCoupon(buyerId),
  ])

  const usedCouponIds = new Set(redemptions.map((r) => r.coupon_id))

  const out = []
  for (const c of coupons) {
    const plain = c.get ? c.get({ plain: true }) : c
    if (plain.seller_id == null || plain.seller_id === '') continue
    if (Number(plain.seller_id) !== sid) continue
    const treatAsNewUser = couponTreatAsNewUserOffer(plain)
    if (!withinSchedule(plain, now)) continue
    if (plain.max_uses != null && plain.used_count >= plain.max_uses) continue
    if (usedCouponIds.has(plain.id)) continue
    if (treatAsNewUser && (orderCount > 0 || hasUsedNewUserOffer)) continue
    out.push(toShopVoucherDto({ ...plain, new_user_only: treatAsNewUser }))
  }
  return out
}

/**
 * Khóa dòng coupon, kiểm tra và trả về số tiền giảm (trong transaction đặt hàng)
 * scope: 'platform' (mã sàn) | 'shop' (mã shop — cần shopSellerId khớp tổng tiền dòng của shop)
 */
export const lockValidateCouponForOrder = async ({
  transaction,
  userId,
  couponCode,
  orderSubtotal,
  scope = 'platform',
  shopSellerId = null,
} = {}) => {
  const buyerId = toBuyerId(userId)
  const raw = couponCode != null ? String(couponCode).trim() : ''
  if (!raw) {
    return { coupon: null, discountAmount: 0 }
  }

  if (!Number.isFinite(buyerId)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Không xác định được tài khoản để áp dụng mã',
      'INVALID_BUYER',
    )
  }

  const normalized = raw.toUpperCase()
  const coupon = await Coupon.findOne({
    where: sequelize.where(sequelize.fn('UPPER', sequelize.col('code')), normalized),
    transaction,
    lock: transaction.LOCK.UPDATE,
  })

  if (!coupon) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Mã giảm giá không hợp lệ',
      'INVALID_COUPON',
    )
  }

  const couponPlain = coupon.get({ plain: true })

  const sellerIdOnCoupon = couponPlain.seller_id
  if (scope === 'platform') {
    if (sellerIdOnCoupon != null && sellerIdOnCoupon !== '') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Đây là mã shop — không áp dụng cho toàn đơn',
        'COUPON_NOT_PLATFORM',
      )
    }
  } else if (scope === 'shop') {
    const wantSid = Number(shopSellerId)
    if (!Number.isFinite(wantSid)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu shop cho mã shop', 'SHOP_COUPON_INVALID')
    }
    if (
      sellerIdOnCoupon == null ||
      sellerIdOnCoupon === '' ||
      Number(sellerIdOnCoupon) !== wantSid
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Mã không khớp shop hoặc không phải voucher shop',
        'COUPON_SHOP_MISMATCH',
      )
    }
  }

  const treatAsNewUser = couponTreatAsNewUserOffer(couponPlain)

  const now = new Date()
  if (!withinSchedule(coupon, now)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Mã giảm giá đã hết hạn hoặc chưa đến thời gian áp dụng',
      'COUPON_EXPIRED',
    )
  }

  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Mã giảm giá đã hết lượt sử dụng',
      'COUPON_EXHAUSTED',
    )
  }

  if (treatAsNewUser) {
    await User.findByPk(buyerId, { transaction, lock: transaction.LOCK.UPDATE })
  }

  const orderCount = await Order.count({
    where: { user_id: buyerId },
    transaction,
  })
  if (treatAsNewUser && orderCount > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Mã này chỉ dành cho đơn hàng đầu tiên của khách hàng mới',
      'COUPON_NEW_USER_ONLY',
    )
  }

  if (treatAsNewUser) {
    const usedNewUserBefore = await userHasRedeemedAnyNewUserCoupon(buyerId, { transaction })
    if (usedNewUserBefore) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Bạn đã sử dụng ưu đãi dành cho khách hàng mới — mỗi tài khoản chỉ được dùng một lần',
        'COUPON_NEW_USER_ALREADY_USED',
      )
    }
  }

  const already = await CouponRedemption.findOne({
    where: { user_id: buyerId, coupon_id: coupon.id },
    transaction,
  })
  if (already) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Bạn đã sử dụng mã này rồi — mỗi tài khoản chỉ được dùng một lần',
      'COUPON_ALREADY_USED',
    )
  }

  const discountAmount = computeDiscountAmount(coupon, orderSubtotal)
  if (discountAmount <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này',
      'COUPON_MIN_ORDER',
    )
  }

  return { coupon, discountAmount }
}

// --- Quản lý mã shop (seller) ---

const normalizeDiscountType = (v) => {
  const s = String(v ?? '').trim()
  if (s === 'Percentage' || s.toLowerCase() === 'percentage' || s === 'percent') return 'Percentage'
  if (s === 'Fixed' || s.toLowerCase() === 'fixed') return 'Fixed'
  return null
}

const parseOptionalDate = (v) => {
  if (v == null || v === '') return null
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Ngày không hợp lệ', 'INVALID_DATE')
  }
  return d
}

const sellerCouponStatus = (plain, now = new Date()) => {
  const u = now.getTime()
  if (plain.max_uses != null && Number(plain.used_count) >= Number(plain.max_uses)) {
    return 'exhausted'
  }
  if (plain.end_date && u > new Date(plain.end_date).getTime()) return 'expired'
  if (plain.start_date && u < new Date(plain.start_date).getTime()) return 'scheduled'
  return 'active'
}

const toSellerManagementDto = (coupon) => {
  const plain = coupon.get ? coupon.get({ plain: true }) : coupon
  const now = new Date()
  const status = sellerCouponStatus(plain, now)
  const dv = Number(plain.discount_value) || 0
  const min = Math.floor(Number(plain.min_order_value) || 0)
  const used = Number(plain.used_count) || 0
  const maxU = plain.max_uses != null ? Number(plain.max_uses) : null

  return {
    id: plain.id,
    code: plain.code,
    discountType: plain.discount_type,
    discountValue: dv,
    minOrderValue: min,
    maxUses: maxU,
    usedCount: used,
    remainingUses: maxU != null ? Math.max(0, maxU - used) : null,
    startDate: plain.start_date ? new Date(plain.start_date).toISOString() : null,
    endDate: plain.end_date ? new Date(plain.end_date).toISOString() : null,
    newUserOnly: !!plain.new_user_only,
    sellerId: plain.seller_id != null ? Number(plain.seller_id) : null,
    status,
    title: buildListTitle(plain),
  }
}

/**
 * Danh sách mã của shop (seller), gồm cả hết hạn / chưa hiệu lực — dùng trang quản lý
 */
export const listSellerShopCoupons = async (sellerUserId) => {
  const sid = Number(sellerUserId)
  if (!Number.isFinite(sid)) return []

  const rows = await Coupon.findAll({
    where: { seller_id: sid },
    order: [['id', 'DESC']],
  })
  return rows.map((c) => toSellerManagementDto(c))
}

export const createSellerShopCoupon = async (sellerUserId, body = {}) => {
  const sid = Number(sellerUserId)
  if (!Number.isFinite(sid)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không xác định được shop', 'INVALID_SELLER')
  }

  const rawCode = String(body.code ?? '').trim().toUpperCase()
  if (!rawCode || rawCode.length > 50) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Mã voucher bắt buộc, tối đa 50 ký tự',
      'INVALID_CODE',
    )
  }
  if (!/^[A-Z0-9_-]+$/.test(rawCode)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Mã chỉ gồm chữ in hoa, số, gạch dưới hoặc gạch ngang',
      'INVALID_CODE_FORMAT',
    )
  }

  const discountType = normalizeDiscountType(body.discount_type ?? body.discountType)
  if (!discountType) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Loại giảm không hợp lệ (Percentage hoặc Fixed)',
      'INVALID_DISCOUNT_TYPE',
    )
  }

  const discountValue = Number(body.discount_value ?? body.discountValue)
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Giá trị giảm phải là số dương', 'INVALID_DISCOUNT')
  }
  if (discountType === 'Percentage' && discountValue > 100) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Phần trăm giảm không được vượt quá 100', 'INVALID_DISCOUNT')
  }

  const minOrder = Math.floor(Number(body.min_order_value ?? body.minOrderValue ?? 0))
  if (!Number.isFinite(minOrder) || minOrder < 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Giá trị đơn tối thiểu không hợp lệ', 'INVALID_MIN_ORDER')
  }

  let maxUses = body.max_uses ?? body.maxUses
  if (maxUses === '' || maxUses === undefined || maxUses === null) {
    maxUses = null
  } else {
    maxUses = Number(maxUses)
    if (!Number.isInteger(maxUses) || maxUses < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tổng lượt dùng phải là số nguyên ≥ 1 hoặc để trống', 'INVALID_MAX_USES')
    }
  }

  const startDate = parseOptionalDate(body.start_date ?? body.startDate)
  const endDate = parseOptionalDate(body.end_date ?? body.endDate)
  if (startDate && endDate && endDate < startDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Ngày kết thúc phải sau ngày bắt đầu',
      'INVALID_DATE_RANGE',
    )
  }

  const newUserOnly = !!(body.new_user_only ?? body.newUserOnly)

  const dup = await Coupon.findOne({
    where: sequelize.where(sequelize.fn('UPPER', sequelize.col('code')), rawCode),
  })
  if (dup) {
    throw new ApiError(StatusCodes.CONFLICT, 'Mã này đã tồn tại trên hệ thống', 'COUPON_CODE_EXISTS')
  }

  const row = await Coupon.create({
    code: rawCode,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_value: minOrder,
    max_uses: maxUses,
    used_count: 0,
    start_date: startDate,
    end_date: endDate,
    new_user_only: newUserOnly,
    seller_id: sid,
  })

  return toSellerManagementDto(row)
}

export const updateSellerShopCoupon = async (sellerUserId, couponId, body = {}) => {
  const sid = Number(sellerUserId)
  const id = Number(couponId)
  if (!Number.isFinite(sid) || !Number.isFinite(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tham số không hợp lệ', 'INVALID_PARAMS')
  }

  const coupon = await Coupon.findByPk(id)
  if (!coupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy mã giảm giá', 'COUPON_NOT_FOUND')
  }
  const plain = coupon.get({ plain: true })
  if (plain.seller_id == null || Number(plain.seller_id) !== sid) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền sửa mã này', 'FORBIDDEN')
  }

  if (body.discount_type != null || body.discountType != null) {
    const dt = normalizeDiscountType(body.discount_type ?? body.discountType)
    if (!dt) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Loại giảm không hợp lệ (Percentage hoặc Fixed)',
        'INVALID_DISCOUNT_TYPE',
      )
    }
    coupon.discount_type = dt
  }

  if (body.discount_value != null || body.discountValue !== undefined) {
    const dv = Number(body.discount_value ?? body.discountValue)
    if (!Number.isFinite(dv) || dv <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Giá trị giảm phải là số dương', 'INVALID_DISCOUNT')
    }
    const effType = coupon.discount_type
    if (effType === 'Percentage' && dv > 100) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Phần trăm giảm không được vượt quá 100', 'INVALID_DISCOUNT')
    }
    coupon.discount_value = dv
  }

  if (body.min_order_value != null || body.minOrderValue !== undefined) {
    const mo = Math.floor(Number(body.min_order_value ?? body.minOrderValue))
    if (!Number.isFinite(mo) || mo < 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Giá trị đơn tối thiểu không hợp lệ', 'INVALID_MIN_ORDER')
    }
    coupon.min_order_value = mo
  }

  if (body.max_uses !== undefined || body.maxUses !== undefined) {
    let maxUses = body.max_uses ?? body.maxUses
    const used = Number(coupon.used_count) || 0
    if (maxUses === '' || maxUses === null) {
      coupon.max_uses = null
    } else {
      maxUses = Number(maxUses)
      if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses < used) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Tổng lượt dùng phải là số nguyên ≥ 1 và không nhỏ hơn số lượt đã dùng',
          'INVALID_MAX_USES',
        )
      }
      coupon.max_uses = maxUses
    }
  }

  if (body.start_date !== undefined || body.startDate !== undefined) {
    const v = body.start_date ?? body.startDate
    coupon.start_date = v == null || v === '' ? null : parseOptionalDate(v)
  }
  if (body.end_date !== undefined || body.endDate !== undefined) {
    const v = body.end_date ?? body.endDate
    coupon.end_date = v == null || v === '' ? null : parseOptionalDate(v)
  }

  if (body.new_user_only !== undefined || body.newUserOnly !== undefined) {
    coupon.new_user_only = !!(body.new_user_only ?? body.newUserOnly)
  }

  const s = coupon.start_date ? new Date(coupon.start_date) : null
  const e = coupon.end_date ? new Date(coupon.end_date) : null
  if (s && e && e < s) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Ngày kết thúc phải sau ngày bắt đầu',
      'INVALID_DATE_RANGE',
    )
  }

  await coupon.save()
  return toSellerManagementDto(coupon)
}

export const deleteSellerShopCoupon = async (sellerUserId, couponId) => {
  const sid = Number(sellerUserId)
  const id = Number(couponId)
  if (!Number.isFinite(sid) || !Number.isFinite(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tham số không hợp lệ', 'INVALID_PARAMS')
  }

  const coupon = await Coupon.findByPk(id)
  if (!coupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy mã giảm giá', 'COUPON_NOT_FOUND')
  }
  const plain = coupon.get({ plain: true })
  if (plain.seller_id == null || Number(plain.seller_id) !== sid) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền xóa mã này', 'FORBIDDEN')
  }
  const used = Number(coupon.used_count) || 0
  if (used > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Không thể xóa mã đã có lượt sử dụng — hãy đặt ngày kết thúc trong quá khứ để vô hiệu hóa',
      'COUPON_HAS_USAGE',
    )
  }

  await coupon.destroy()
}

// --- Mã sàn (admin) — seller_id = NULL ---

export const listPlatformCouponsForAdmin = async () => {
  const rows = await Coupon.findAll({
    where: { seller_id: { [Op.is]: null } },
    order: [['id', 'DESC']],
  })
  return rows.map((c) => toSellerManagementDto(c))
}

export const createPlatformCoupon = async (body = {}) => {
  const rawCode = String(body.code ?? '').trim().toUpperCase()
  if (!rawCode || rawCode.length > 50) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Mã voucher bắt buộc, tối đa 50 ký tự',
      'INVALID_CODE',
    )
  }
  if (!/^[A-Z0-9_-]+$/.test(rawCode)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Mã chỉ gồm chữ in hoa, số, gạch dưới hoặc gạch ngang',
      'INVALID_CODE_FORMAT',
    )
  }

  const discountType = normalizeDiscountType(body.discount_type ?? body.discountType)
  if (!discountType) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Loại giảm không hợp lệ (Percentage hoặc Fixed)',
      'INVALID_DISCOUNT_TYPE',
    )
  }

  const discountValue = Number(body.discount_value ?? body.discountValue)
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Giá trị giảm phải là số dương', 'INVALID_DISCOUNT')
  }
  if (discountType === 'Percentage' && discountValue > 100) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Phần trăm giảm không được vượt quá 100', 'INVALID_DISCOUNT')
  }

  const minOrder = Math.floor(Number(body.min_order_value ?? body.minOrderValue ?? 0))
  if (!Number.isFinite(minOrder) || minOrder < 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Giá trị đơn tối thiểu không hợp lệ', 'INVALID_MIN_ORDER')
  }

  let maxUses = body.max_uses ?? body.maxUses
  if (maxUses === '' || maxUses === undefined || maxUses === null) {
    maxUses = null
  } else {
    maxUses = Number(maxUses)
    if (!Number.isInteger(maxUses) || maxUses < 1) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Tổng lượt dùng phải là số nguyên ≥ 1 hoặc để trống',
        'INVALID_MAX_USES',
      )
    }
  }

  const startDate = parseOptionalDate(body.start_date ?? body.startDate)
  const endDate = parseOptionalDate(body.end_date ?? body.endDate)
  if (startDate && endDate && endDate < startDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Ngày kết thúc phải sau ngày bắt đầu',
      'INVALID_DATE_RANGE',
    )
  }

  const newUserOnly = !!(body.new_user_only ?? body.newUserOnly)

  const dup = await Coupon.findOne({
    where: sequelize.where(sequelize.fn('UPPER', sequelize.col('code')), rawCode),
  })
  if (dup) {
    throw new ApiError(StatusCodes.CONFLICT, 'Mã này đã tồn tại trên hệ thống', 'COUPON_CODE_EXISTS')
  }

  const row = await Coupon.create({
    code: rawCode,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_value: minOrder,
    max_uses: maxUses,
    used_count: 0,
    start_date: startDate,
    end_date: endDate,
    new_user_only: newUserOnly,
    seller_id: null,
  })

  return toSellerManagementDto(row)
}

export const updatePlatformCoupon = async (couponId, body = {}) => {
  const id = Number(couponId)
  if (!Number.isFinite(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tham số không hợp lệ', 'INVALID_PARAMS')
  }

  const coupon = await Coupon.findByPk(id)
  if (!coupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy mã giảm giá', 'COUPON_NOT_FOUND')
  }
  const plain = coupon.get({ plain: true })
  if (plain.seller_id != null && plain.seller_id !== '') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Đây không phải mã sàn', 'FORBIDDEN')
  }

  if (body.discount_type != null || body.discountType != null) {
    const dt = normalizeDiscountType(body.discount_type ?? body.discountType)
    if (!dt) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Loại giảm không hợp lệ (Percentage hoặc Fixed)',
        'INVALID_DISCOUNT_TYPE',
      )
    }
    coupon.discount_type = dt
  }

  if (body.discount_value != null || body.discountValue !== undefined) {
    const dv = Number(body.discount_value ?? body.discountValue)
    if (!Number.isFinite(dv) || dv <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Giá trị giảm phải là số dương', 'INVALID_DISCOUNT')
    }
    const effType = coupon.discount_type
    if (effType === 'Percentage' && dv > 100) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Phần trăm giảm không được vượt quá 100', 'INVALID_DISCOUNT')
    }
    coupon.discount_value = dv
  }

  if (body.min_order_value != null || body.minOrderValue !== undefined) {
    const mo = Math.floor(Number(body.min_order_value ?? body.minOrderValue))
    if (!Number.isFinite(mo) || mo < 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Giá trị đơn tối thiểu không hợp lệ', 'INVALID_MIN_ORDER')
    }
    coupon.min_order_value = mo
  }

  if (body.max_uses !== undefined || body.maxUses !== undefined) {
    let maxUses = body.max_uses ?? body.maxUses
    const used = Number(coupon.used_count) || 0
    if (maxUses === '' || maxUses === null) {
      coupon.max_uses = null
    } else {
      maxUses = Number(maxUses)
      if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses < used) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Tổng lượt dùng phải là số nguyên ≥ 1 và không nhỏ hơn số lượt đã dùng',
          'INVALID_MAX_USES',
        )
      }
      coupon.max_uses = maxUses
    }
  }

  if (body.start_date !== undefined || body.startDate !== undefined) {
    const v = body.start_date ?? body.startDate
    coupon.start_date = v == null || v === '' ? null : parseOptionalDate(v)
  }
  if (body.end_date !== undefined || body.endDate !== undefined) {
    const v = body.end_date ?? body.endDate
    coupon.end_date = v == null || v === '' ? null : parseOptionalDate(v)
  }

  if (body.new_user_only !== undefined || body.newUserOnly !== undefined) {
    coupon.new_user_only = !!(body.new_user_only ?? body.newUserOnly)
  }

  const s = coupon.start_date ? new Date(coupon.start_date) : null
  const e = coupon.end_date ? new Date(coupon.end_date) : null
  if (s && e && e < s) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Ngày kết thúc phải sau ngày bắt đầu',
      'INVALID_DATE_RANGE',
    )
  }

  await coupon.save()
  return toSellerManagementDto(coupon)
}

export const deletePlatformCoupon = async (couponId) => {
  const id = Number(couponId)
  if (!Number.isFinite(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tham số không hợp lệ', 'INVALID_PARAMS')
  }

  const coupon = await Coupon.findByPk(id)
  if (!coupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy mã giảm giá', 'COUPON_NOT_FOUND')
  }
  const plain = coupon.get({ plain: true })
  if (plain.seller_id != null && plain.seller_id !== '') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Đây không phải mã sàn', 'FORBIDDEN')
  }
  const used = Number(coupon.used_count) || 0
  if (used > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Không thể xóa mã đã có lượt sử dụng — hãy đặt ngày kết thúc trong quá khứ để vô hiệu hóa',
      'COUPON_HAS_USAGE',
    )
  }

  await coupon.destroy()
}
