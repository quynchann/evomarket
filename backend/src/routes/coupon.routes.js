import express from 'express'
import * as couponController from '../controllers/coupon.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

router.get('/platform', authorizeRoles('buyer'), couponController.getPlatformCoupons)
router.get('/shop/:sellerId', authorizeRoles('buyer'), couponController.getShopCoupons)

export default router
