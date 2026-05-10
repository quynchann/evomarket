# Frontend Socket.IO Implementation

Hệ thống Socket.IO frontend sử dụng Zustand stores để quản lý state và connections.

## 📁 Cấu Trúc

```
/src
├── sockets/
│   ├── socket.constants.js       # Constants (events, rooms, namespaces)
│   └── README.md                 # Tài liệu này
├── stores/
│   ├── useSystemSocketStore.js   # System socket store (notifications, presence)
│   └── useChatSocketStore.js     # Chat socket store (messages, typing)
├── hooks/
│   └── useSocketManager.js       # Hook tự động quản lý socket connections
└── components/
    └── SocketStatus.jsx          # Component hiển thị trạng thái socket
```

## 🚀 Quick Start

### 1. Setup Socket Manager trong App

```jsx
// src/App.jsx hoặc src/main.jsx
import { useSocketManager } from '@/hooks/useSocketManager'

function App() {
  // Tự động connect/disconnect sockets dựa trên authentication state
  useSocketManager()
  
  return (
    <Router>
      {/* Your routes */}
    </Router>
  )
}
```

### 2. Sử dụng System Socket (Notifications & Presence)

```jsx
import { useSystemSocketStore } from '@/stores/useSystemSocketStore'

function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    isConnected,
    markAsRead,
    markAllAsRead,
  } = useSystemSocketStore()

  return (
    <div className="relative">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
      
      {/* Dropdown notifications */}
      <div className="notifications-dropdown">
        {notifications.map(notif => (
          <div key={notif.id} onClick={() => markAsRead(notif.id)}>
            <h4>{notif.title}</h4>
            <p>{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### Check User Online Status

```jsx
function UserAvatar({ userId }) {
  const isOnline = useSystemSocketStore(state => state.isUserOnline(userId))
  
  return (
    <div className="relative">
      <img src={avatar} />
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  )
}
```

### 3. Sử dụng Chat Socket (Messages)

```jsx
import { useChatSocketStore } from '@/stores/useChatSocketStore'
import { useEffect, useState } from 'react'

function ChatBox({ conversationId }) {
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    getMessages,
    getTypingUsers,
    startTyping,
    stopTyping,
  } = useChatSocketStore()

  const [messageInput, setMessageInput] = useState('')
  const messages = getMessages(conversationId)
  const typingUsers = getTypingUsers(conversationId)

  // Join conversation khi component mount
  useEffect(() => {
    if (isConnected) {
      joinConversation(conversationId)
    }

    return () => {
      leaveConversation(conversationId)
    }
  }, [conversationId, isConnected])

  // Handle typing
  const handleInputChange = (e) => {
    setMessageInput(e.target.value)
    
    // Start typing indicator
    startTyping(conversationId)
    
    // Stop typing sau 3 giây không gõ
    clearTimeout(window.typingTimeout)
    window.typingTimeout = setTimeout(() => {
      stopTyping(conversationId)
    }, 3000)
  }

  // Send message
  const handleSend = () => {
    if (!messageInput.trim()) return
    
    sendMessage(conversationId, messageInput.trim())
    setMessageInput('')
    stopTyping(conversationId)
  }

  return (
    <div className="chat-box">
      {/* Messages */}
      <div className="messages">
        {messages.map(msg => (
          <div 
            key={msg.id || msg.tempId} 
            className={msg.sending ? 'sending' : ''}
          >
            <p>{msg.content}</p>
            {msg.sending && <span>Đang gửi...</span>}
          </div>
        ))}
        
        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            {typingUsers.size} người đang nhập...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-box">
        <input
          value={messageInput}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={handleSend}>Gửi</button>
      </div>
    </div>
  )
}
```

### 4. Load Messages từ API và Merge với Socket

```jsx
import { useChatSocketStore } from '@/stores/useChatSocketStore'
import { useQuery } from '@tanstack/react-query'
import apiService from '@/services/api'

function ChatConversation({ conversationId }) {
  const { setMessages } = useChatSocketStore()

  // Load messages từ API
  const { data: apiMessages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await apiService.messages.getMessages(conversationId)
      return response.data
    },
  })

  // Set messages vào store khi load xong
  useEffect(() => {
    if (apiMessages) {
      setMessages(conversationId, apiMessages)
    }
  }, [apiMessages, conversationId])

  // Sau đó lấy messages từ store (bao gồm cả real-time messages)
  const messages = useChatSocketStore(state => state.getMessages(conversationId))

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="messages">
      {messages.map(msg => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  )
}
```

## 📊 Socket Status Component

Hiển thị trạng thái kết nối trong UI:

```jsx
import { SocketStatus } from '@/components/SocketStatus'

function Header() {
  return (
    <header>
      <Logo />
      <Navigation />
      <SocketStatus /> {/* Tự động ẩn khi kết nối OK */}
    </header>
  )
}
```

Hoặc version chi tiết cho development:

```jsx
import { SocketStatusDetailed } from '@/components/SocketStatus'

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && <SocketStatusDetailed />}
    </>
  )
}
```

## 🎯 Best Practices

### 1. Cleanup Properly

```jsx
useEffect(() => {
  if (isConnected) {
    joinConversation(conversationId)
  }

  return () => {
    // ALWAYS cleanup
    leaveConversation(conversationId)
    stopTyping(conversationId)
  }
}, [conversationId, isConnected])
```

### 2. Handle Pending States

Messages có `sending: true` khi đang gửi:

```jsx
{message.sending && (
  <div className="text-xs text-gray-500">
    <Loader2 className="w-3 h-3 animate-spin" />
  </div>
)}
```

### 3. Optimistic UI Updates

Messages được hiển thị ngay lập tức với `tempId`, sau đó được replace bởi server message có `id` thực.

### 4. Memory Management

Clear messages khi không cần thiết:

```jsx
useEffect(() => {
  return () => {
    // Clear messages when leaving conversation list page
    chatSocket.clearConversationMessages(conversationId)
  }
}, [])
```

### 5. Error Handling

Socket stores tự động show toast errors. Bạn có thể handle thêm:

```jsx
const { error } = useSystemSocketStore()

if (error) {
  return <div className="error">Socket Error: {error}</div>
}
```

## 🔧 Advanced Usage

### Manual Connect/Disconnect

Mặc dù `useSocketManager` tự động quản lý, bạn có thể manual:

```jsx
const systemSocket = useSystemSocketStore()

// Manual connect
systemSocket.connect(accessToken)

// Manual disconnect
systemSocket.disconnect()
```

### Join Additional Rooms

```jsx
const systemSocket = useSystemSocketStore()

// Join thêm rooms (ví dụ: role-based rooms)
systemSocket.joinRooms(['role:seller', 'system:admin'])
```

### Selective State Subscriptions

Optimize re-renders bằng cách chỉ subscribe states cần thiết:

```jsx
// ❌ Bad: Subscribe toàn bộ store
const systemSocket = useSystemSocketStore()

// ✅ Good: Chỉ subscribe unreadCount
const unreadCount = useSystemSocketStore(state => state.unreadCount)
```

## 🐛 Troubleshooting

### Issue: Sockets không connect
- Check `.env` có `VITE_SOCKET_URL`
- Check user đã login chưa (`accessToken` có giá trị)
- Check console logs

### Issue: Duplicate messages
- Check `tempId` matching logic
- Đảm bảo không có duplicate listeners

### Issue: Memory leak
- Đảm bảo cleanup trong `useEffect`
- Clear messages khi không cần

## 📚 API Reference

### useSystemSocketStore

| Method | Parameters | Description |
|--------|-----------|-------------|
| `connect` | `(token: string)` | Connect to /system namespace |
| `disconnect` | `()` | Disconnect from /system |
| `joinRooms` | `(rooms: string[])` | Join additional rooms |
| `isUserOnline` | `(userId: string\|number)` | Check if user online |
| `markAsRead` | `(notificationId)` | Mark notification as read |
| `markAllAsRead` | `()` | Mark all as read |
| `clearNotifications` | `()` | Clear all notifications |

### useChatSocketStore

| Method | Parameters | Description |
|--------|-----------|-------------|
| `connect` | `(token: string)` | Connect to /chat namespace |
| `disconnect` | `()` | Disconnect from /chat |
| `joinConversation` | `(conversationId: string)` | Join conversation room |
| `leaveConversation` | `(conversationId: string)` | Leave conversation |
| `sendMessage` | `(conversationId, content, metadata?)` | Send message |
| `startTyping` | `(conversationId: string)` | Start typing indicator |
| `stopTyping` | `(conversationId: string)` | Stop typing indicator |
| `markMessageAsRead` | `(conversationId, messageId)` | Mark message as read |
| `getMessages` | `(conversationId: string)` | Get all messages (including pending) |
| `getTypingUsers` | `(conversationId: string)` | Get typing users Set |
| `setMessages` | `(conversationId, messages[])` | Set messages from API |
| `clearConversationMessages` | `(conversationId: string)` | Clear messages for memory |
