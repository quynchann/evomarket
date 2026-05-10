import express from 'express'
import * as cartController from '../controllers/cart.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

router.use(authorizeRoles('buyer'))

router.get('/', cartController.getCart)
router.post('/items', cartController.addItem)
router.patch('/items/:id', cartController.updateItem)
router.delete('/items/:id', cartController.removeItem)
router.delete('/', cartController.clearCart)

export default router
