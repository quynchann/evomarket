import 'dotenv/config'

export const env = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Frontend URL
  BASE_URL_FRONTEND: process.env.BASE_URL_FRONTEND || 'http://localhost:3000',

  // MySQL configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'evo_market',
  DB_DIALECT: process.env.DB_DIALECT || 'mysql',
  DB_PORT: process.env.DB_PORT || 3306,

  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',

  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_ROOT_FOLDER: process.env.CLOUDINARY_ROOT_FOLDER,

  // Public base URL của API (không có /api-v1) — dùng cho VNPay Return URL / IPN đăng ký trên cổng
  API_PUBLIC_BASE_URL: (
    process.env.API_PUBLIC_BASE_URL || 'http://localhost:8080'
  ).replace(/\/$/, ''),

  // VNPay
  VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE || '',
  VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET || '',
  // Đặt false khi chạy production với host VNPay thật
  VNPAY_TEST_MODE: process.env.VNPAY_TEST_MODE !== 'false',
  VNPAY_ENABLE_LOG: process.env.VNPAY_ENABLE_LOG !== 'false',
  // Production gateway host (sandbox khi VNPAY_TEST_MODE=true)
  VNPAY_HOST: (process.env.VNPAY_HOST || 'https://vnpayment.vn').replace(
    /\/$/,
    '',
  ),

  /** Sau khi shop đánh dấu SHIPPED: tự động COMPLETED nếu buyer không xác nhận / trả hàng */
  ORDER_AUTO_COMPLETE_DAYS_AFTER_SHIPPED: Number(
    process.env.ORDER_AUTO_COMPLETE_DAYS_AFTER_SHIPPED || 7,
  ),
}
