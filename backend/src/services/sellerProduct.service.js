import { Category, Product } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import * as sellerProductRepo from '../repositories/sellerProduct.repo.js'
import * as productMediaService from './productMedia.service.js'
import * as productTryonInstanceService from './productTryonInstance.service.js'
import { StatusCodes } from 'http-status-codes'

const toPlain = (row) => (row?.get ? row.get({ plain: true }) : row)

// Phí sàn mặc định (5%)
const PLATFORM_FEE_PERCENT = 5.0

export const mapProductToSellerDto = (row) => {
  const plain = toPlain(row)
  if (!plain) return null
  const cat = plain.Category || {}
  const available = Number(plain.available) || 0
  const deleted = Boolean(plain.deleted)
  let status = 'active'
  if (deleted || available <= 0) status = 'out-of-stock'

  const price = Number(plain.price) || 0
  const importPrice = Number(plain.import_price) || 0
  const sold = Number(plain.sold) || 0

  // Tính toán lợi nhuận ĐÚNG (có tính phí sàn)
  // Công thức: Lợi nhuận = (Giá bán - Phí sàn) - Giá nhập
  const platformFee = Math.round((price * PLATFORM_FEE_PERCENT) / 100)
  const sellerReceive = price - platformFee
  const profitPerUnit = sellerReceive - importPrice
  const totalProfit = profitPerUnit * sold

  return {
    id: plain.id,
    name: plain.title,
    category: cat.name || '',
    categoryId: plain.category_id,
    price: price,
    importPrice: importPrice,
    platformFee: platformFee,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    sellerReceive: sellerReceive,
    stock: plain.total_stock,
    available,
    sold: sold,
    profitPerUnit: profitPerUnit,
    totalProfit: totalProfit,
    status,
    description: plain.description || '',
    image: plain.thumbnail || '',
    thumbnail: plain.thumbnail,
  }
}

export const listProducts = async (sellerId) => {
  const rows = await sellerProductRepo.findAllBySeller(sellerId)
  return rows.map(mapProductToSellerDto)
}

export const getProductForSeller = async (sellerId, productId) => {
  const row = await sellerProductRepo.findByIdForSeller(productId, sellerId)
  if (!row) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Product not found',
      'PRODUCT_NOT_FOUND',
    )
  }

  const dto = mapProductToSellerDto(row)
  const plain = toPlain(row)
  const images = productMediaService.parseImageUrlList(plain.images)
  if (images.length) dto.image = images

  const tryonList =
    await productTryonInstanceService.listTryonInstancesForSeller(
      sellerId,
      productId,
    )
  if (tryonList.length) {
    dto.tryonInstances = tryonList
    dto.tryonInstance = tryonList[0]
    dto.arSettings = {
      ...tryonList[0].arSettings,
      type:
        tryonList[0].transform_config?.type ||
        (tryonList.length > 1 ? 'jewelry' : undefined),
    }
  }

  return dto
}

export const listCategories = async () => {
  const rows = await Category.findAll({
    attributes: ['id', 'name'],
    order: [['id', 'ASC']],
  })
  return rows.map((c) => ({ id: c.id, name: c.name }))
}

const saveTryonFromBody = async (sellerId, productId, tryonInstance) => {
  if (!tryonInstance?.modelUrl) return null
  return productTryonInstanceService.saveTryonInstanceForSeller(
    sellerId,
    productId,
    {
      modelUrl: tryonInstance.modelUrl,
      type: tryonInstance.type ?? tryonInstance.tryOnType,
      transform_config:
        tryonInstance.transform_config ?? tryonInstance.transformConfig,
      arSettings: tryonInstance.arSettings,
    },
  )
}

export const createProduct = async (sellerId, body) => {
  const {
    categoryId,
    title,
    price,
    importPrice,
    totalStock,
    thumbnail,
    images,
    description,
    status,
    tryonInstance,
  } = body

  const category = await Category.findByPk(categoryId)
  if (!category)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Category not found',
      'CATEGORY_NOT_FOUND',
    )

  const priceNum = Math.max(0, parseInt(price, 10) || 0)
  const importPriceNum = Math.max(0, parseInt(importPrice, 10) || 0)
  let stock = Math.max(0, parseInt(totalStock, 10) || 0)
  let available = stock
  if (status === 'out-of-stock') available = 0

  const { thumbnail: thumb, imagesJson } =
    productMediaService.normalizeProductImages(thumbnail, images)

  const row = await Product.create({
    seller_id: sellerId,
    category_id: categoryId,
    title: String(title || '').trim(),
    price: priceNum,
    import_price: importPriceNum,
    thumbnail: thumb,
    images: imagesJson,
    description: description != null ? String(description) : '',
    deleted: false,
    total_stock: stock,
    sold: 0,
    available,
  })

  await saveTryonFromBody(sellerId, row.id, tryonInstance)

  const full = await sellerProductRepo.findByIdForSeller(row.id, sellerId)
  return mapProductToSellerDto(full)
}

export const updateProduct = async (sellerId, productId, body) => {
  const existing = await sellerProductRepo.findByIdForSeller(
    productId,
    sellerId,
  )
  if (!existing)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Product not found',
      'PRODUCT_NOT_FOUND',
    )

  const plain = toPlain(existing)
  const updates = {}

  if (body.categoryId != null) {
    const category = await Category.findByPk(body.categoryId)
    if (!category)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Category not found',
        'CATEGORY_NOT_FOUND',
      )
    updates.category_id = body.categoryId
  }
  if (body.title != null) updates.title = String(body.title).trim()
  if (body.price != null || body.importPrice != null) {
    const priceNum =
      body.price != null
        ? Math.max(0, parseInt(body.price, 10) || 0)
        : Number(plain.price) || 0
    const importPriceNum =
      body.importPrice != null
        ? Math.max(0, parseInt(body.importPrice, 10) || 0)
        : Number(plain.import_price) || 0

    if (body.price != null) updates.price = priceNum
    if (body.importPrice != null) updates.import_price = importPriceNum
  }
  if (body.description != null) updates.description = String(body.description)
  if (body.thumbnail !== undefined || body.images !== undefined) {
    const plainImages = body.images !== undefined ? body.images : plain.images
    const { thumbnail: thumb, imagesJson } =
      productMediaService.normalizeProductImages(
        body.thumbnail !== undefined ? body.thumbnail : plain.thumbnail,
        plainImages,
      )
    updates.thumbnail = thumb
    updates.images = imagesJson
  }
  if (body.totalStock != null) {
    const stock = Math.max(0, parseInt(body.totalStock, 10) || 0)
    updates.total_stock = stock
    const sold = Number(plain.sold) || 0
    updates.available = Math.max(0, stock - sold)
  }
  if (body.status === 'out-of-stock') {
    updates.available = 0
  } else if (body.status === 'active' && body.totalStock == null) {
    const stock = Number(plain.total_stock) || 0
    const sold = Number(plain.sold) || 0
    updates.available = Math.max(0, stock - sold)
  }

  await existing.update(updates)

  if (body.tryonInstance) {
    await saveTryonFromBody(sellerId, productId, body.tryonInstance)
  }

  const full = await sellerProductRepo.findByIdForSeller(productId, sellerId)
  return mapProductToSellerDto(full)
}

export const softDeleteProduct = async (sellerId, productId) => {
  const existing = await sellerProductRepo.findByIdForSeller(
    productId,
    sellerId,
  )
  if (!existing)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Product not found',
      'PRODUCT_NOT_FOUND',
    )

  await existing.update({ deleted: true })
}
