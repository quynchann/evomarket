import express from 'express'
import * as shopController from '@/controllers/shop.controller.js'
import { authMiddleware, optionalAuthMiddleware } from '@/middlewares/auth.middleware.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

router.get('/:sellerId', optionalAuthMiddleware, shopController.getShop)
router.get('/:sellerId/products', shopController.getShopProducts)

router.post(
  '/:sellerId/follow',
  authMiddleware,
  authorizeRoles('buyer'),
  shopController.followShop,
)
router.delete(
  '/:sellerId/follow',
  authMiddleware,
  authorizeRoles('buyer'),
  shopController.unfollowShop,
)

export default router
