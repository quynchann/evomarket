import { apiRequest } from './apiRequest.js'

function buildQuery(params) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v))
  })
  const q = sp.toString()
  return q ? `?${q}` : ''
}

export const chatApi = {
  getConversations: ({ limit = 20, after, before } = {}) =>
    apiRequest(`/chat/conversations${buildQuery({ limit, after, before })}`),

  getMessages: (conversationId, { limit = 40, after, before } = {}) =>
    apiRequest(
      `/chat/conversations/${conversationId}/messages${buildQuery({
        limit,
        after,
        before,
      })}`,
    ),

  createConversation: (otherUserId) =>
    apiRequest('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ otherUserId }),
    }),

  sendMessage: (conversationId, content, messageType = 'text', mediaUrl = null) =>
    apiRequest(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, messageType, mediaUrl }),
    }),

  markAsRead: (conversationId) =>
    apiRequest(`/chat/conversations/${conversationId}/read`, {
      method: 'PUT',
    }),

  getUnreadCount: () => apiRequest('/chat/unread-count'),

  uploadChatImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return apiRequest('/upload/chat-image', {
      method: 'POST',
      body: formData,
    })
  },
}

export const chatQueryKeys = {
  conversations: (limit) => ['chat', 'conversations', limit],
  messages: (conversationId, limit) => ['chat', 'messages', conversationId, limit],
  /** Dùng chung cho dashboard + ChatShell sau markAsRead */
  unreadCount: ['chat', 'unread-count'],
}
