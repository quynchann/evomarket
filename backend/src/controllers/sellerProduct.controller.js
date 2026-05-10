import { StatusCodes } from 'http-status-codes'
import * as sellerProductService from '../services/sellerProduct.service.js'

export const listCategories = async (req, res, next) => {
  try {
    const categories = await sellerProductService.listCategories()
    res.status(StatusCodes.OK).json({
      success: true,
      data: { categories }
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
      data: { products }
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
      description,
      status
    } = req.body

    const product = await sellerProductService.createProduct(req.user.id, {
      categoryId: Number(categoryId),
      title,
      price,
      importPrice,
      totalStock: stock,
      thumbnail,
      description,
      status: status || 'active'
    })

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: { product }
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
      description,
      status
    } = req.body

    const payload = {}
    if (categoryId != null) payload.categoryId = Number(categoryId)
    if (title !== undefined) payload.title = title
    if (price !== undefined) payload.price = price
    if (importPrice !== undefined) payload.importPrice = importPrice
    if (stock !== undefined) payload.totalStock = stock
    if (thumbnail !== undefined) payload.thumbnail = thumbnail
    if (description !== undefined) payload.description = description
    if (status !== undefined) payload.status = status

    const product = await sellerProductService.updateProduct(
      req.user.id,
      productId,
      payload
    )

    res.status(StatusCodes.OK).json({
      success: true,
      data: { product }
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
