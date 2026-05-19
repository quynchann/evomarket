/**
 * Socket.IO Constants
 * Định nghĩa tất cả Room Names và Event Names theo chuẩn trong socket_design.md
 */

// Namespaces
export const NAMESPACES = {
  SYSTEM: '/system',
  CHAT: '/chat'
}

/**
 * Helper functions để tạo room names theo chuẩn Redis-style
 */
export const ROOMS = {
  SYSTEM: {
    PERSONAL: (userId) => `user:${userId}`,
    ROLE: (roleName) => `role:${roleName}`,
    GLOBAL: () => 'system:global'
  },
  CHAT: {
    CONVERSATION: (conversationId) => `conversation:${conversationId}`
  }
}

// Event Names - Namespace: /system
export const SYSTEM_EVENTS = {
  // Client -> Server
  ROOM_JOIN: 'room:join',

  // Server -> Client
  PRESENCE_SYNC: 'presence:sync',
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_UNREAD_UPDATE: 'notification:unread_update',
  /** Server → buyer: đơn đổi trạng thái (shop xác nhận / giao / hủy, ...) */
  ORDER_STATUS_UPDATED: 'order:status_updated',
  /** Server → seller: thống kê dashboard hôm nay (sau lượt xem SP / đơn hàng, …) */
  SELLER_TODAY_STATS: 'seller:today_stats',
}

// Event Names - Namespace: /chat
export const CHAT_EVENTS = {
  // Client -> Server
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  MESSAGE_SEND: 'message:send',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  MESSAGE_READ: 'message:read',

  // Server -> Client
  MESSAGE_NEW: 'message:new'
}
