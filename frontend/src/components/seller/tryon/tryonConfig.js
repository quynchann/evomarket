export const HEAD_OCCLUDER_URL =
  'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/face-tracking/assets/sparkar/headOccluder.glb'

/** @typedef {'hats' | 'glasses' | 'jewelry'} TryOnType */

export const TRYON_TYPE_META = {
  hats: { label: 'Mũ', anchors: [10] },
  glasses: { label: 'Kính', anchors: [168] },
  jewelry: { label: 'Hoa tai', anchors: [127, 356] },
}

/** @param {TryOnType} type */
export const getAnchorsForType = (type) =>
  TRYON_TYPE_META[type]?.anchors ?? TRYON_TYPE_META.glasses.anchors

/** @param {TryOnType} type */
export const getDefaultConfigForType = (type = 'glasses') => {
  const anchors = getAnchorsForType(type)
  return {
    type,
    anchorIndex: anchors[0],
    anchors,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  }
}

export const DEFAULT_TRYON_CONFIG = getDefaultConfigForType('glasses')

const toAxis = (value, fallback) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/** Chuẩn hóa vector từ DB/API (tránh string) — seller & customer dùng chung. */
export const normalizeVector3 = (vector, fallback = { x: 0, y: 0, z: 0 }) => ({
  x: toAxis(vector?.x, fallback.x),
  y: toAxis(vector?.y, fallback.y),
  z: toAxis(vector?.z, fallback.z),
})

export const formatVector = (vector) => {
  const v = normalizeVector3(vector)
  return `${v.x} ${v.y} ${v.z}`
}

export const formatControlValue = (value, step) =>
  step >= 1 ? value.toFixed(0) : value.toFixed(3)

/**
 * Suy ra loại try-on từ danh mục sản phẩm (Mũ / Kính / Hoa tai).
 * @param {string|number} categoryId
 * @param {{ id: number, name: string }[]} categories
 * @returns {TryOnType}
 */
export const resolveTryOnTypeFromCategoryName = (categoryName) => {
  if (!categoryName) return 'glasses'
  const n = String(categoryName).toLowerCase()
  if (n.includes('mũ') || n.includes('mu')) return 'hats'
  if (n.includes('hoa tai') || n.includes('hoa')) return 'jewelry'
  if (n.includes('kính') || n.includes('kinh')) return 'glasses'
  return 'glasses'
}

export const resolveTryOnTypeFromCategory = (categoryId, categories = []) => {
  const cat = categories.find((c) => String(c.id) === String(categoryId))
  if (!cat?.name) return 'glasses'
  const n = cat.name.toLowerCase()
  if (n.includes('mũ') || n.includes('mu')) return 'hats'
  if (n.includes('hoa tai') || n.includes('hoa')) return 'jewelry'
  if (n.includes('kính') || n.includes('kinh')) return 'glasses'
  return 'glasses'
}

/** @param {TryOnType} type */
export const applyTypeToConfig = (config, type) => {
  const anchors = getAnchorsForType(type)
  return {
    ...config,
    type,
    anchorIndex: anchors[0],
    anchors,
  }
}

/** @param {object} ar */
export const arSettingsToTryonConfig = (ar) => {
  if (!ar) return { ...DEFAULT_TRYON_CONFIG }
  const type = ar.type || ar.tryOnType || 'glasses'
  const scale = Number(ar.scale) || 1
  const base = getDefaultConfigForType(type)
  return {
    ...base,
    anchorIndex: ar.anchorIndex ?? ar.anchor_index ?? base.anchorIndex,
    position: normalizeVector3({
      x: ar.positionX,
      y: ar.positionY,
      z: ar.positionZ,
    }),
    rotation: normalizeVector3({
      x: ar.rotationX,
      y: ar.rotationY,
      z: ar.rotationZ,
    }),
    scale: normalizeVector3(
      {
        x: ar.scaleX ?? scale,
        y: ar.scaleY ?? scale,
        z: ar.scaleZ ?? scale,
      },
      { x: 1, y: 1, z: 1 },
    ),
  }
}

/** @param {ReturnType<typeof getDefaultConfigForType>} config */
export const tryonConfigToTransform = (config) => ({
  type: config.type,
  position: normalizeVector3(config.position),
  rotation: normalizeVector3(config.rotation),
  scale: normalizeVector3(config.scale, { x: 1, y: 1, z: 1 }),
})

/** @param {object} instance from API */
export const tryonInstanceToConfig = (instance, type = 'glasses') => {
  if (!instance) return getDefaultConfigForType(type)
  const tc = instance.transform_config || {}
  const resolvedType = tc.type || type
  const base = getDefaultConfigForType(resolvedType)
  return {
    ...base,
    anchorIndex: instance.anchor_index ?? base.anchorIndex,
    position: normalizeVector3(tc.position, base.position),
    rotation: normalizeVector3(tc.rotation, base.rotation),
    scale: normalizeVector3(tc.scale, base.scale),
  }
}

/** Gộp nhiều instance (hoa tai) thành một config preview */
export const tryonInstancesToConfig = (instances, type = 'glasses') => {
  if (!instances?.length) return getDefaultConfigForType(type)
  const first = instances[0]
  const tc = first.transform_config || {}
  const resolvedType = tc.type || type
  return tryonInstanceToConfig(first, resolvedType)
}

/**
 * Chuẩn hóa product_tryon_instances từ API → danh sách model gắn lên face.
 * @param {Array<{ model_url: string, anchor_index?: number, transform_config?: object }>} instances
 * @param {string} [categoryName]
 */
export const buildTryonSceneItems = (instances, categoryName = '') => {
  if (!instances?.length) return []

  const first = instances[0]
  const type =
    first.transform_config?.type ||
    resolveTryOnTypeFromCategoryName(categoryName)
  const fallback = getDefaultConfigForType(type)

  const withAnchor = instances.filter(
    (i) => i.model_url && i.anchor_index != null && i.anchor_index !== '',
  )

  if (withAnchor.length > 0) {
    return withAnchor.map((inst) => ({
      anchorIndex: Number(inst.anchor_index),
      modelUrl: inst.model_url,
      position: normalizeVector3(
        inst.transform_config?.position,
        fallback.position,
      ),
      rotation: normalizeVector3(
        inst.transform_config?.rotation,
        fallback.rotation,
      ),
      scale: normalizeVector3(inst.transform_config?.scale, fallback.scale),
    }))
  }

  const inst = instances.find((i) => i.model_url)
  if (!inst) return []

  const tc = inst.transform_config || {}
  return getAnchorsForType(type).map((anchorIndex) => ({
    anchorIndex,
    modelUrl: inst.model_url,
    position: normalizeVector3(tc.position, fallback.position),
    rotation: normalizeVector3(tc.rotation, fallback.rotation),
    scale: normalizeVector3(tc.scale, fallback.scale),
  }))
}
