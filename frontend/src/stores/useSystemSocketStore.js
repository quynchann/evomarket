import { create } from 'zustand'
import { io } from 'socket.io-client'
import { NAMESPACES, SYSTEM_EVENTS } from '@/sockets/socket.constants'
import { toast } from 'sonner'
import { useAuthStore } from './useAuthStore'

const SOCKET_BASE =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080'

/**
 * System Socket Store
 * Quản lý /system namespace: online/offline presence và push notification
 * Tự động connect khi login, disconnect khi logout
 */
export const useSystemSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  onlineUsers: new Set(),
  unreadCount: 0,
  notifications: [],

  isUserOnline: (userId) => {
    const id = Number(userId)
    return get().onlineUsers.has(id)
  },

  connect: () => {
    const { accessToken, user } = useAuthStore.getState()
    const { isConnecting } = get()

    if (!accessToken || !user) return
    if (get().socket?.connected || isConnecting) return

    set({ isConnecting: true })

    const socket = io(`${SOCKET_BASE}${NAMESPACES.SYSTEM}`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('[System Socket] Connected:', socket.id)
      set({ socket, isConnected: true, isConnecting: false })
    })

    socket.on('connect_error', (err) => {
      console.error('[System Socket] connect_error:', err?.message)
      set({ isConnected: false, isConnecting: false })
    })

    socket.on('disconnect', (reason) => {
      console.log('[System Socket] Disconnected:', reason)
      set({ isConnected: false, isConnecting: false })
      if (reason === 'io server disconnect') {
        socket.connect()
      }
    })

    socket.on(SYSTEM_EVENTS.PRESENCE_ONLINE, ({ userId }) => {
      const id = Number(userId)
      if (!Number.isFinite(id)) return
      set((state) => ({
        onlineUsers: new Set(state.onlineUsers).add(id),
      }))
    })

    socket.on(SYSTEM_EVENTS.PRESENCE_OFFLINE, ({ userId }) => {
      const id = Number(userId)
      if (!Number.isFinite(id)) return
      set((state) => {
        const next = new Set(state.onlineUsers)
        next.delete(id)
        return { onlineUsers: next }
      })
    })

    socket.on(SYSTEM_EVENTS.NOTIFICATION_NEW, (notification) => {
      console.log('[System Socket] New notification:', notification)
      set((state) => ({
        notifications: [
          { ...notification, receivedAt: new Date().toISOString() },
          ...state.notifications,
        ].slice(0, 50),
      }))
      toast.success(notification?.title || 'Thông báo', {
        description: notification?.message,
        duration: 5000,
      })
    })

    socket.on(SYSTEM_EVENTS.NOTIFICATION_UNREAD_UPDATE, ({ unreadCount }) => {
      const n =
        typeof unreadCount === 'number' ? unreadCount : Number(unreadCount)
      if (Number.isFinite(n)) {
        set({ unreadCount: n })
      }
    })

    socket.on('error', (err) => {
      console.error('[System Socket] error event:', err)
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()

    if (socket) {
      console.log('[System Socket] Disconnecting...')
      socket.removeAllListeners()
      socket.disconnect()
      set({
        socket: null,
        isConnected: false,
        isConnecting: false,
        onlineUsers: new Set(),
        unreadCount: 0,
        notifications: [],
      })
    }
  },
}))

useAuthStore.subscribe((state) => {
  const { isAuthenticated, accessToken, user } = state
  const socketState = useSystemSocketStore.getState()

  if (isAuthenticated && accessToken && user) {
    if (
      !socketState.isConnected &&
      !socketState.isConnecting &&
      !socketState.socket?.connected
    ) {
      console.log('[System Socket] User authenticated - Auto-connecting...')
      setTimeout(() => {
        useSystemSocketStore.getState().connect()
      }, 100)
    }
  } else if (!isAuthenticated || !accessToken) {
    if (socketState.socket) {
      console.log('[System Socket] User logged out - Disconnecting...')
      useSystemSocketStore.getState().disconnect()
    }
  }
})

if (typeof window !== 'undefined') {
  setTimeout(() => {
    const { isAuthenticated, accessToken, user } = useAuthStore.getState()
    const socketState = useSystemSocketStore.getState()

    if (
      isAuthenticated &&
      accessToken &&
      user &&
      !socketState.isConnected &&
      !socketState.isConnecting
    ) {
      setTimeout(() => {
        useSystemSocketStore.getState().connect()
      }, 500)
    }
  }, 100)
}
