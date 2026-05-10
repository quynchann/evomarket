# Socket Integration Guide - Frontend

Hướng dẫn tích hợp Socket.IO vào ứng dụng React.

## 📋 Checklist

- [x] ✅ Đã tạo `useSystemSocketStore.js` - System socket store (auto-connect)
- [x] ✅ Đã tạo `useChatSocketStore.js` - Chat socket store (auto-connect)
- [x] ✅ Đã có `socket.constants.js` - Constants được sync với backend
- [x] ✅ Auto-subscribe vào `useAuthStore` để tự động connect/disconnect

## 🚀 Setup trong 2 bước

### Bước 1: Không cần setup gì cả! 🎉

Stores đã **tự động** subscribe vào `useAuthStore`:
- ✅ Khi user **login** → Sockets tự động connect
- ✅ Khi user **logout** → Sockets tự động disconnect
- ✅ Khi app load với user đã login sẵn → Sockets tự động reconnect

**Bạn không cần gọi bất kỳ hook hay component nào!**

### Bước 2: Check Environment Variables

Đảm bảo file `.env` có:

```env
VITE_API_URL=http://localhost:8080/api-v1
VITE_SOCKET_URL=http://localhost:8080
```

## 🎯 Sử dụng trong Components

#### A. Hiển thị Notifications

```jsx
import { useSystemSocketStore } from '@/stores/useSystemSocketStore'

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useSystemSocketStore()

  return (
    <div className="relative">
      <BellIcon />
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
      
      {/* Dropdown notifications */}
      <div className="dropdown">
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

#### B. Chat Box

```jsx
import { useChatSocketStore } from '@/stores/useChatSocketStore'
import { useEffect, useState } from 'react'

function ChatBox({ conversationId }) {
  const {
    joinConversation,
    leaveConversation,
    sendMessage,
    getMessages,
  } = useChatSocketStore()

  const [input, setInput] = useState('')
  const messages = getMessages(conversationId)

  useEffect(() => {
    joinConversation(conversationId)
    return () => leaveConversation(conversationId)
  }, [conversationId])

  const handleSend = () => {
    sendMessage(conversationId, input)
    setInput('')
  }

  return (
    <div>
      {/* Messages */}
      {messages.map(msg => (
        <div key={msg.id || msg.tempId}>
          {msg.content}
          {msg.sending && <span>Đang gửi...</span>}
        </div>
      ))}
      
      {/* Input */}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleSend}>Gửi</button>
    </div>
  )
}
```

#### C. Online Status

```jsx
import { useSystemSocketStore } from '@/stores/useSystemSocketStore'

function UserAvatar({ userId }) {
  const isOnline = useSystemSocketStore(state => state.isUserOnline(userId))
  
  return (
    <div className="relative">
      <img src={avatar} />
      {isOnline && <span className="online-indicator" />}
    </div>
  )
}
```

## 📚 Xem Thêm

- **Full Documentation**: `src/sockets/README.md`
- **Example Components**: `src/components/examples/SocketExample.jsx`
- **API Reference**: Xem trong README.md

## 🔥 Features

### System Socket (`useSystemSocketStore`)
- ✅ **Auto-connect khi login** - Không cần gọi `connect()`
- ✅ **Auto-disconnect khi logout** - Không cần cleanup
- ✅ Real-time notifications với toast
- ✅ Online/offline presence tracking
- ✅ Unread count management
- ✅ Auto reconnection
- ✅ Lấy `accessToken` và `user` từ `useAuthStore`

### Chat Socket (`useChatSocketStore`)
- ✅ **Auto-connect khi login** - Không cần gọi `connect()`
- ✅ **Auto-disconnect khi logout** - Không cần cleanup
- ✅ Real-time messages
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Optimistic UI updates (pending messages)
- ✅ Multi-conversation support
- ✅ Auto reconnection và rejoin rooms
- ✅ Lấy `accessToken` và `user` từ `useAuthStore`

## 🐛 Troubleshooting

**Sockets không connect?**
- Check user đã login chưa (`useAuthStore.getState()` có `accessToken` và `user`)
- Check `.env` có `VITE_SOCKET_URL`
- Check console logs (tìm `[System Socket]` hoặc `[Chat Socket]`)
- Check backend đã chạy chưa

**Notifications không hiện?**
- Sockets tự động connect, không cần setup thêm
- Check backend đã emit events chưa
- Check console logs để debug

**Chat messages bị duplicate?**
- Bình thường! Store tự động deduplicate bằng `tempId` và `id`

**Muốn manual connect/disconnect?**
```jsx
// Bạn vẫn có thể manual nếu cần
const { connect, disconnect } = useSystemSocketStore()

// Manual connect
connect() // Tự động lấy token từ authStore

// Manual disconnect
disconnect()
```

## ⚙️ Cách Hoạt Động

### Flow tự động:

```
User Login
   ↓
useAuthStore updates
   ↓
useSystemSocketStore.subscribe() triggered
   ↓
Auto connect with accessToken from authStore
   ↓
✅ System Socket Connected
   ↓
useChatSocketStore.subscribe() triggered
   ↓  
Auto connect with accessToken from authStore
   ↓
✅ Chat Socket Connected
```

### Flow logout:

```
User Logout
   ↓
useAuthStore clears token & user
   ↓
useSystemSocketStore.subscribe() triggered
   ↓
Auto disconnect System Socket
   ↓
useChatSocketStore.subscribe() triggered
   ↓
Auto disconnect Chat Socket
   ↓
✅ All cleaned up
```

## 🎯 Next Steps

1. Customize toast notifications (sử dụng sonner)
2. Thêm sound effects cho notifications
3. Implement notification persistence (lưu vào localStorage)
4. Thêm các loại notifications khác (order, payment, etc.)
5. Implement chat features nâng cao (file upload, emoji, etc.)

---

Done! 🎉 Sockets đã tự động hoạt động khi user login!
