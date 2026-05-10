class ApiError extends Error {
  /**
   * @param {number} statusCode - Mã lỗi HTTP (400, 401, 404, 500...)
   * @param {string} message - Thông báo lỗi
   * @param {string} code - Mã lỗi nội bộ (VD: 'USER_NOT_FOUND', 'DB_ERROR')
   * @param {any} details - Chi tiết lỗi (VD: mảng các trường validation bị sai)
   * @param {boolean} isOperational - True: lỗi dự kiến được, False: lỗi hệ thống
   * @param {string} stack - Stack trace (dùng khi convert từ lỗi khác sang)
   */
  constructor(
    statusCode,
    message,
    code = 'INTERNAL_SERVER_ERROR',
    details = null,
    isOperational = true,
    stack = ''
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = isOperational

    // If a stack trace was provided (e.g. when wrapping another error), use it.
    // Otherwise capture a fresh stack trace but exclude this constructor frame.
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export { ApiError }
export default ApiError
