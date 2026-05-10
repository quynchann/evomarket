import { StatusCodes } from 'http-status-codes'
import ApiError from '@/utils/api-error.js'

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded', 'NO_FILE')
    }

    const fileUrl = `/uploads/products/${req.file.filename}`

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    })
  } catch (err) {
    next(err)
  }
}
