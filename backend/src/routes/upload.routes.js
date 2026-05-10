import express from 'express'
import multer from 'multer'
import * as uploadController from '../controllers/upload.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'
import path from 'path'

const router = express.Router()

// Tạo storage config trực tiếp
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, 'product-' + uniqueSuffix + ext)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})

/**
 * Upload Routes
 * Base path: /api-v1/upload
 * 
 * Note: authMiddleware đã được apply trong api.js
 * Upload product images chỉ dành cho seller
 */
router.post(
  '/product-image',
  authorizeRoles('seller'),
  upload.single('image'),
  uploadController.uploadProductImage
)

export default router
