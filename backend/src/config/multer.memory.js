import multer from 'multer'
import path from 'path'

const memoryStorage = multer.memoryStorage()

export const imageMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
])

const tryonModelExtensions = new Set(['.glb', '.gltf'])

const chatFileMimeTypes = new Set([
  ...imageMimeTypes,
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const imageFilter = (req, file, cb) => {
  if (imageMimeTypes.has(file.mimetype)) {
    cb(null, true)
    return
  }
  cb(
    new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'),
    false,
  )
}

const chatFileFilter = (req, file, cb) => {
  if (chatFileMimeTypes.has(file.mimetype)) {
    cb(null, true)
    return
  }
  cb(new Error('Invalid file type for upload.'), false)
}

const tryonModelFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase()
  if (tryonModelExtensions.has(ext)) {
    cb(null, true)
    return
  }
  cb(new Error('Invalid file type. Only .glb and .gltf are allowed.'), false)
}

export const uploadProductImageMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
})

export const uploadTryonModelMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: tryonModelFilter,
})

export const uploadAvatarMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
})

export const uploadChatImageMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
})

/** Ảnh + tài liệu thường dùng (PDF, Word, Excel, txt) */
export const uploadFileMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: chatFileFilter,
})
