# EVOMARKET DATABASE - SIMPLIFIED SCHEMA
## Đơn giản, Trực quan, Dễ hiểu

---

## 📊 TỔNG QUAN

**29 bảng** (đã xóa TryonModels)

```
👤 User Management      → 5 bảng
🛍️ Product Management   → 4 bảng  
🛒 Shopping             → 1 bảng
📦 Orders               → 3 bảng
💳 Payments             → 4 bảng
🚚 Shipping             → 3 bảng
⭐ Reviews              → 1 bảng
💰 Seller Management    → 4 bảng
💬 Communication        → 2 bảng
⚙️ Configuration        → 1 bảng
```

---

## 🎯 CÁC CẢI TIẾN ĐÃ ÁP DỤNG

### ✅ Đã thêm
- ✅ `Cart.seller_id` - Dễ group by seller khi checkout
- ✅ `Products.status` - active/inactive/out_of_stock
- ✅ `ProductVariants.sku` - Stock Keeping Unit
- ✅ `ProductVariants.price_adjustment` - Điều chỉnh giá variant
- ✅ `Categories.description, icon, display_order` - UI friendly
- ✅ `Coupons.max_discount_amount` - Giảm tối đa
- ✅ `Reviews.images` - Ảnh review
- ✅ `Reviews.seller_response` - Seller trả lời review
- ✅ `Payments.is_refunded` - Flag cho refund
- ✅ `Shipments.current_location` - Vị trí hiện tại
- ✅ `RevenueSettlement.status` - Pending/Settled/Paid
- ✅ `PlatformConfig.data_type` - Type safe config

### ❌ Đã xóa
- ❌ `TryonModels` - Tích hợp sau
- ❌ `Inventory` - Merge vào Products
- ❌ `UserPayments.account_number` - Bảo mật
- ❌ Data duplication

### 🔄 Đã đổi
- 🔄 `Products.quantity` VARCHAR → INTEGER (simplify)
- 🔄 `Payments.coupons_id` → `coupon_id` (consistency)
- 🔄 `OrderItems` columns renamed cho rõ ràng hơn
- 🔄 All timestamps đầy đủ

---

## 📋 BẢNG THEO CHỨC NĂNG

### 👤 USER MANAGEMENT

#### Users - Thông tin người dùng
```
✓ Hỗ trợ 3 roles: buyer, seller, admin
✓ Shop name cho seller
✓ Avatar, birthday, gender
✓ Notification preferences
```

#### RefreshTokens - JWT refresh tokens
```
✓ Token rotation
✓ Device tracking
✓ Revoke support
```

#### UserAddresses - Địa chỉ giao hàng
```
✓ Multiple addresses per user
✓ Default address flag
✓ Label (Nhà, Công ty)
```

#### UserPayments - Phương thức thanh toán
```
✓ Tokenized payment info (secure)
✓ VNPay, MoMo, ZaloPay support
✓ Last 4 digits only
```

#### user_notifications - Thông báo
```
✓ Order updates, promotions, messages
✓ Read/unread tracking
✓ Metadata for deep linking
```

---

### 🛍️ PRODUCT MANAGEMENT

#### Categories - Danh mục sản phẩm
```
✓ Icon, description
✓ Display order
✓ Search index
```

#### Products - Sản phẩm
```
✓ Stock management (total_stock, sold, available)
✓ Price + import_price
✓ Full-text search (title, description)
✓ Status: active/inactive/out_of_stock
✓ Soft delete
```

#### ProductVariants - Biến thể (Size, Color)
```
✓ SKU unique
✓ Price adjustment (±)
✓ Stock riêng cho mỗi variant
✓ Unique constraint (product + size + color)
```

#### Discounts - Khuyến mãi
```
✓ Percentage hoặc Fixed
✓ Time range
✓ Active/inactive flag
```

---

### 🛒 SHOPPING

#### Cart - Giỏ hàng
```
✓ User + Product + Variant
✓ seller_id để group khi checkout
✓ Unique constraint: không duplicate items
```

---

### 📦 ORDERS

#### Orders - Đơn hàng
```
Pricing:
  ├─ subtotal (tổng tiền hàng)
  ├─ shipping_fee
  ├─ discount_amount
  └─ total_price

Shipping Info (snapshot):
  ├─ fullname, email, phone
  └─ address

Status Flow:
  PENDING → CONFIRMED → SHIPPING → DELIVERED
                    ↓
                CANCELLED

Timestamps:
  ├─ created_at
  ├─ confirmed_at
  ├─ shipped_at
  ├─ delivered_at
  └─ cancelled_at
```

#### OrderItems - Chi tiết đơn hàng
```
Snapshot fields:
  ├─ product_title
  ├─ product_thumbnail
  ├─ variant_name
  ├─ unit_price
  ├─ import_price
  ├─ platform_fee_percent
  └─ platform_fee_amount

✓ Tách theo seller (multi-vendor)
✓ Giữ nguyên info khi product thay đổi
```

#### order_status_histories - Lịch sử thay đổi
```
✓ Track mọi thay đổi status
✓ Actor: buyer/seller/admin/system
✓ Timeline cho customer service
```

---

### 💳 PAYMENTS

#### Payments - Thanh toán
```
Methods:
  ├─ COD (Cash on Delivery)
  └─ Online (VNPay)

Status:
  ├─ Pending (đang xử lý)
  ├─ Success (thành công)
  └─ Failed (thất bại)

VNPay fields:
  ├─ transaction_no
  ├─ transaction_date
  └─ response_code

Refund:
  ├─ is_refunded (flag)
  ├─ refunded_at
  └─ refund_amount
```

#### Refunds - Hoàn tiền
```
✓ Link to Payment + Order
✓ Reason + admin note
✓ Status: Pending/Approved/Rejected
✓ Processed by (admin_id)
```

#### Coupons - Mã giảm giá
```
Types:
  ├─ Percentage (10%, 20%)
  └─ Fixed (50k, 100k)

Conditions:
  ├─ min_order_value (đơn tối thiểu)
  ├─ max_discount_amount (giảm tối đa)
  ├─ max_uses (số lần dùng)
  ├─ time range (start/end date)
  └─ new_user_only

Scope:
  ├─ seller_id NULL → Mã sàn (platform)
  └─ seller_id NOT NULL → Mã shop
```

#### CouponRedemptions - Lịch sử dùng coupon
```
✓ Track user đã dùng coupon nào
✓ Prevent duplicate usage
✓ Lưu discount_amount thực tế
```

---

### 🚚 SHIPPING

#### ShippingProviders - Đơn vị vận chuyển
```
Providers:
  ├─ Giao Hàng Nhanh (GHN)
  ├─ Giao Hàng Tiết Kiệm (GHTK)
  └─ VNPost

✓ Code để integrate API
✓ Active/inactive flag
```

#### Shipments - Đơn vận chuyển
```
Status Flow:
  Pending → Picked Up → In Transit → Delivered
                                  ↓
                              Failed

Tracking:
  ├─ tracking_number (unique)
  ├─ current_location
  ├─ estimated_delivery
  └─ timestamps
```

#### FailedShipments - Vận chuyển thất bại
```
Resolution:
  ├─ Rescheduled (giao lại)
  ├─ Returned (trả về)
  └─ Cancelled (hủy)
```

---

### ⭐ REVIEWS

#### Reviews - Đánh giá sản phẩm
```
✓ Rating 1-5 sao
✓ Comment + images
✓ Verified purchase (order_item_id NOT NULL)
✓ Seller response
✓ Report/moderation system
```

---

### 💰 SELLER MANAGEMENT

#### RevenueSettlement - Đối soát doanh thu
```
Calculation:
  gross_revenue (100k)
  - platform_fee (5k)
  = net_revenue (95k)

Status:
  Pending → Settled → Paid

✓ Link to specific order
✓ Timestamps for audit
```

#### Withdrawals - Rút tiền
```
✓ Bank info
✓ Status: Pending/Processing/Approved/Rejected
✓ Admin approval workflow
✓ Processed by tracking
```

#### SellerShopVisits - Lượt xem shop
```
✓ Unique per day per visitor
✓ visitor_key = hash(user_id or IP)
✓ Analytics dashboard
```

#### SellerShopFollows - Follow shop
```
✓ Follow/unfollow
✓ Notification cho seller
✓ Unique per seller-follower pair
```

---

### 💬 COMMUNICATION

#### Conversations - Cuộc hội thoại
```
✓ 1-1 chat giữa 2 users
✓ user1_id < user2_id (convention)
✓ last_message preview
```

#### Messages - Tin nhắn
```
Types:
  ├─ text
  ├─ image
  ├─ audio
  └─ file

✓ Read receipts
✓ Real-time support
```

---

### ⚙️ CONFIGURATION

#### PlatformConfig - Cấu hình hệ thống
```
Examples:
  ├─ platform_fee_percent: 5
  ├─ shipping_fee_default: 30000
  ├─ max_product_images: 10
  └─ maintenance_mode: false

✓ Key-value store
✓ Type safe (data_type field)
✓ No code deploy for config changes
```

---

## 🔗 QUAN HỆ CHÍNH

### User Hub (Users)
```
Users (trung tâm)
  ├─── RefreshTokens
  ├─── UserAddresses
  ├─── UserPayments
  ├─── user_notifications
  ├─── Cart
  ├─── Orders
  ├─── Reviews
  ├─── Conversations (x2)
  ├─── Messages
  ├─── Products (as seller)
  ├─── SellerShopVisits
  ├─── SellerShopFollows (x2)
  ├─── RevenueSettlement
  └─── Withdrawals
```

### Product Hub (Products)
```
Products
  ├─── ProductVariants (1-N)
  ├─── Discounts (1-N)
  ├─── Cart (N-M via users)
  ├─── OrderItems (1-N)
  └─── Reviews (1-N)
```

### Order Flow
```
Cart → Orders → OrderItems
              ├─ Payments → Refunds
              ├─ Shipments → FailedShipments
              ├─ Reviews
              ├─ order_status_histories
              ├─ RevenueSettlement
              └─ CouponRedemptions
```

---

## 🎨 INDEXES STRATEGY

### Tìm kiếm nhanh
```sql
✓ Products: FULLTEXT(title, description)
✓ Categories: name
✓ Coupons: code
```

### Join optimization
```sql
✓ Cart: (user_id, product_id, variant_id)
✓ OrderItems: order_id, seller_id
✓ Messages: (conversation_id, created_at)
```

### Filtering
```sql
✓ Orders: (user_id, status)
✓ Products: (seller_id, category_id, status)
✓ Reviews: (product_id, rating)
```

---

## 🔒 BẢO MẬT

### ✅ Đã áp dụng
- ✅ UserPayments: Chỉ lưu token, không lưu card info
- ✅ RefreshTokens: Revoke support
- ✅ Passwords: VARCHAR(255) cho bcrypt
- ✅ Reviews: Verified purchase only

### 📝 Cần implement
- 🔐 Hash RefreshTokens trước khi lưu
- 🔐 Rate limiting cho login
- 🔐 2FA optional
- 🔐 HTTPS only

---

## 📊 DATA FLOW

### Buyer Journey
```
1. Browse Products
   └─ Full-text search
   └─ Filter by category

2. Add to Cart
   └─ Check stock
   └─ Calculate price

3. Checkout
   └─ Select address
   └─ Apply coupon
   └─ Choose payment & shipping

4. Create Order
   └─ Generate OrderItems (snapshot)
   └─ Reduce stock
   └─ Create Payment record
   └─ Create Shipment

5. Track Order
   └─ order_status_histories
   └─ Shipment tracking

6. Receive & Review
   └─ Create Review (verified)
```

### Seller Journey
```
1. List Products
   └─ Set price, stock, variants
   └─ Upload images

2. Receive Orders
   └─ Check OrderItems for their shop
   └─ Update status: Confirmed

3. Ship Products
   └─ Update Shipment info
   └─ Tracking number

4. Revenue Settlement
   └─ Auto calculate when delivered
   └─ platform_fee deduction

5. Withdraw Money
   └─ Request withdrawal
   └─ Admin approval
```

---

## 💡 BEST PRACTICES

### Snapshot Pattern
```
✓ OrderItems: Lưu product info tại thời điểm đặt
✓ Orders: Lưu shipping info snapshot
✓ CouponRedemptions: Lưu discount_amount
→ Không bị ảnh hưởng khi master data thay đổi
```

### Soft Delete
```
✓ Products.deleted = TRUE
→ Giữ lại cho order history
→ Ẩn khỏi listing
```

### Status Tracking
```
✓ order_status_histories: Audit trail
✓ Timestamps: created_at, confirmed_at, shipped_at, delivered_at
→ Truy vết đầy đủ
```

### Foreign Keys
```
✓ Tất cả relationships đều có FK
✓ ON DELETE: Cẩn thận với CASCADE
→ Recommend: RESTRICT hoặc SET NULL
```

---

## 🚀 READY TO USE

File schema đã tạo:
- ✅ `database-schema-simplified.dbml`
  → Copy paste vào dbdiagram.io
  → Diagram tự động generate

Thay đổi so với version cũ:
- ❌ Xóa TryonModels
- ✅ Thêm các fields missing
- ✅ Sửa naming inconsistencies
- ✅ Optimize indexes
- ✅ Comments tiếng Việt đầy đủ

---

## 📖 NEXT STEPS

### Immediate (Week 1)
1. Review schema trên dbdiagram.io
2. Feedback & adjustments
3. Generate SQL migration scripts
4. Update Sequelize models

### Short term (Week 2-3)
1. Implement trong code
2. Seed data cho testing
3. API endpoints
4. Frontend integration

### Long term (Month 2+)
1. Optimize queries
2. Add analytics tables nếu cần
3. Scale considerations
4. TryonModels integration

---

*Schema Version: 2.0 - Simplified*
*Last Updated: 2026-06-03*
*Total Tables: 29 (Removed TryonModels)*
