# Tài Liệu Quy Chuẩn WebSockets (Socket.IO)

Tài liệu này quy định các nguyên tắc đặt tên (Naming Conventions) cho Room và Event trong toàn bộ hệ thống EvoMarket. Bắt buộc tuân thủ để đảm bảo tính nhất quán giữa Frontend và Backend.

## 1. Cấu Trúc Namespaces

Hệ thống sử dụng Multiplexing chia làm 2 Namespaces độc lập:

- `/system`: Quản lý trạng thái Online/Offline, và Thông báo (Notifications). Đóng vai trò là "Global Hub".
- `/chat`: Quản lý luồng tin nhắn giữa các User.

---

## 2. Quy Tắc Đặt Tên Room (Room Naming - Theo chuẩn Redis)

Mỗi Namespace có thể quản lý nhiều _Loại Phòng (Room Types)_ khác nhau.
Cú pháp: `[phân_loại]:[ID_tuỳ_chọn]`

| Namespace | Loại Phòng (Object Key) | Cú pháp Room        | Ví dụ thực tế      | Mục đích                                                  |
| :-------- | :---------------------- | :------------------ | :----------------- | :-------------------------------------------------------- |
| `/system` | `PERSONAL`              | `user:{id}`         | `user:123`         | Thông báo đích danh (Báo cho người dùng cụ thể)           |
| `/system` | `ROLE`                  | `role:{role}`       | `role:doctor`      | Thông báo tập thể (Báo cho toàn bộ seller hoặc customers) |
| `/system` | `GLOBAL`                | `system:global`     | `system:global`    | Báo bảo trì server cho tất cả mọi người.                  |
| `/chat`   | `CONVERSATION`          | `conversation:{id}` | `conversation:abc` | Gửi tin nhắn trong 1 cuộc hội thoại.                      |

---

## 3. Quy Tắc Đặt Tên Event (Event Naming)

Sử dụng định dạng: `[đối_tượng]:[hành_động]` (Snake case, toàn bộ viết thường).

- **Client Emit:** Dùng động từ nguyên mẫu (VD: `message:send`, `room:join`).
- **Server Emit:** Dùng động từ phân từ 2 / quá khứ / tính từ mô tả sự kiện đã xảy ra (VD: `message:new`).

### 3.1. Namespace: `/system`

| Event Name                   | Người Gửi | Mô tả / Payload                                  |
| :--------------------------- | :-------- | :----------------------------------------------- |
| `room:join`                  | Client    | Yêu cầu join vào personal room khi vừa connect.  |
| `presence:online`            | Server    | User đã kết nối (Bắn cho các user khác biết).    |
| `presence:offline`           | Server    | User đã ngắt kết nối hoàn toàn.                  |
| `notification:new`           | Server    | Thông báo hệ thống chung.                        |
| `notification:unread_update` | Server    | Bắn số lượng thông báo chưa đọc để update badge. |

### 3.2. Namespace: `/chat`

| Event Name     | Người Gửi | Mô tả / Payload                            |
| :------------- | :-------- | :----------------------------------------- |
| `room:join`    | Client    | Yêu cầu join vào phòng chat cụ thể.        |
| `room:leave`   | Client    | Yêu cầu rời khỏi phòng chat.               |
| `message:send` | Client    | Gửi 1 tin nhắn mới lên Server.             |
| `message:new`  | Server    | Bắn tin nhắn mới cho các user trong phòng. |
| `typing:start` | Client    | Bắt đầu gõ phím.                           |
| `typing:stop`  | Client    | Ngừng gõ phím.                             |
| `message:read` | Client    | Đánh dấu đã đọc tin nhắn.                  |

## 4. Best Practices (Quy tắc bắt buộc khi Code)

1. **Tuyệt đối không dùng hard-code (gõ text chay) cho Event/Room.**
2. Mọi chuỗi ký tự phải được tham chiếu từ file `socketConstants.ts` ở Frontend và file tương đương ở Backend.
3. Khi Backend bắt được sự kiện `disconnect` ở `/system`, phải check mảng onlineUsers để đảm bảo người dùng đã đóng tất cả các tab.
