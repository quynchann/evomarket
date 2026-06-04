import { StatusCodes } from 'http-status-codes'
import { ProductTryonInstance } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import * as sellerProductRepo from '../repositories/sellerProduct.repo.js'
import * as cloudinaryUpload from './cloudinaryUpload.service.js'

const HTTP_URL_RE = /^https?:\/\//i

/** @param {unknown} value */
export const parseImageUrlList = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((u) => typeof u === 'string' && HTTP_URL_RE.test(u.trim()))
      .map((u) => u.trim())
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    if (HTTP_URL_RE.test(trimmed)) return [trimmed]
    try {
      const parsed = JSON.parse(trimmed)
      return parseImageUrlList(parsed)
    } catch {
      return []
    }
  }
  return []
}

/**
 * @param {string|null|undefined} thumbnail
 * @param {string[]|string|null|undefined} images
 */
export const normalizeProductImages = (thumbnail, images) => {
  const fromImages = parseImageUrlList(images)
  const fromThumb =
    typeof thumbnail === 'string' && HTTP_URL_RE.test(thumbnail.trim())
      ? [thumbnail.trim()]
      : []

  const merged = []
  for (const url of [...fromThumb, ...fromImages]) {
    if (!merged.includes(url)) merged.push(url)
  }

  return {
    thumbnail: merged[0] || null,
    imagesJson: merged.length ? JSON.stringify(merged) : null,
    images: merged,
  }
}

const requireSellerProduct = async (sellerId, productId) => {
  const product = await sellerProductRepo.findByIdForSeller(productId, sellerId)
  if (!product) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Product not found',
      'PRODUCT_NOT_FOUND',
    )
  }
  return product
}

const findLatestTryonInstance = async (productId) =>
  ProductTryonInstance.findOne({
    where: { product_id: productId },
    order: [['id', 'DESC']],
  })

/**
 * Mỗi product giữ một bản ghi try-on mới nhất (update nếu đã có).
 */
const upsertTryonInstance = async (productId, fields) => {
  const existing = await findLatestTryonInstance(productId)
  if (existing) {
    await existing.update(fields)
    return existing.get({ plain: true })
  }
  const created = await ProductTryonInstance.create({
    product_id: productId,
    ...fields,
  })
  return created.get({ plain: true })
}

/**
 * Upload ảnh Cloudinary; nếu có productId thì gắn vào Products.thumbnail + images.
 * @param {number} sellerId
 * @param {Express.Multer.File} file
 * @param {number|null} [productId]
 */
export const uploadProductImageForSeller = async (
  sellerId,
  file,
  productId = null,
) => {
  const uploaded = await cloudinaryUpload.uploadProductImage(file, {
    sellerId,
    productId: productId ?? undefined,
  })

  if (!productId) {
    return { ...uploaded, product: null }
  }

  const product = await appendProductImageUrls(sellerId, productId, [
    uploaded.url,
  ])
  return { ...uploaded, product }
}

/**
 * @param {number} sellerId
 * @param {number} productId
 * @param {string[]} newUrls
 */
export const appendProductImageUrls = async (sellerId, productId, newUrls) => {
  const product = await requireSellerProduct(sellerId, productId)
  const plain = product.get({ plain: true })

  const existing = parseImageUrlList(plain.images)
  const merged = [...existing]
  for (const url of newUrls) {
    if (HTTP_URL_RE.test(url) && !merged.includes(url)) merged.push(url)
  }

  const { thumbnail, imagesJson } = normalizeProductImages(
    plain.thumbnail,
    merged,
  )

  await product.update({
    thumbnail,
    images: imagesJson,
  })

  return {
    id: product.id,
    thumbnail,
    images: merged,
  }
}

/**
 * Gán danh sách ảnh (đã upload) cho product — dùng khi create/update từ form.
 * @param {number} sellerId
 * @param {number} productId
 * @param {string[]|string|null|undefined} images
 * @param {string|null|undefined} [thumbnail]
 */
export const setProductImages = async (
  sellerId,
  productId,
  images,
  thumbnail,
) => {
  const product = await requireSellerProduct(sellerId, productId)
  const { thumbnail: thumb, imagesJson } = normalizeProductImages(
    thumbnail,
    images,
  )
  await product.update({ thumbnail: thumb, images: imagesJson })
  return {
    id: product.id,
    thumbnail: thumb,
    images: parseImageUrlList(imagesJson),
  }
}

const parseTransformConfig = (value) => {
  if (value == null || value === '') return null
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'transform_config must be valid JSON',
        'INVALID_TRANSFORM_CONFIG',
      )
    }
  }
  return null
}

/**
 * Upload .glb/.gltf; nếu có productId thì lưu ProductTryonInstances.model_url.
 * @param {number} sellerId
 * @param {Express.Multer.File} file
 * @param {{
 *   productId?: number|null,
 *   anchor_index?: number|null,
 *   transform_config?: object|string|null,
 * }} [meta]
 */
export const uploadTryonModelForSeller = async (sellerId, file, meta = {}) => {
  const productId = meta.productId != null ? Number(meta.productId) : null

  const uploaded = await cloudinaryUpload.uploadTryonModelFile(file, {
    sellerId,
    productId: productId ?? undefined,
  })

  if (!productId || !Number.isFinite(productId)) {
    return { ...uploaded, instance: null }
  }

  await requireSellerProduct(sellerId, productId)

  const anchorIndex =
    meta.anchor_index != null && meta.anchor_index !== ''
      ? Number(meta.anchor_index)
      : null

  const transformConfig = parseTransformConfig(meta.transform_config)

  const instance = await upsertTryonInstance(productId, {
    model_url: uploaded.url,
    anchor_index: Number.isFinite(anchorIndex) ? anchorIndex : null,
    transform_config: transformConfig,
  })

  return {
    ...uploaded,
    instance,
  }
}

/**
 * Lưu try-on instance khi model_url đã có sẵn (upload trước, tạo product sau).
 */
export const createTryonInstanceFromUrl = async (
  sellerId,
  productId,
  payload,
) => {
  await requireSellerProduct(sellerId, productId)

  const modelUrl =
    typeof payload.modelUrl === 'string' ? payload.modelUrl.trim() : ''
  if (!HTTP_URL_RE.test(modelUrl)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'modelUrl must be a valid http(s) URL',
      'INVALID_MODEL_URL',
    )
  }

  const anchorIndex =
    payload.anchor_index != null ? Number(payload.anchor_index) : null

  return upsertTryonInstance(productId, {
    model_url: modelUrl,
    anchor_index: Number.isFinite(anchorIndex) ? anchorIndex : null,
    transform_config: parseTransformConfig(payload.transform_config),
  })
}
