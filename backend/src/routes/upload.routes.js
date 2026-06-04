import express from 'express'
import * as uploadController from '../controllers/upload.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'
import {
  uploadProductImageMemory,
  uploadTryonModelMemory,
  uploadAvatarMemory,
  uploadChatImageMemory,
  uploadFileMemory,
} from '@/config/multer.memory.js'

const router = express.Router()

/**
 * Upload Routes (Cloudinary)
 * Base path: /api-v1/upload
 * authMiddleware được apply trong api.js
 */
router.post(
  '/product-image',
  authorizeRoles('seller'),
  uploadProductImageMemory.single('image'),
  uploadController.uploadProductImage,
)

router.post(
  '/product-tryon-model',
  authorizeRoles('seller'),
  uploadTryonModelMemory.single('model'),
  uploadController.uploadProductTryonModel,
)

router.post(
  '/avatar',
  uploadAvatarMemory.single('avatar'),
  uploadController.uploadAvatar,
)

router.post(
  '/chat-image',
  uploadChatImageMemory.single('image'),
  uploadController.uploadChatImage,
)

router.post(
  '/file',
  uploadFileMemory.single('file'),
  uploadController.uploadFile,
)

export default router
