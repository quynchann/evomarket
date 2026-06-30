# Evo Market

Nền tảng thương mại điện tử đa vai trò (người mua, người bán, quản trị) tích hợp **thử đồ ảo WebAR** trên trình duyệt, thanh toán **VNPay**, chat thời gian thực và gợi ý sản phẩm theo thuật toán **UCB1**.

## Tính năng chính

### Người mua (Buyer)

- Duyệt, tìm kiếm và xem chi tiết sản phẩm theo danh mục
- Thử đồ ảo (kính, mũ, phụ kiện…) qua camera với **MindAR** + **A-Frame**
- Giỏ hàng, đặt hàng, thanh toán VNPay
- Quản lý đơn hàng, địa chỉ giao hàng, đánh giá sản phẩm
- Chat với người bán, nhận thông báo hệ thống
- Áp dụng mã giảm giá (platform / shop)

### Người bán (Seller)

- Quản lý sản phẩm, biến thể, tồn kho
- Cấu hình mô hình 3D cho tính năng thử đồ
- Xử lý đơn hàng, hoàn trả, hoàn tiền
- Tạo mã giảm giá riêng cho shop
- Báo cáo doanh thu, chat với khách hàng

### Quản trị (Admin)

- Tổng quan thống kê nền tảng
- Quản lý người dùng, sản phẩm, đơn hàng, đánh giá
- Tạo mã giảm giá toàn sàn
- Gửi thông báo hệ thống

## Công nghệ sử dụng


| Tầng          | Công nghệ                                                                 |
| ------------- | ------------------------------------------------------------------------- |
| Frontend      | React 19, Vite 7, React Router 7, TanStack Query, Zustand, Tailwind CSS 4 |
| WebAR         | A-Frame, MindAR Face                                                      |
| Backend       | Node.js, Express 5, Sequelize, Socket.IO                                  |
| Cơ sở dữ liệu | MySQL                                                                     |
| Thanh toán    | VNPay                                                                     |
| Lưu trữ ảnh   | Cloudinary                                                                |
| Xác thực      | JWT (access + refresh token, cookie)                                      |


## Cấu trúc dự án

```
evomarket/
├── backend/          # API REST + Socket.IO
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── models/
│       ├── migrations/
│       ├── seeders/
│       ├── routes/
│       ├── sockets/
│       └── database/   # db.dbml
│  
├── frontend/         # Ứng dụng React (Vite)
│   └── src/
│       ├── components/ # customer, seller, admin, tryon
│       ├── services/
│       └── stores/
└── README.md
```

## Yêu cầu hệ thống

- **Node.js** >= 18
- **npm** >= 9
- **MySQL** >= 8
- Tài khoản **Cloudinary** (upload ảnh sản phẩm / avatar)
- Tài khoản **VNPay Sandbox** (tùy chọn, cho thanh toán thử nghiệm)
- Trình duyệt hỗ trợ WebRTC (cho thử đồ AR)

## Cài đặt

### 1. Clone repository

```bash
git clone <url-repo>
cd evomarket
```

### 2. Cấu hình Backend

```bash
cd backend
npm install
cp .env.example .env
```

Chỉnh sửa file `backend/.env` theo môi trường của bạn. Các biến quan trọng:


| Biến                               | Mô tả                                             |
| ---------------------------------- | ------------------------------------------------- |
| `PORT`                             | Cổng API (mặc định `8080`)                        |
| `BASE_URL_FRONTEND`                | URL frontend — dùng redirect sau thanh toán VNPay |
| `DB_*`                             | Thông tin kết nối MySQL                           |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Khóa ký JWT                                       |
| `API_PUBLIC_BASE_URL`              | URL public của backend (không có `/api-v1`)       |
| `VNPAY_*`                          | Cấu hình cổng thanh toán VNPay                    |
| `CLOUDINARY_*`                     | Cloud name, API key, API secret                   |


Tạo database và chạy migration + seed:

```bash
npm run db:reset
```

> Lệnh `db:reset` sẽ **xóa và tạo lại** database, chạy toàn bộ migration và seed dữ liệu mẫu.

Chỉ seed lại dữ liệu (không drop DB):

```bash
npm run seed
```

### 3. Cấu hình Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Chỉnh `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api-v1
VITE_SOCKET_URL=http://localhost:8080
```

### 4. Chạy ứng dụng

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

API chạy tại: `http://localhost:8080`

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Giao diện chạy tại: `http://localhost:5173`

## Tài khoản mẫu (sau khi seed)

Mật khẩu chung: `12345678`


| Vai trò | Email                                                      |
| ------- | ---------------------------------------------------------- |
| Admin   | `admin@evomarket.com`                                      |
| Buyer   | `buyer1@test.com`, `buyer2@test.com`, `buyer3@test.com`    |
| Seller  | `seller1@test.com`, `seller2@test.com`, `seller3@test.com` |


## Đường dẫn ứng dụng


| Vai trò   | URL                                      |
| --------- | ---------------------------------------- |
| Người mua | `/customer/login` → `/customer/homepage` |
| Người bán | `/seller/login`                          |
| Quản trị  | `/admin/login`                           |
| Thử đồ AR | `/products/:id/try-on`                   |


## API

- Base URL: `http://localhost:8080/api-v1`
- Health check: `GET /api-v1/`

Các nhóm endpoint chính:


| Prefix                    | Mô tả                             |
| ------------------------- | --------------------------------- |
| `/auth`                   | Đăng ký, đăng nhập, refresh token |
| `/products`               | Sản phẩm, tìm kiếm, gợi ý UCB     |
| `/shops`                  | Hồ sơ shop người bán              |
| `/cart`, `/orders`        | Giỏ hàng, đặt hàng                |
| `/payments`               | Thanh toán VNPay                  |
| `/seller`                 | Quản lý phía người bán            |
| `/admin`                  | Quản lý phía admin                |
| `/chat`, `/notifications` | Chat & thông báo                  |


Socket.IO dùng chung cổng với backend (`VITE_SOCKET_URL`).

## Thanh toán VNPay

1. Đăng ký **Return URL** và **IPN URL** trên cổng VNPay:
  - Return: `{API_PUBLIC_BASE_URL}/api-v1/payments/vnpay/return`
  - IPN: `{API_PUBLIC_BASE_URL}/api-v1/payments/vnpay/ipn`
2. Đảm bảo `VITE_API_URL`, `API_PUBLIC_BASE_URL` và `BASE_URL_FRONTEND` khớp URL đã đăng ký.
3. Đặt `VNPAY_TEST_MODE=true` khi dùng sandbox.

## Build production

**Backend:**

```bash
cd backend
npm run production
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## Ghi chú phát triển

- Backend dùng **Babel** (`babel-node`) trong môi trường dev; production build qua `npm run build`.
- Upload ảnh yêu cầu cấu hình Cloudinary; nếu chưa cấu hình, API upload sẽ báo lỗi `CLOUDINARY_NOT_CONFIGURED`.
- Thuật toán gợi ý sản phẩm **UCB1** dựa trên bảng `product_impression_stats` (lượt hiển thị / click).

