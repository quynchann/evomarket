import express from 'express'
import * as chatController from '../controllers/chat.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/conversations', chatController.getConversations)

router.post('/conversations', chatController.createConversation)

router.get(
  '/conversations/:conversationId/messages',
  chatController.getMessages
)

router.post(
  '/conversations/:conversationId/messages',
  chatController.sendMessage
)

router.put('/conversations/:conversationId/read', chatController.markAsRead)

router.get('/unread-count', chatController.getUnreadCount)

export default router
