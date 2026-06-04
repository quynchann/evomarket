import { cloudinary } from '@/config/cloudinary.config.js'
import { env } from '@/config/env.js'
import ApiError from '@/utils/api-error.js'
import { StatusCodes } from 'http-status-codes'

const assertCloudinaryConfigured = () => {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      'Cloudinary chưa được cấu hình',
      'CLOUDINARY_NOT_CONFIGURED',
    )
  }
}

/** @param {...(string|number|null|undefined)} segments */
export const buildCloudinaryFolder = (...segments) => {
  const root = String(env.CLOUDINARY_ROOT_FOLDER || 'evomarket').replace(
    /^\/+|\/+$/g,
    '',
  )
  const tail = segments
    .filter((s) => s != null && String(s).trim() !== '')
    .map((s) => String(s).trim())
  return [root, ...tail].join('/')
}

/**
 * @param {Buffer} buffer
 * @param {import('cloudinary').UploadApiOptions} options
 */
const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )
    uploadStream.end(buffer)
  })

const mapUploadResult = (result) => ({
  url: result.secure_url,
  publicId: result.public_id,
  resourceType: result.resource_type,
  format: result.format,
  bytes: result.bytes,
})

const imageMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
])

const assertFileBuffer = (file) => {
  if (!file?.buffer?.length) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No file uploaded',
      'NO_FILE',
    )
  }
}

const runUpload = async (file, options) => {
  assertCloudinaryConfigured()
  assertFileBuffer(file)
  try {
    const result = await uploadBuffer(file.buffer, options)
    return mapUploadResult(result)
  } catch (err) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      err?.message || 'Cloudinary upload failed',
      'CLOUDINARY_UPLOAD_FAILED',
    )
  }
}

/**
 * Upload ảnh sản phẩm lên Cloudinary (resource_type: image).
 * @param {Express.Multer.File} file
 * @param {{ sellerId?: number, productId?: number }} [ctx]
 */
export const uploadProductImage = async (file, ctx = {}) => {
  const folder = buildCloudinaryFolder(
    'products',
    ctx.sellerId,
    ctx.productId,
  )
  return runUpload(file, {
    folder,
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  })
}

/**
 * Upload model AR (.glb / .gltf) lên Cloudinary (resource_type: raw).
 * @param {Express.Multer.File} file
 * @param {{ sellerId?: number, productId?: number }} [ctx]
 */
export const uploadTryonModelFile = async (file, ctx = {}) => {
  const folder = buildCloudinaryFolder(
    'tryon-models',
    ctx.sellerId,
    ctx.productId,
  )
  return runUpload(file, {
    folder,
    resource_type: 'raw',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  })
}

/**
 * Avatar người dùng (resource_type: image).
 * @param {Express.Multer.File} file
 * @param {{ userId?: number }} [ctx]
 */
export const uploadAvatar = async (file, ctx = {}) => {
  const folder = buildCloudinaryFolder('avatars', ctx.userId)
  return runUpload(file, {
    folder,
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  })
}

/**
 * Ảnh chat (resource_type: image).
 * @param {Express.Multer.File} file
 * @param {{ userId?: number, conversationId?: number|string }} [ctx]
 */
export const uploadChatImage = async (file, ctx = {}) => {
  const folder = buildCloudinaryFolder(
    'chat',
    'images',
    ctx.userId,
    ctx.conversationId,
  )
  return runUpload(file, {
    folder,
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  })
}

const ALLOWED_GENERIC_FOLDERS = new Set([
  'misc',
  'documents',
  'chat-files',
])

/**
 * File tổng quát: ảnh → image, còn lại → raw (PDF, Office, …).
 * @param {Express.Multer.File} file
 * @param {{ userId?: number, subfolder?: string }} [ctx]
 */
export const uploadGenericFile = async (file, ctx = {}) => {
  const sub =
    ctx.subfolder && ALLOWED_GENERIC_FOLDERS.has(ctx.subfolder)
      ? ctx.subfolder
      : 'misc'
  const folder = buildCloudinaryFolder('files', sub, ctx.userId)
  const isImage = imageMimeTypes.has(file.mimetype)

  return runUpload(file, {
    folder,
    resource_type: isImage ? 'image' : 'raw',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  })
}
