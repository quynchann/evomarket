import express from 'express'
import * as notificationController from '@/controllers/notification.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

router.use(authorizeRoles('buyer', 'seller'))

router.get('/settings', notificationController.getSettings)
router.patch('/settings', notificationController.updateSettings)

router.get('/unread-count', notificationController.getUnreadCount)
router.patch('/read-all', notificationController.markAllRead)
router.patch('/:id/read', notificationController.markOneRead)
router.get('/', notificationController.listMine)

export default router
