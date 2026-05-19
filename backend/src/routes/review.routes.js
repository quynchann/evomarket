import express from 'express'
import * as reviewController from '../controllers/review.controller.js'
import { authorizeRoles } from '@/middlewares/role.middleware.js'

const router = express.Router()

router.post('/', authorizeRoles('buyer'), reviewController.createReview)

export default router
