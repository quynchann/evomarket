import { StatusCodes } from 'http-status-codes'
import { IpnUnknownError } from 'vnpay'
import { env } from '@/config/env.js'
import ApiError from '@/utils/api-error.js'
import {
  createVNPayUrlForBuyer,
  processVNPayIpn,
  syncPaymentFromVNPayReturnQuery,
  verifyReturnAndSummarize,
} from '../services/vnpayPayment.service.js'

function safeClientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length) {
    return xff.split(',')[0].trim()
  }
  return req.socket?.remoteAddress?.replace(/^::ffff:/i, '') || '127.0.0.1'
}

/** POST body: { orderId } — buyer chỉ được tạo URL cho đơn của chính mình */
export const createVNPayUrl = async (req, res, next) => {
  try {
    const orderIdRaw = req.body?.orderId ?? req.body?.order_id
    const orderId = Number(orderIdRaw)
    if (!Number.isFinite(orderId)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Thiếu hoặc sai orderId',
        'INVALID_ORDER_ID',
      )
    }

    const { paymentUrl } = await createVNPayUrlForBuyer(
      req.user.id,
      orderId,
      safeClientIp(req),
    )

    res.status(StatusCodes.OK).json({
      success: true,
      data: { paymentUrl },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * VNPay gọi IPN — phản hồi JSON UTF-8, không chứa BOM
 */
export const vnpayIpn = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  try {
    const querySource =
      req.method === 'GET' ? req.query : { ...req.query, ...req.body }
    const payload = await processVNPayIpn(querySource)
    res.status(200).end(JSON.stringify(payload))
  } catch {
    res.status(200).end(JSON.stringify(IpnUnknownError))
  }
}

/** Trình duyệt khách redirect về đây — chuyển tiếp lên SPA */
export const vnpayReturn = async (req, res) => {
  const base = env.BASE_URL_FRONTEND.replace(/\/$/, '')
  try {
    await syncPaymentFromVNPayReturnQuery(req.query)
    const { ok, orderId, result } = verifyReturnAndSummarize(req.query)
    if (!ok || !Number.isFinite(orderId)) {
      return res.redirect(302, `${base}/customer/orders?vnpay=invalid`)
    }

    const paid = !!(result?.isVerified && result.isSuccess)
    const qs = new URLSearchParams({
      from: 'vnpay',
      paid: paid ? '1' : '0',
    })
    if (result?.vnp_ResponseCode != null) {
      qs.set('code', String(result.vnp_ResponseCode))
    }

    const msg =
      typeof result.message === 'string' ? result.message.slice(0, 180) : ''
    if (msg) qs.set('msg', msg)

    return res.redirect(
      302,
      `${base}/customer/order-success/${orderId}?${qs.toString()}`,
    )
  } catch {
    return res.redirect(302, `${base}/customer/orders?vnpay=error`)
  }
}
