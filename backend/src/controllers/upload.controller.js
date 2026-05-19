import { StatusCodes } from 'http-status-codes'
import ApiError from '@/utils/api-error.js'
import * as authService from '@/services/auth.service.js'

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

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded', 'NO_FILE')
    }

    const fileUrl = `/uploads/avatars/${req.file.filename}`
    const user = await authService.updateAvatar(req.user.id, fileUrl)

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user,
        url: fileUrl
      }
    })
  } catch (err) {
    next(err)
  }
}
