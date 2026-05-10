/**
 * Chat Namespace Handler
 * Xử lý /chat namespace: Messages, Typing indicators, Read receipts
 */

import { CHAT_EVENTS, ROOMS } from '../socket.constants.js'
import * as chatService from '../../services/chat.service.js'
import { ApiError } from '../../utils/api-error.js'

/**
 * Setup handlers cho /chat namespace
 * @param {import('socket.io').Namespace} chatNamespace
 */
export const setupChatNamespace = (chatNamespace) => {
  chatNamespace.on('connection', (socket) => {
    const user = socket.user
    console.log(
      `[/chat] User ${user.id} (${user.email}) connected (socket: ${socket.id})`
    )

    socket.on(CHAT_EVENTS.ROOM_JOIN, async ({ conversationId }) => {
      if (!conversationId) {
        socket.emit('error', { message: 'Conversation ID required' })
        return
      }

      const cid = Number(conversationId)
      if (!Number.isFinite(cid)) {
        socket.emit('error', { message: 'Invalid conversation id' })
        return
      }

      try {
        await chatService.assertConversationMember(cid, user.id)

        const roomName = ROOMS.CHAT.CONVERSATION(cid)
        socket.join(roomName)

        console.log(`[/chat] User ${user.id} joined conversation: ${cid}`)

        socket.emit('room:joined', { conversationId: cid, room: roomName })
      } catch (error) {
        if (error instanceof ApiError) {
          socket.emit('error', {
            message: error.message,
            code: error.code
          })
          return
        }
        console.error(`[/chat] Error joining room:`, error)
        socket.emit('error', { message: 'Failed to join conversation' })
      }
    })

    socket.on(CHAT_EVENTS.ROOM_LEAVE, ({ conversationId }) => {
      if (!conversationId) return
      const cid = Number(conversationId)
      if (!Number.isFinite(cid)) return

      const roomName = ROOMS.CHAT.CONVERSATION(cid)
      socket.leave(roomName)

      console.log(`[/chat] User ${user.id} left conversation: ${cid}`)
    })

    socket.on(CHAT_EVENTS.MESSAGE_SEND, async (data) => {
      const { conversationId, content, tempId } = data

      if (!conversationId || content == null || String(content).trim() === '') {
        socket.emit('error', { message: 'Invalid message data', tempId })
        return
      }

      const cid = Number(conversationId)
      if (!Number.isFinite(cid)) {
        socket.emit('error', { message: 'Invalid conversation id', tempId })
        return
      }

      try {
        const savedMessage = await chatService.sendMessage(
          cid,
          user.id,
          String(content).trim()
        )

        const payload = chatService.messageToSocketPayload(savedMessage, {
          tempId
        })
        const roomName = ROOMS.CHAT.CONVERSATION(cid)

        chatNamespace.to(roomName).emit(CHAT_EVENTS.MESSAGE_NEW, payload)

        console.log(
          `[/chat] Message saved in conversation ${cid} by user ${user.id}`
        )
      } catch (error) {
        if (error instanceof ApiError) {
          socket.emit('error', {
            message: error.message,
            code: error.code,
            tempId
          })
          return
        }
        console.error(`[/chat] Error sending message:`, error)
        socket.emit('error', {
          message: 'Failed to send message',
          tempId
        })
      }
    })

    socket.on(CHAT_EVENTS.TYPING_START, ({ conversationId }) => {
      if (!conversationId) return
      const cid = Number(conversationId)
      if (!Number.isFinite(cid)) return

      const roomName = ROOMS.CHAT.CONVERSATION(cid)

      socket.to(roomName).emit(CHAT_EVENTS.TYPING_START, {
        conversationId: cid,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
    })

    socket.on(CHAT_EVENTS.TYPING_STOP, ({ conversationId }) => {
      if (!conversationId) return
      const cid = Number(conversationId)
      if (!Number.isFinite(cid)) return

      const roomName = ROOMS.CHAT.CONVERSATION(cid)

      socket.to(roomName).emit(CHAT_EVENTS.TYPING_STOP, {
        conversationId: cid,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
    })

    socket.on(
      CHAT_EVENTS.MESSAGE_READ,
      async ({ conversationId, messageId } = {}) => {
        if (!conversationId) return
        const cid = Number(conversationId)
        if (!Number.isFinite(cid)) return

        try {
          if (messageId != null && messageId !== '') {
            await chatService.markOneMessageRead(cid, user.id, messageId)
          } else {
            await chatService.markMessagesAsRead(cid, user.id)
          }

          const roomName = ROOMS.CHAT.CONVERSATION(cid)

          socket.to(roomName).emit(CHAT_EVENTS.MESSAGE_READ, {
            conversationId: cid,
            messageId: messageId ?? null,
            userId: user.id,
            timestamp: new Date().toISOString()
          })

          console.log(
            `[/chat] Read receipt in conversation ${cid} from user ${user.id}`
          )
        } catch (error) {
          if (error instanceof ApiError) {
            socket.emit('error', {
              message: error.message,
              code: error.code
            })
            return
          }
          console.error(`[/chat] Error marking message as read:`, error)
        }
      }
    )

    socket.on('disconnect', (reason) => {
      console.log(
        `[/chat] User ${user.id} disconnected (socket: ${socket.id}), reason: ${reason}`
      )
    })

    socket.on('error', (error) => {
      console.error(`[/chat] Socket error for user ${user.id}:`, error)
    })
  })
}
