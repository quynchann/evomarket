import { VNPay, ignoreLogger } from 'vnpay'
import { env } from './env'

// Sandbox / production tuỳ VNPAY_TEST_MODE
export const vnpayGatewayHost =
  env.VNPAY_TEST_MODE === true ? 'https://sandbox.vnpayment.vn' : env.VNPAY_HOST

export const vnpay = new VNPay({
  // Cấu hình bắt buộc
  tmnCode: env.VNPAY_TMN_CODE,
  secureSecret: env.VNPAY_HASH_SECRET,
  vnpayHost: vnpayGatewayHost,

  // Cấu hình tùy chọn
  testMode: env.VNPAY_TEST_MODE, // Chế độ test
  hashAlgorithm: 'SHA512', // Thuật toán mã hóa
  enableLog: env.VNPAY_ENABLE_LOG, // Bật/tắt log
  loggerFn: ignoreLogger, // Custom logger

  // Custom endpoints
  endpoints: {
    paymentEndpoint: 'paymentv2/vpcpay.html',
    queryDrRefundEndpoint: 'merchant_webapi/api/transaction',
    getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
  },
})
