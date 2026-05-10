import { create } from 'zustand'
import { io } from 'socket.io-client'
import { NAMESPACES, CHAT_EVENTS, ROOMS } from '@/sockets/socket.constants'
import { toast } from 'sonner'
import { useAuthStore } from './useAuthStore'

/**
 * Chat Socket Store
 * Quản lý /chat namespace: Messages, Typing indicators, Read receipts
 * Tự động connect khi user login, disconnect khi logout
 */
export const useChatSocketStore = create((set, get) => ({
  // State
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  // Active conversation
  activeConversationId: null,

  // Messages by conversation ID: { [conversationId]: [...messages] }
  messagesByConversation: {},

  // Typing users by conversation ID: { [conversationId]: Set(userIds) }
  typingUsers: {},

  // Temporary messages (pending send): { [tempId]: message }
  pendingMessages: {},

  /**
   * Connect to /chat namespace
   * @param {string} token - JWT access token (optional, sẽ lấy từ authStore nếu không truyền)
   */
  connect: (token) => {
    const { isConnected, isConnecting } = get()

    if (isConnected || isConnecting) {
      console.log('[Chat Socket] Already connected or connecting')
      return
    }

    // Lấy token từ authStore nếu không truyền vào
    if (!token) {
      const { accessToken } = useAuthStore.getState()
      token = accessToken
    }

    if (!token) {
      console.error('[Chat Socket] No token provided')
      set({ error: 'No authentication token' })
      return
    }

    const { user } = useAuthStore.getState()
    console.log(
      `[Chat Socket] 🔌 Connecting for user: ${user?.email} (${user?.role})`,
    )

    set({ isConnecting: true, error: null })

    try {
      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080'

      const newSocket = io(`${SOCKET_URL}${NAMESPACES.CHAT}`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      // Connection events
      newSocket.on('connect', () => {
        const { user } = useAuthStore.getState()
        console.log('✅ [Chat Socket] Connected:', newSocket.id)
        console.log(`   👤 User: ${user?.email} | Role: ${user?.role}`)

        set({
          socket: newSocket,
          isConnected: true,
          isConnecting: false,
          error: null,
        })
      })

      newSocket.on('connect_error', (error) => {
        console.error('❌ [Chat Socket] Connection error:', error.message)
        set({
          isConnected: false,
          isConnecting: false,
          error: error.message,
        })
      })

      newSocket.on('disconnect', (reason) => {
        console.log('⚠️ [Chat Socket] Disconnected:', reason)
        set({ isConnected: false })

        if (reason === 'io server disconnect') {
          newSocket.connect()
        }
      })

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(
          `🔄 [Chat Socket] Reconnected after ${attemptNumber} attempts`,
        )

        // Re-join active conversation nếu có
        const { activeConversationId } = get()
        if (activeConversationId) {
          get().joinConversation(activeConversationId)
        }
      })

      // ============================================
      // Chat Events Listeners
      // ============================================

      // Room joined confirmation
      newSocket.on('room:joined', ({ conversationId }) => {
        console.log(`✅ [Chat Socket] Joined conversation: ${conversationId}`)
      })

      // New message received
      newSocket.on(CHAT_EVENTS.MESSAGE_NEW, (message) => {
        console.log('💬 [Chat Socket] New message:', message)

        set((state) => {
          const convId = Number(message.conversationId)
          if (!Number.isFinite(convId)) return state

          const conversationMessages =
            state.messagesByConversation[convId] || []

          // Xóa pending message nếu match tempId
          const pendingMessages = { ...state.pendingMessages }
          if (message.tempId) {
            delete pendingMessages[message.tempId]
          }

          // Thêm message mới (check duplicate bằng ID)
          const existingIndex = conversationMessages.findIndex(
            (m) => m.id === message.id,
          )
          let newMessages

          if (existingIndex >= 0) {
            newMessages = [...conversationMessages]
            newMessages[existingIndex] = message
          } else {
            newMessages = [...conversationMessages, message]
          }

          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [convId]: newMessages,
            },
            pendingMessages,
          }
        })
      })

      // User started typing
      newSocket.on(CHAT_EVENTS.TYPING_START, ({ conversationId, userId }) => {
        const cid = Number(conversationId)
        if (!Number.isFinite(cid)) return
        console.log(
          `⌨️ [Chat Socket] User ${userId} is typing in ${cid}`,
        )

        set((state) => {
          const typingSet = state.typingUsers[cid] || new Set()
          const newTypingSet = new Set(typingSet)
          newTypingSet.add(userId)

          return {
            typingUsers: {
              ...state.typingUsers,
              [cid]: newTypingSet,
            },
          }
        })
      })

      // User stopped typing
      newSocket.on(CHAT_EVENTS.TYPING_STOP, ({ conversationId, userId }) => {
        const cid = Number(conversationId)
        if (!Number.isFinite(cid)) return
        console.log(`⌨️ [Chat Socket] User ${userId} stopped typing`)

        set((state) => {
          const typingSet = state.typingUsers[cid] || new Set()
          const newTypingSet = new Set(typingSet)
          newTypingSet.delete(userId)

          return {
            typingUsers: {
              ...state.typingUsers,
              [cid]: newTypingSet,
            },
          }
        })
      })

      // Message read receipt
      newSocket.on(
        CHAT_EVENTS.MESSAGE_READ,
        ({ conversationId, messageId, userId, timestamp }) => {
          const cid = Number(conversationId)
          if (!Number.isFinite(cid)) return
          console.log(
            `✓✓ [Chat Socket] Message ${messageId} read by user ${userId}`,
          )

          set((state) => {
            const conversationMessages =
              state.messagesByConversation[cid] || []
            const updatedMessages = conversationMessages.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    readBy: [...(msg.readBy || []), userId],
                    readAt: timestamp,
                  }
                : msg,
            )

            return {
              messagesByConversation: {
                ...state.messagesByConversation,
                [cid]: updatedMessages,
              },
            }
          })
        },
      )

      // Error event
      newSocket.on('error', (error) => {
        console.error('❌ [Chat Socket] Error:', error)

        // Nếu có tempId, xóa pending message
        if (error.tempId) {
          set((state) => {
            const pendingMessages = { ...state.pendingMessages }
            delete pendingMessages[error.tempId]
            return { pendingMessages }
          })
        }

        toast.error(error.message || 'Chat error occurred')
      })

      set({ socket: newSocket })
    } catch (error) {
      console.error('❌ [Chat Socket] Failed to create socket:', error)
      set({
        isConnecting: false,
        error: error.message,
      })
    }
  },

  /**
   * Disconnect from /chat namespace
   */
  disconnect: () => {
    const { socket } = get()

    if (socket) {
      console.log('🔌 [Chat Socket] Disconnecting...')
      socket.removeAllListeners()
      socket.disconnect()
      set({
        socket: null,
        isConnected: false,
        activeConversationId: null,
        typingUsers: {},
        pendingMessages: {},
      })
    }
  },

  /**
   * Join a conversation room
   * @param {string} conversationId
   */
  joinConversation: (conversationId) => {
    const { socket, isConnected } = get()

    if (!socket || !isConnected) {
      console.warn('[Chat Socket] Not connected')
      return
    }

    // Leave previous conversation nếu có
    const cid = Number(conversationId)
    if (!Number.isFinite(cid)) return

    const { activeConversationId } = get()
    if (activeConversationId != null && activeConversationId !== cid) {
      get().leaveConversation(activeConversationId)
    }

    socket.emit(CHAT_EVENTS.ROOM_JOIN, { conversationId: cid })
    set({ activeConversationId: cid })

    console.log(`📍 [Chat Socket] Joining conversation: ${cid}`)
  },

  /**
   * Leave a conversation room
   * @param {string} conversationId
   */
  leaveConversation: (conversationId) => {
    const { socket, isConnected } = get()

    if (!socket || !isConnected) return

    const cid = Number(conversationId)
    if (!Number.isFinite(cid)) return

    socket.emit(CHAT_EVENTS.ROOM_LEAVE, { conversationId: cid })

    // Clear typing users for this conversation
    set((state) => {
      const typingUsers = { ...state.typingUsers }
      delete typingUsers[cid]

      return {
        activeConversationId:
          state.activeConversationId === cid ? null : state.activeConversationId,
        typingUsers,
      }
    })

    console.log(`🚪 [Chat Socket] Left conversation: ${cid}`)
  },

  /**
   * Send a message
   * @param {string} conversationId
   * @param {string} content
   * @param {object} metadata - Optional metadata
   */
  sendMessage: (conversationId, content, metadata = {}) => {
    const { socket, isConnected } = get()

    if (!socket || !isConnected) {
      toast.error('Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.')
      return
    }

    const cid = Number(conversationId)
    if (!Number.isFinite(cid)) return

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Tạo temporary message
    const tempMessage = {
      tempId,
      conversationId: cid,
      content,
      sending: true,
      createdAt: new Date().toISOString(),
      ...metadata,
    }

    // Thêm vào pending messages
    set((state) => ({
      pendingMessages: {
        ...state.pendingMessages,
        [tempId]: tempMessage,
      },
    }))

    // Emit message
    socket.emit(CHAT_EVENTS.MESSAGE_SEND, {
      conversationId: cid,
      content,
      tempId,
      ...metadata,
    })

    console.log(`📤 [Chat Socket] Sending message:`, tempId)
  },

  /**
   * Start typing indicator
   * @param {string} conversationId
   */
  startTyping: (conversationId) => {
    const { socket, isConnected } = get()

    if (!socket || !isConnected) return

    const cid = Number(conversationId)
    if (!Number.isFinite(cid)) return

    socket.emit(CHAT_EVENTS.TYPING_START, { conversationId: cid })
  },

  /**
   * Stop typing indicator
   * @param {string} conversationId
   */
  stopTyping: (conversationId) => {
    const { socket, isConnected } = get()

    if (!socket || !isConnected) return

    const cid = Number(conversationId)
    if (!Number.isFinite(cid)) return

    socket.emit(CHAT_EVENTS.TYPING_STOP, { conversationId: cid })
  },

  /**
   * Mark message as read
   * @param {string} conversationId
   * @param {string|number} messageId
   */
  markMessageAsRead: (conversationId, messageId) => {
    const { socket, isConnected } = get()

    if (!socket || !isConnected) return

    const cid = Number(conversationId)
    if (!Number.isFinite(cid)) return

    socket.emit(CHAT_EVENTS.MESSAGE_READ, {
      conversationId: cid,
      messageId,
    })
  },

  /**
   * Get messages for a conversation
   * @param {string} conversationId
   * @returns {Array}
   */
  getMessages: (conversationId) => {
    const { messagesByConversation, pendingMessages } = get()
    const cid = Number(conversationId)
    const messages = messagesByConversation[cid] || []

    // Merge with pending messages
    const pending = Object.values(pendingMessages).filter(
      (msg) => Number(msg.conversationId) === cid,
    )

    return [...messages, ...pending].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    )
  },

  /**
   * Get typing users for a conversation
   * @param {string} conversationId
   * @returns {Set}
   */
  getTypingUsers: (conversationId) => {
    const { typingUsers } = get()
    const cid = Number(conversationId)
    return typingUsers[cid] || new Set()
  },

  /**
   * Clear messages for a conversation (for memory management)
   * @param {string} conversationId
   */
  clearConversationMessages: (conversationId) => {
    const cid = Number(conversationId)
    if (!Number.isFinite(cid)) return
    set((state) => {
      const messagesByConversation = { ...state.messagesByConversation }
      delete messagesByConversation[cid]
      return { messagesByConversation }
    })
  },

  /**
   * Set messages for a conversation (when loading from API)
   * @param {string} conversationId
   * @param {Array} messages
   */
  setMessages: (conversationId, messages) => {
    const cid = Number(conversationId)
    if (!Number.isFinite(cid)) return
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [cid]: messages,
      },
    }))
  },
}))

// ============================================
// Auto-subscribe to auth changes
// ============================================

// Subscribe vào auth store để tự động connect/disconnect
useAuthStore.subscribe((state) => {
  const { isAuthenticated, accessToken, user } = state
  const socketState = useChatSocketStore.getState()

  // User vừa login
  if (isAuthenticated && accessToken && user) {
    if (!socketState.isConnected && !socketState.isConnecting) {
      console.log('[Chat Socket] ✅ User authenticated - Auto-connecting...')
      console.log(`   👤 User: ${user.email}`)
      console.log(`   🎭 Role: ${user.role}`)

      setTimeout(() => {
        useChatSocketStore.getState().connect(accessToken)
      }, 100)
    }
  }

  // User vừa logout
  else if (!isAuthenticated || !accessToken) {
    if (socketState.isConnected) {
      console.log('[Chat Socket] 🔌 User logged out - Disconnecting...')
      useChatSocketStore.getState().disconnect()
    }
  }
})

// Auto-initialize nếu user đã login sẵn (từ persisted state)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const { isAuthenticated, accessToken, user } = useAuthStore.getState()

    if (isAuthenticated && accessToken && user) {
      console.log(
        '[Chat Socket] 🔄 User already authenticated - Auto-connecting...',
      )
      console.log(`   👤 User: ${user.email}`)

      setTimeout(() => {
        useChatSocketStore.getState().connect(accessToken)
      }, 500)
    }
  }, 100)
}
