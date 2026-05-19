import {
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnInvalidAmount,
  IpnOrderNotFound,
  IpnSuccess,
} from 'vnpay'
import { dateFormat } from 'vnpay'
import { StatusCodes } from 'http-status-codes'
import { vnpay } from '../config/vnpay.config'
import { env } from '../config/env'
import ApiError from '../utils/api-error'
import { Order, Payment } from '../models/index'

function assertConfigured() {
  if (!env.VNPAY_TMN_CODE || !env.VNPAY_HASH_SECRET) {
    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      'VNPay chưa được cấu hình (TMN code / Hash secret)',
      'VNPAY_NOT_CONFIGURED',
    )
  }
}

function vnpayGatewayPatchFromVerified(verified) {
  const noRaw = verified.vnp_TransactionNo
  const payRaw = verified.vnp_PayDate
  const no =
    noRaw !== undefined && noRaw !== null && String(noRaw).trim() !== ''
      ? String(noRaw).trim()
      : null
  const d =
    payRaw !== undefined && payRaw !== null && String(payRaw).trim() !== ''
      ? String(payRaw).replace(/\D/g, '').slice(0, 14)
      : null
  return {
    vnpay_transaction_no: no,
    vnpay_transaction_date: d || null,
  }
}

/**
 * Hoàn tiền toàn phần qua VNPay khi người mua hủy đơn (đã thanh toán online thành công).
 * @param {import('sequelize').Model} order
 * @param {import('sequelize').Model} payment
 * @param {string} clientIp
 */
export async function refundFullPaymentForBuyerCancel(
  order,
  payment,
  clientIp = '127.0.0.1',
) {
  assertConfigured()

  if (payment.status !== 'Success') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Thanh toán chưa ghi nhận thành công, không thể hoàn tiền tự động',
      'PAYMENT_NOT_SUCCESS',
    )
  }

  if (payment.refunded_at) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Giao dịch đã được hoàn tiền trước đó',
      'ALREADY_REFUNDED',
    )
  }

  const oid = order.id
  const refundAmount = Math.round(Number(payment.amount))
  const orderTotal = Math.round(Number(order.total_price))
  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Số tiền thanh toán không hợp lệ',
      'INVALID_PAYMENT_AMOUNT',
    )
  }
  if (refundAmount !== orderTotal) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Số tiền đơn và thanh toán không khớp, không hoàn tiền tự động',
      'AMOUNT_MISMATCH',
    )
  }

  const txNo = payment.vnpay_transaction_no
    ? String(payment.vnpay_transaction_no).trim()
    : '0'

  let txDateNum = 0
  if (payment.vnpay_transaction_date) {
    txDateNum = Number(String(payment.vnpay_transaction_date).replace(/\D/g, ''))
  }
  if (!Number.isFinite(txDateNum) || txDateNum <= 0) {
    const created = order.created_at || order.createdAt
    txDateNum = Number(dateFormat(new Date(created), 'yyyyMMddHHmmss'))
  }

  const requestId = `rf-bcn-${oid}-${Date.now()}`
  const createDate = Number(dateFormat(new Date(), 'yyyyMMddHHmmss'))

  let refundResp
  try {
    refundResp = await vnpay.refund({
      vnp_RequestId: requestId,
      vnp_TransactionType: '02',
      vnp_TxnRef: String(oid),
      vnp_TransactionNo: txNo,
      vnp_TransactionDate: txDateNum,
      vnp_CreateBy: 'evomarket-buyer-cancel',
      vnp_CreateDate: createDate,
      vnp_IpAddr: clientIp || '127.0.0.1',
      vnp_OrderInfo: `Hoan tien huy don ${oid}`.slice(0, 255),
      vnp_Amount: refundAmount,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      `Gọi VNPay hoàn tiền thất bại: ${msg}`,
      'VNPAY_REFUND_ERROR',
    )
  }

  if (!refundResp.isVerified || !refundResp.isSuccess) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      refundResp.message || 'VNPay từ chối hoàn tiền',
      'VNPAY_REFUND_DECLINED',
    )
  }
}

export function parseOrderIdFromTxnRef(txnRef) {
  const n = parseInt(txnRef, 10)
  return Number.isFinite(n) ? n : NaN
}

/**
 * Tạo URL chuyển hướng sang cổng VNPay
 * @param {number} buyerId
 * @param {number|string} orderId
 * @param {string} clientIp
 */
export async function createVNPayUrlForBuyer(
  buyerId,
  orderId,
  clientIp = '127.0.0.1',
) {
  assertConfigured()

  const bid = Number(buyerId)
  const oid = Number(orderId)
  if (!Number.isFinite(bid) || !Number.isFinite(oid)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Tham số không hợp lệ',
      'INVALID_PARAMS',
    )
  }

  const order = await Order.findByPk(oid)
  if (!order || order.user_id !== bid) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Không tìm thấy đơn hàng',
      'ORDER_NOT_FOUND',
    )
  }

  if (order.payment_method !== 'Online') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Đơn này không dùng thanh toán trực tuyến',
      'NOT_ONLINE_ORDER',
    )
  }

  if (order.status === 'CANCELLED') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn đã hủy', 'ORDER_CANCELLED')
  }

  const payment = await Payment.findOne({ where: { order_id: oid } })
  if (!payment) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Không tìm thấy bản ghi thanh toán',
      'PAYMENT_NOT_FOUND',
    )
  }
  if (payment.status === 'Success') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Đơn đã thanh toán',
      'ALREADY_PAID',
    )
  }

  const returnUrl = `${env.API_PUBLIC_BASE_URL}/api-v1/payments/vnpay/return`

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: Number(order.total_price),
    vnp_IpAddr: clientIp,
    vnp_TxnRef: String(oid),
    vnp_OrderInfo: `Thanh toan don hang ${oid}`,
    vnp_ReturnUrl: returnUrl,
  })

  return { paymentUrl, orderId: oid }
}

/**
 * Xử lý IPN từ VNPay — trả về object { RspCode, Message } gửi lại cho cổng
 * @param {Record<string, string | string[] | undefined>} query
 */
export async function processVNPayIpn(query) {
  assertConfigured()

  const flat = normalizeQuery(query)

  let verified
  try {
    verified = vnpay.verifyIpnCall(flat)
  } catch {
    return IpnFailChecksum
  }

  if (!verified.isVerified) {
    return IpnFailChecksum
  }

  const orderId = parseOrderIdFromTxnRef(String(verified.vnp_TxnRef ?? ''))
  if (!Number.isFinite(orderId)) {
    return IpnOrderNotFound
  }

  const order = await Order.findByPk(orderId)
  if (!order) {
    return IpnOrderNotFound
  }

  const expectedAmount = Math.round(Number(order.total_price))
  const paidAmount = Math.round(Number(verified.vnp_Amount))
  if (paidAmount !== expectedAmount) {
    return IpnInvalidAmount
  }

  const payment = await Payment.findOne({ where: { order_id: orderId } })
  if (!payment) {
    return IpnOrderNotFound
  }

  if (payment.status === 'Success') {
    return InpOrderAlreadyConfirmed
  }

  if (verified.isSuccess) {
    const gw = vnpayGatewayPatchFromVerified(verified)
    await payment.update({
      status: 'Success',
      ...(gw.vnpay_transaction_no
        ? { vnpay_transaction_no: gw.vnpay_transaction_no }
        : {}),
      ...(gw.vnpay_transaction_date
        ? { vnpay_transaction_date: gw.vnpay_transaction_date }
        : {}),
    })
    return IpnSuccess
  }

  await payment.update({ status: 'Failed' })
  return IpnSuccess
}

function normalizeQuery(query) {
  /** @type {Record<string, string>} */
  const out = {}
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue
    out[k] = Array.isArray(v) ? v[0] : String(v)
  }
  return out
}

export function verifyReturnAndSummarize(query) {
  assertConfigured()
  try {
    const flat = normalizeQuery(query)
    const result = vnpay.verifyReturnUrl(flat)
    const orderId = parseOrderIdFromTxnRef(String(result.vnp_TxnRef ?? ''))
    return { ok: true, orderId, result }
  } catch {
    return { ok: false, orderId: NaN, result: null }
  }
}

/**
 * Đồng bộ trạng thái Payments khi khách quay lại từ VNPay (ReturnUrl).
 * IPN thường không gọi được tới môi trường dev / máy cá nhân — nếu chỉ tin IPN thì DB mãi Pending.
 * Chữ ký + số tiền được kiểm tra giống luồng IPN.
 */
export async function syncPaymentFromVNPayReturnQuery(query) {
  try {
    assertConfigured()
    const flat = normalizeQuery(query)
    const verified = vnpay.verifyReturnUrl(flat)
    if (!verified.isVerified) return

    const orderId = parseOrderIdFromTxnRef(String(verified.vnp_TxnRef ?? ''))
    if (!Number.isFinite(orderId)) return

    const order = await Order.findByPk(orderId)
    if (!order) return

    const expectedAmount = Math.round(Number(order.total_price))
    const paidAmount = Math.round(Number(verified.vnp_Amount))
    if (!Number.isFinite(paidAmount) || paidAmount !== expectedAmount) return

    const payment = await Payment.findOne({ where: { order_id: orderId } })
    if (!payment) return

    if (verified.isSuccess) {
      const gw = vnpayGatewayPatchFromVerified(verified)
      const patch = {
        ...(payment.status !== 'Success' ? { status: 'Success' } : {}),
        ...(gw.vnpay_transaction_no
          ? { vnpay_transaction_no: gw.vnpay_transaction_no }
          : {}),
        ...(gw.vnpay_transaction_date
          ? { vnpay_transaction_date: gw.vnpay_transaction_date }
          : {}),
      }
      if (Object.keys(patch).length) {
        await payment.update(patch)
      }
      return
    }

    if (payment.status === 'Pending') {
      await payment.update({ status: 'Failed' })
    }
  } catch {
    // redirect handler vẫn tự verifyReturnAndSummarize
  }
}
