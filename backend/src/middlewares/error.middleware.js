import { BaseError as SequelizeBaseError } from 'sequelize'
import ApiError from '@/utils/api-error'
import { StatusCodes } from 'http-status-codes'
import { env } from '@/config'

/**
 * Middleware to convert any error to an instance of ApiError.
 */
export const errorConverter = (err, req, res, next) => {
  let error = err

  // 1. Kiểm tra xem lỗi có phải là Instance của ApiError không
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    let message = error.message || 'Internal Server Error'

    // 2. Xử lý riêng cho Sequelize errors
    if (error instanceof SequelizeBaseError) {
      statusCode = StatusCodes.BAD_REQUEST

      // Lấy message chi tiết từ Sequelize (nếu có)
      if (error.errors && error.errors.length > 0) {
        message = error.errors.map((e) => e.message).join(', ')
      }
    }

    // 3. Tạo ApiError mới nhưng GIỮ LẠI STACK TRACE CŨ
    error = new ApiError(
      statusCode,
      message,
      'INTERNAL_SERVER_ERROR',
      null,
      false,
      err.stack
    )
  }

  next(error)
}

/**
 * Middleware to handle errors and send standardized responses.
 */
export const errorHandler = (err, req, res, next) => {
  let { statusCode, message, code, details } = err

  if (env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    message = 'Internal Server Error'
  }

  const response = {
    success: false,
    error: {
      code,
      message,
      statusCode,
      details
    }
  }

  if (env.NODE_ENV === 'development') {
    response.error.stack = err.stack
  }

  res.status(statusCode).json(response)
}
