import * as chatService from '../services/chat.service.js'
import { emitNewMessage } from '../sockets/emitters/chat.emitter.js'
import { ApiError } from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'

/**
 * GET /api/chat/conversations
 * Lấy danh sách conversations với pagination
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { limit, after, before } = req.query

    const result = await chatService.getConversations(userId, {
      limit,
      after,
      before
    })

    return res.status(StatusCodes.OK).json({
      success: true,
      data: result.conversations,
      meta: result.meta
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Lấy messages của conversation với pagination
 */
export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params
    const { limit, after, before } = req.query

    const result = await chatService.getMessages(conversationId, userId, {
      limit,
      after,
      before
    })

    return res.status(StatusCodes.OK).json({
      success: true,
      data: result.messages,
      meta: result.meta
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/chat/conversations
 * Tạo hoặc lấy conversation với user khác
 */
export const createConversation = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { otherUserId } = req.body

    if (!otherUserId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'otherUserId is required',
        'BAD_REQUEST'
      )
    }

    if (parseInt(otherUserId) === userId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot create conversation with yourself',
        'BAD_REQUEST'
      )
    }

    const conversation = await chatService.getOrCreateConversation(
      userId,
      otherUserId
    )

    return res.status(StatusCodes.OK).json({
      success: true,
      data: conversation
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/chat/conversations/:conversationId/messages
 * Gửi message mới
 */
export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params
    const { content } = req.body

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      })
    }

    const message = await chatService.sendMessage(
      conversationId,
      userId,
      content.trim()
    )

    const payload = chatService.messageToSocketPayload(message)
    emitNewMessage(conversationId, payload)

    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: message
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/chat/conversations/:conversationId/read
 * Đánh dấu messages đã đọc
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params

    const result = await chatService.markMessagesAsRead(conversationId, userId)

    return res.status(StatusCodes.OK).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/chat/unread-count
 * Lấy số lượng unread messages
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id

    const result = await chatService.getUnreadCount(userId)

    return res.status(StatusCodes.OK).json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}
