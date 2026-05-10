# Socket.IO - Quick Start ⚡

## ✨ Tự động hoạt động khi login!

Sockets **tự động connect** khi user login và **tự động disconnect** khi logout. 
Bạn không cần setup gì cả!

## 📦 Cấu trúc

```
src/stores/
├── useSystemSocketStore.js  → System Socket (notifications, presence)
└── useChatSocketStore.js    → Chat Socket (messages, typing)
```

## 🚀 Sử dụng

### 1. Notifications (System Socket)

```jsx
import { useSystemSocketStore } from '@/stores/useSystemSocketStore'

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useSystemSocketStore()

  return (
    <div>
      <BellIcon />
      <span className="badge">{unreadCount}</span>
      
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}
        </div>
      ))}
    </div>
  )
}
```

### 2. Online Status (System Socket)

```jsx
import { useSystemSocketStore } from '@/stores/useSystemSocketStore'

function UserStatus({ userId }) {
  const isOnline = useSystemSocketStore(state => state.isUserOnline(userId))
  
  return (
    <span>{isOnline ? '🟢 Online' : '⚫ Offline'}</span>
  )
}
```

### 3. Chat (Chat Socket)

```jsx
import { useChatSocketStore } from '@/stores/useChatSocketStore'
import { useEffect } from 'react'

function ChatBox({ conversationId }) {
  const {
    joinConversation,
    leaveConversation,
    sendMessage,
    getMessages,
  } = useChatSocketStore()

  const messages = getMessages(conversationId)

  useEffect(() => {
    joinConversation(conversationId)
    return () => leaveConversation(conversationId)
  }, [conversationId])

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id || msg.tempId}>
          {msg.content}
          {msg.sending && '⏳'}
        </div>
      ))}
      
      <button onClick={() => sendMessage(conversationId, 'Hello!')}>
        Send
      </button>
    </div>
  )
}
```

## 🔍 Debug

Xem console logs:
- `[System Socket]` - System socket logs
- `[Chat Socket]` - Chat socket logs

Console sẽ tự động log:
- ✅ User authenticated - Auto-connecting...
- 👤 User: email@example.com
- 🎭 Role: seller
- ✅ Connected: socket-id

## ⚙️ Environment

```env
VITE_SOCKET_URL=http://localhost:8080
```

## 📚 API Reference

### useSystemSocketStore

| Property/Method | Type | Description |
|----------------|------|-------------|
| `isConnected` | `boolean` | Connection status |
| `notifications` | `array` | Notification list |
| `unreadCount` | `number` | Unread count |
| `onlineUsers` | `Set` | Online user IDs |
| `isUserOnline(userId)` | `function` | Check if user online |
| `markAsRead(id)` | `function` | Mark notification as read |
| `markAllAsRead()` | `function` | Mark all as read |

### useChatSocketStore

| Property/Method | Type | Description |
|----------------|------|-------------|
| `isConnected` | `boolean` | Connection status |
| `activeConversationId` | `string` | Current conversation |
| `joinConversation(id)` | `function` | Join conversation |
| `leaveConversation(id)` | `function` | Leave conversation |
| `sendMessage(id, content)` | `function` | Send message |
| `getMessages(id)` | `function` | Get messages (incl. pending) |
| `startTyping(id)` | `function` | Start typing indicator |
| `stopTyping(id)` | `function` | Stop typing |
| `getTypingUsers(id)` | `function` | Get typing users Set |

## ✅ That's it!

Sockets tự động hoạt động. Chỉ cần import stores và sử dụng!
