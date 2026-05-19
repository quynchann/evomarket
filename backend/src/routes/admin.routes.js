import express from 'express'
import * as adminNotificationController from '@/controllers/adminNotification.controller.js'
import * as adminController from '@/controllers/admin.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

router.use(authorizeRoles('admin'))

router.get('/stats', adminController.getAdminOverview)
router.get('/orders', adminController.getAllOrders)
router.get('/revenue', adminController.getPlatformRevenue)

router.get('/users', adminController.listUsers)
router.patch('/users/:id/status', adminController.updateUserStatus)

router.get('/products', adminController.listProducts)
router.patch('/products/:id/visibility', adminController.patchProductVisibility)

router.get('/reviews', adminController.listReviews)
router.patch('/reviews/:id', adminController.patchReview)

router.get('/coupons/platform', adminController.listPlatformCoupons)
router.post('/coupons/platform', adminController.createPlatformCoupon)
router.put('/coupons/platform/:id', adminController.updatePlatformCoupon)
router.delete('/coupons/platform/:id', adminController.deletePlatformCoupon)

router.post(
  '/notifications/by-role',
  adminNotificationController.notifyByRole,
)

export default router
