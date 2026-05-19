import express from 'express'
import { authorizeRoles } from '@/middlewares/role.middleware.js'
import * as paymentController from '@/controllers/payment.controller'

const router = express.Router()

router.post(
  '/vnpay/create-url',
  authorizeRoles('buyer'),
  paymentController.createVNPayUrl,
)

export default router
