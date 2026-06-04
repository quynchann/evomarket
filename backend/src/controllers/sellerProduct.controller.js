import { StatusCodes } from 'http-status-codes'
import * as sellerProductService from '../services/sellerProduct.service.js'

/** Map payload AR từ ProductForm sang tryonInstance */
const mapArSettingsToTryon = (arSettings) => {
  if (!arSettings?.enabled || !arSettings?.modelUrl) return null
  const hasPos =
    arSettings.positionX != null ||
    arSettings.positionY != null ||
    arSettings.positionZ != null
  const transform_config = {
    type: arSettings.type || arSettings.tryOnType,
    position: hasPos
      ? {
          x: Number(arSettings.positionX) || 0,
          y: Number(arSettings.positionY) || 0,
          z: Number(arSettings.positionZ) || 0,
        }
      : { x: 0, y: 0, z: 0 },
    rotation: {
      x: Number(arSettings.rotationX) || 0,
      y: Number(arSettings.rotationY) || 0,
      z: Number(arSettings.rotationZ) || 0,
    },
    scale: {
      x: Number(arSettings.scaleX ?? arSettings.scale) || 1,
      y: Number(arSettings.scaleY ?? arSettings.scale) || 1,
      z: Number(arSettings.scaleZ ?? arSettings.scale) || 1,
    },
  }
  return {
    modelUrl: arSettings.modelUrl,
    type: transform_config.type,
    transform_config,
  }
}

export const listCategories = async (req, res, next) => {
  try {
    const categories = await sellerProductService.listCategories()
    res.status(StatusCodes.OK).json({
      success: true,
      data: { categories },
    })
  } catch (err) {
    next(err)
  }
}

export const listProducts = async (req, res, next) => {
  try {
    const products = await sellerProductService.listProducts(req.user.id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: { products },
    })
  } catch (err) {
    next(err)
  }
}

export const getProduct = async (req, res, next) => {
  try {
    const productId = Number(req.params.id)
    const product = await sellerProductService.getProductForSeller(
      req.user.id,
      productId,
    )
    res.status(StatusCodes.OK).json({
      success: true,
      data: { product },
    })
  } catch (err) {
    next(err)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    const {
      categoryId,
      title,
      price,
      importPrice,
      stock,
      thumbnail,
      images,
      description,
      status,
      tryonInstance,
      arSettings,
    } = req.body

    const product = await sellerProductService.createProduct(req.user.id, {
      categoryId: Number(categoryId),
      title,
      price,
      importPrice,
      totalStock: stock,
      thumbnail,
      images,
      description,
      status: status || 'active',
      tryonInstance: tryonInstance || mapArSettingsToTryon(arSettings),
    })

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: { product },
    })
  } catch (err) {
    next(err)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const productId = Number(req.params.id)
    const {
      categoryId,
      title,
      price,
      importPrice,
      stock,
      thumbnail,
      images,
      description,
      status,
      tryonInstance,
      arSettings,
    } = req.body

    const payload = {}
    if (categoryId != null) payload.categoryId = Number(categoryId)
    if (title !== undefined) payload.title = title
    if (price !== undefined) payload.price = price
    if (importPrice !== undefined) payload.importPrice = importPrice
    if (stock !== undefined) payload.totalStock = stock
    if (thumbnail !== undefined) payload.thumbnail = thumbnail
    if (images !== undefined) payload.images = images
    if (description !== undefined) payload.description = description
    if (status !== undefined) payload.status = status
    const tryon = tryonInstance || mapArSettingsToTryon(arSettings)
    if (tryon) payload.tryonInstance = tryon

    const product = await sellerProductService.updateProduct(
      req.user.id,
      productId,
      payload,
    )

    res.status(StatusCodes.OK).json({
      success: true,
      data: { product },
    })
  } catch (err) {
    next(err)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = Number(req.params.id)
    await sellerProductService.softDeleteProduct(req.user.id, productId)
    res.status(StatusCodes.OK).json({ success: true })
  } catch (err) {
    next(err)
  }
}
