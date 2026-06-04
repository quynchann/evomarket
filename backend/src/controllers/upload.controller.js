import { StatusCodes } from 'http-status-codes'
import ApiError from '@/utils/api-error.js'
import * as authService from '@/services/auth.service.js'
import * as productMediaService from '@/services/productMedia.service.js'
import * as cloudinaryUpload from '@/services/cloudinaryUpload.service.js'

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded', 'NO_FILE')
    }

    const productId = req.query.productId
      ? Number(req.query.productId)
      : null

    const data = await productMediaService.uploadProductImageForSeller(
      req.user.id,
      req.file,
      Number.isFinite(productId) ? productId : null,
    )

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        url: data.url,
        publicId: data.publicId,
        product: data.product,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const uploadProductTryonModel = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded', 'NO_FILE')
    }

    const productId = req.query.productId
      ? Number(req.query.productId)
      : null

    const data = await productMediaService.uploadTryonModelForSeller(
      req.user.id,
      req.file,
      {
        productId: Number.isFinite(productId) ? productId : null,
        anchor_index: req.body.anchor_index,
        transform_config: req.body.transform_config,
      },
    )

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        url: data.url,
        publicId: data.publicId,
        instance: data.instance,
      },
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

    const uploaded = await cloudinaryUpload.uploadAvatar(req.file, {
      userId: req.user.id,
    })

    const user = await authService.updateAvatar(req.user.id, uploaded.url)

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user,
        url: uploaded.url,
        publicId: uploaded.publicId,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const uploadChatImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded', 'NO_FILE')
    }

    const conversationId = req.query.conversationId || req.body.conversationId

    const uploaded = await cloudinaryUpload.uploadChatImage(req.file, {
      userId: req.user.id,
      conversationId,
    })

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        url: uploaded.url,
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded', 'NO_FILE')
    }

    const subfolder = req.query.folder || req.body.folder

    const uploaded = await cloudinaryUpload.uploadGenericFile(req.file, {
      userId: req.user.id,
      subfolder,
    })

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        url: uploaded.url,
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
        format: uploaded.format,
        bytes: uploaded.bytes,
        originalName: req.file.originalname,
      },
    })
  } catch (err) {
    next(err)
  }
}
