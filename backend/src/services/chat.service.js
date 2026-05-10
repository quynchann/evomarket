import { Conversation, Message, User } from '../models/index.js'
import { Op } from 'sequelize'
import { ApiError } from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'

/**
 * Serialize message (Sequelize instance hoặc plain) cho REST/socket — camelCase
 */
export const messageToSocketPayload = (messageInstance, { tempId } = {}) => {
  const m = messageInstance?.get
    ? messageInstance.get({ plain: true })
    : messageInstance
  const senderRaw = messageInstance?.Sender
  const sender = senderRaw?.get ? senderRaw.get({ plain: true }) : senderRaw
  const created = m.created_at
  return {
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    content: m.content,
    isRead: m.is_read,
    createdAt: created instanceof Date ? created.toISOString() : created,
    Sender: sender
      ? {
          id: sender.id,
          fullname: sender.fullname,
          avatar: sender.avatar
        }
      : undefined,
    ...(tempId != null ? { tempId } : {})
  }
}

export const assertConversationMember = async (conversationId, userId) => {
  const conversation = await Conversation.findByPk(conversationId)
  if (!conversation) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Conversation not found',
      'CONVERSATION_NOT_FOUND'
    )
  }
  if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Unauthorized access to conversation',
      'UNAUTHORIZED_ACCESS_TO_CONVERSATION'
    )
  }
  return conversation
}

/**
 * Lấy danh sách conversations của user với cursor pagination
 */
export const getConversations = async (
  userId,
  { limit = 20, after, before } = {}
) => {
  const paginationOptions = {
    where: {
      [Op.or]: [{ user1_id: userId }, { user2_id: userId }]
    },
    limit: parseInt(limit),
    order: [['last_message_at', 'DESC']],
    include: [
      {
        model: User,
        as: 'User1',
        attributes: ['id', 'fullname', 'avatar']
      },
      {
        model: User,
        as: 'User2',
        attributes: ['id', 'fullname', 'avatar']
      }
    ]
  }

  if (after) {
    paginationOptions.after = after
  }
  if (before) {
    paginationOptions.before = before
  }

  const result = await Conversation.paginate(paginationOptions)
  const data = (result.edges || []).map((edge) => edge.node)

  return {
    conversations: data,
    meta: {
      hasNextPage: result.pageInfo.hasNextPage,
      hasPreviousPage: result.pageInfo.hasPreviousPage,
      startCursor: result.pageInfo.startCursor,
      endCursor: result.pageInfo.endCursor
    }
  }
}

/**
 * Lấy messages của một conversation với cursor pagination
 */
export const getMessages = async (
  conversationId,
  userId,
  { limit = 50, after, before } = {}
) => {
  await assertConversationMember(conversationId, userId)

  const paginationOptions = {
    where: {
      conversation_id: conversationId
    },
    limit: parseInt(limit),
    order: [['created_at', 'DESC']],
    include: [
      {
        model: User,
        as: 'Sender',
        attributes: ['id', 'fullname', 'avatar']
      }
    ]
  }

  if (after) {
    paginationOptions.after = after
  }
  if (before) {
    paginationOptions.before = before
  }

  const result = await Message.paginate(paginationOptions)
  const data = (result.edges || []).map((edge) => edge.node)

  return {
    messages: data,
    meta: {
      hasNextPage: result.pageInfo.hasNextPage,
      hasPreviousPage: result.pageInfo.hasPreviousPage,
      startCursor: result.pageInfo.startCursor,
      endCursor: result.pageInfo.endCursor
    }
  }
}

/**
 * Tạo hoặc lấy conversation giữa 2 users
 */
export const getOrCreateConversation = async (user1Id, user2Id) => {
  let conversation = await Conversation.findOne({
    where: {
      [Op.or]: [
        { user1_id: user1Id, user2_id: user2Id },
        { user1_id: user2Id, user2_id: user1Id }
      ]
    },
    include: [
      {
        model: User,
        as: 'User1',
        attributes: ['id', 'fullname', 'avatar']
      },
      {
        model: User,
        as: 'User2',
        attributes: ['id', 'fullname', 'avatar']
      }
    ]
  })

  if (!conversation) {
    conversation = await Conversation.create({
      user1_id: user1Id,
      user2_id: user2Id
    })

    conversation = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: User,
          as: 'User1',
          attributes: ['id', 'fullname', 'avatar']
        },
        {
          model: User,
          as: 'User2',
          attributes: ['id', 'fullname', 'avatar']
        }
      ]
    })
  }

  return conversation
}

/**
 * Gửi message mới
 */
export const sendMessage = async (conversationId, senderId, content) => {
  const conversation = await assertConversationMember(
    conversationId,
    senderId
  )

  const message = await Message.create({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    is_read: false
  })

  await conversation.update({
    last_message: content,
    last_message_at: new Date()
  })

  const messageWithSender = await Message.findByPk(message.id, {
    include: [
      {
        model: User,
        as: 'Sender',
        attributes: ['id', 'fullname', 'avatar']
      }
    ]
  })

  return messageWithSender
}

/**
 * Đánh dấu messages đã đọc
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  await assertConversationMember(conversationId, userId)

  await Message.update(
    { is_read: true },
    {
      where: {
        conversation_id: conversationId,
        sender_id: { [Op.ne]: userId },
        is_read: false
      }
    }
  )

  return { success: true }
}

/**
 * Lấy số lượng unread messages
 */
export const getUnreadCount = async (userId) => {
  const conversations = await Conversation.findAll({
    where: {
      [Op.or]: [{ user1_id: userId }, { user2_id: userId }]
    },
    attributes: ['id']
  })

  const conversationIds = conversations.map((c) => c.id)

  const unreadCount = await Message.count({
    where: {
      conversation_id: { [Op.in]: conversationIds },
      sender_id: { [Op.ne]: userId },
      is_read: false
    }
  })

  return { unreadCount }
}

/**
 * Đánh dấu một tin đã đọc (người đọc không phải người gửi)
 */
export const markOneMessageRead = async (conversationId, readerId, messageId) => {
  await assertConversationMember(conversationId, readerId)

  const mid = parseInt(messageId, 10)
  if (Number.isNaN(mid)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid message id',
      'INVALID_MESSAGE_ID'
    )
  }

  await Message.update(
    { is_read: true },
    {
      where: {
        id: mid,
        conversation_id: conversationId,
        sender_id: { [Op.ne]: readerId }
      }
    }
  )

  return { success: true }
}
