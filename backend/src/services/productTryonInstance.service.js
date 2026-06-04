import { StatusCodes } from 'http-status-codes'
import { ProductTryonInstance } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import * as sellerProductRepo from '../repositories/sellerProduct.repo.js'

const HTTP_URL_RE = /^https?:\/\//i

const TRYON_TYPE_ANCHORS = {
  hats: [10],
  glasses: [168],
  jewelry: [127, 356],
  earrings: [127, 356],
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

export const getAnchorsForTryOnType = (type) => {
  if (!type) return TRYON_TYPE_ANCHORS.glasses
  const key = String(type).toLowerCase()
  return TRYON_TYPE_ANCHORS[key] ?? TRYON_TYPE_ANCHORS.glasses
}

const buildTransformFromBody = (body) => {
  let transformConfig = parseTransformConfig(
    body.transform_config ?? body.transformConfig,
  )

  if (!transformConfig && body.arSettings) {
    const ar = body.arSettings
    transformConfig = {
      type: ar.type || ar.tryOnType,
      position: {
        x: Number(ar.positionX) || 0,
        y: Number(ar.positionY) || 0,
        z: Number(ar.positionZ) || 0,
      },
      rotation: {
        x: Number(ar.rotationX) || 0,
        y: Number(ar.rotationY) || 0,
        z: Number(ar.rotationZ) || 0,
      },
      scale: {
        x: Number(ar.scaleX ?? ar.scale) || 1,
        y: Number(ar.scaleY ?? ar.scale) || 1,
        z: Number(ar.scaleZ ?? ar.scale) || 1,
      },
    }
  }

  if (transformConfig && body.type && !transformConfig.type) {
    transformConfig.type = body.type
  }

  return transformConfig
}

export const mapTryonInstanceToDto = (row) => {
  const plain = row?.get ? row.get({ plain: true }) : row
  if (!plain) return null

  const tc = plain.transform_config || {}
  const position = tc.position || { x: 0, y: 0, z: 0 }
  const rotation = tc.rotation || { x: 0, y: 0, z: 0 }
  const scale = tc.scale || { x: 1, y: 1, z: 1 }

  return {
    id: plain.id,
    product_id: plain.product_id,
    model_url: plain.model_url,
    anchor_index: plain.anchor_index,
    transform_config: tc,
    arSettings: {
      enabled: Boolean(plain.model_url),
      type: tc.type,
      modelUrl: plain.model_url,
      anchorIndex: plain.anchor_index ?? 168,
      positionX: position.x,
      positionY: position.y,
      positionZ: position.z,
      rotationX: rotation.x,
      rotationY: rotation.y,
      rotationZ: rotation.z,
      scale: scale.x,
      scaleX: scale.x,
      scaleY: scale.y,
      scaleZ: scale.z,
    },
  }
}

export const listTryonInstancesForSeller = async (sellerId, productId) => {
  const product = await sellerProductRepo.findByIdForSeller(productId, sellerId)
  if (!product) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Product not found',
      'PRODUCT_NOT_FOUND',
    )
  }

  const rows = await ProductTryonInstance.findAll({
    where: { product_id: productId },
    order: [
      ['anchor_index', 'ASC'],
      ['id', 'ASC'],
    ],
  })

  return rows.map((r) => mapTryonInstanceToDto(r))
}

/** @deprecated dùng list — giữ 1 bản ghi đầu cho tương thích */
export const getTryonInstanceForSeller = async (sellerId, productId) => {
  const list = await listTryonInstancesForSeller(sellerId, productId)
  return list[0] ?? null
}

const upsertInstanceByAnchor = async (productId, anchorIndex, fields) => {
  const existing = await ProductTryonInstance.findOne({
    where: { product_id: productId, anchor_index: anchorIndex },
  })

  if (existing) {
    await existing.update(fields)
    return existing
  }

  return ProductTryonInstance.create({
    product_id: productId,
    anchor_index: anchorIndex,
    ...fields,
  })
}

/**
 * Lưu cấu hình AR — hoa tai tạo 2 bản ghi (127, 356).
 */
export const saveTryonInstanceForSeller = async (sellerId, productId, body) => {
  const product = await sellerProductRepo.findByIdForSeller(productId, sellerId)
  if (!product) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Product not found',
      'PRODUCT_NOT_FOUND',
    )
  }

  const modelUrl = String(body.model_url ?? body.modelUrl ?? '').trim()

  if (!HTTP_URL_RE.test(modelUrl)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'model_url must be a valid http(s) URL',
      'INVALID_MODEL_URL',
    )
  }

  const tryOnType = body.type ?? body.tryOnType ?? body.arSettings?.type
  const transformConfig = buildTransformFromBody(body)

  if (transformConfig && tryOnType) {
    transformConfig.type = tryOnType
  }

  const anchorsFromBody = Array.isArray(body.anchor_indices)
    ? body.anchor_indices.map(Number).filter(Number.isFinite)
    : null

  const anchors =
    anchorsFromBody?.length > 0
      ? anchorsFromBody
      : getAnchorsForTryOnType(tryOnType)

  const saved = []
  for (const anchorIndex of anchors) {
    const row = await upsertInstanceByAnchor(productId, anchorIndex, {
      model_url: modelUrl,
      transform_config: transformConfig,
    })
    saved.push(mapTryonInstanceToDto(row))
  }

  const anchorSet = new Set(anchors)
  const allRows = await ProductTryonInstance.findAll({
    where: { product_id: productId },
  })
  for (const row of allRows) {
    if (!anchorSet.has(row.anchor_index)) {
      await row.destroy()
    }
  }

  return {
    instances: saved,
    instance: saved[0] ?? null,
  }
}
