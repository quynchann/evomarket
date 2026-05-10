/**
 * System Namespace Handler
 * Xử lý /system namespace: Online/Offline presence và Notifications
 */

import { SYSTEM_EVENTS, ROOMS } from '../socket.constants.js'

// Map lưu trữ online users: userId -> Set of socketIds
// Để tracking người dùng mở nhiều tab
const onlineUsers = new Map()

/**
 * Setup handlers cho /system namespace
 * @param {import('socket.io').Namespace} systemNamespace
 */
export const setupSystemNamespace = (systemNamespace) => {
  systemNamespace.on('connection', (socket) => {
    // User info đã được attach bởi socketAuthMiddleware
    const user = socket.user
    console.log(
      `[/system] User ${user.id} (${user.email}) connected (socket: ${socket.id})`
    )

    // Track user connection
    if (!onlineUsers.has(user.id)) {
      onlineUsers.set(user.id, new Set())
    }
    onlineUsers.get(user.id).add(socket.id)

    // Auto join vào các rooms cần thiết
    const personalRoom = ROOMS.SYSTEM.PERSONAL(user.id)
    const roleRoom = ROOMS.SYSTEM.ROLE(user.role)
    const globalRoom = ROOMS.SYSTEM.GLOBAL()

    socket.join([personalRoom, roleRoom, globalRoom])

    console.log(`[/system] User ${user.id} joined rooms:`, {
      personal: personalRoom,
      role: roleRoom,
      global: globalRoom
    })

    // Nếu đây là socket đầu tiên của user này -> báo online
    if (onlineUsers.get(user.id).size === 1) {
      systemNamespace.emit(SYSTEM_EVENTS.PRESENCE_ONLINE, {
        userId: user.id,
        timestamp: new Date().toISOString()
      })
      console.log(`[/system] User ${user.id} is now ONLINE`)
    }

    // Handler: room:join (client tự join thêm rooms nếu cần)
    socket.on(SYSTEM_EVENTS.ROOM_JOIN, ({ rooms }) => {
      if (!Array.isArray(rooms)) return

      socket.join(rooms)
      console.log(`[/system] User ${user.id} joined additional rooms:`, rooms)
    })

    // Handler: disconnect
    socket.on('disconnect', (reason) => {
      console.log(
        `[/system] User ${user.id} disconnected (socket: ${socket.id}), reason: ${reason}`
      )

      // Xóa socketId khỏi tracking
      const userSockets = onlineUsers.get(user.id)
      if (userSockets) {
        userSockets.delete(socket.id)

        // Nếu không còn socket nào -> user thực sự offline
        if (userSockets.size === 0) {
          onlineUsers.delete(user.id)

          systemNamespace.emit(SYSTEM_EVENTS.PRESENCE_OFFLINE, {
            userId: user.id,
            timestamp: new Date().toISOString()
          })
          console.log(`[/system] User ${user.id} is now OFFLINE`)
        } else {
          console.log(
            `[/system] User ${user.id} still has ${userSockets.size} active connection(s)`
          )
        }
      }
    })

    // Handler: error
    socket.on('error', (error) => {
      console.error(`[/system] Socket error for user ${user.id}:`, error)
    })
  })
}

/**
 * Helper: Get online users count
 */
export const getOnlineUsersCount = () => {
  return onlineUsers.size
}

/**
 * Helper: Check if user is online
 */
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId)
}

/**
 * Helper: Get all online user IDs
 */
export const getOnlineUserIds = () => {
  return Array.from(onlineUsers.keys())
}
