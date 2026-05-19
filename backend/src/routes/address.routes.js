import express from 'express'
import * as addressController from '../controllers/address.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

router.get('/', authorizeRoles('buyer'), addressController.listAddresses)
router.post('/', authorizeRoles('buyer'), addressController.createAddress)
router.put('/:id', authorizeRoles('buyer'), addressController.updateAddress)
router.delete('/:id', authorizeRoles('buyer'), addressController.deleteAddress)
router.patch('/:id/default', authorizeRoles('buyer'), addressController.setDefaultAddress)

export default router
