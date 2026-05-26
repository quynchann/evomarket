# Đồng bộ số lượng sản phẩm trong kho (Stock Synchronization)

## Tổng quan
Hệ thống đã được cập nhật để đồng bộ số lượng sản phẩm còn trong kho giữa người bán và người mua, với cập nhật real-time khi có giao dịch mua/trả hàng.

## 🔧 Các thay đổi Backend

### 1. Socket Events (Real-time Updates)
**File: `backend/src/sockets/socket.constants.js`**
- Thêm event mới: `PRODUCT_STOCK_UPDATED` để thông báo khi stock thay đổi

**File: `backend/src/sockets/emitters/system.emitter.js`**
- Thêm hàm `emitProductStockUpdated()` để broadcast stock updates cho:
  - Tất cả clients đang xem sản phẩm (global)
  - Seller riêng (personal room) với flag `isSellerProduct: true`

### 2. Order Service Updates
**File: `backend/src/services/order.service.js`**

#### a. Cập nhật hàm `createOrder()` (dòng 504-533)
- Khi đặt hàng thành công, trừ stock và emit event
- Hỗ trợ cả sản phẩm có variant và không có variant
- Emit `PRODUCT_STOCK_UPDATED` sau khi transaction commit

#### b. Cập nhật hàm `restoreOrderInventory()` (dòng 117-161)
- Khi hủy đơn hoặc trả hàng, hoàn stock về kho
- Emit `PRODUCT_STOCK_UPDATED` sau khi hoàn stock
- Đảm bảo tính toán chính xác với variants

#### Các trường hợp trigger restore stock:
1. **Buyer hủy đơn** - `buyerCancelOrder()` (dòng 1264)
2. **Seller hủy đơn** - `updateOrderStatus()` (dòng 1095)
3. **Hoàn tiền trả hàng** - `sellerCompleteRefund()` (dòng 1418)

## 🎨 Các thay đổi Frontend

### 1. Socket Constants & Store
**File: `frontend/src/sockets/socket.constants.js`**
- Thêm event `PRODUCT_STOCK_UPDATED`

**File: `frontend/src/stores/useSystemSocketStore.js`**
- Thêm listener cho `PRODUCT_STOCK_UPDATED`
- Tự động invalidate queries:
  - `['product', productId]` - Chi tiết sản phẩm
  - `['public-products']` - Danh sách sản phẩm công khai
  - `['featured-products']` - Sản phẩm nổi bật
  - `['seller-products']` - Sản phẩm của seller (nếu là seller product)
- Update cache trực tiếp cho trang chi tiết sản phẩm

### 2. Product Detail Page (Buyer)
**File: `frontend/src/components/customer/ProductDetail.jsx`**
- Tự động refetch khi nhận stock update event từ socket
- Hiển thị số lượng còn lại trong kho (dòng 298-303)
- Giới hạn số lượng mua tối đa theo stock hiện tại (dòng 143, 320)
- Badge "HẾT HÀNG" khi stock = 0 (dòng 230-236)

### 3. Product Management Page (Seller)
**File: `frontend/src/components/seller/ProductManagement.jsx`**
- Cột "Tồn kho" hiển thị:
  - **Số lượng còn lại** (`available`) với màu:
    - 🟢 Xanh nếu > 0
    - 🔴 Đỏ nếu = 0
  - **Tổng số lượng** (`stock`) ở dưới
  - Tooltip hiển thị chi tiết: "Còn lại: X | Tổng: Y"
- Tự động refetch khi nhận event từ socket

## 📊 Luồng dữ liệu

### Khi đặt hàng thành công:
```
1. Buyer đặt hàng
   ↓
2. order.service.js: createOrder()
   - Kiểm tra stock đủ không
   - Trừ stock (available hoặc variant.stock)
   - Cộng sold
   ↓
3. Transaction commit
   ↓
4. Emit PRODUCT_STOCK_UPDATED event
   ↓
5. Socket broadcast đến:
   - Tất cả clients xem sản phẩm
   - Seller của sản phẩm
   ↓
6. Frontend nhận event
   - Invalidate queries
   - Update cache
   - UI tự động refetch & hiển thị số mới
```

### Khi hủy đơn / trả hàng:
```
1. Buyer/Seller hủy đơn HOẶC hoàn tiền trả hàng
   ↓
2. order.service.js: restoreOrderInventory()
   - Cộng stock (available hoặc variant.stock)
   - Trừ sold
   ↓
3. Transaction commit
   ↓
4. Emit PRODUCT_STOCK_UPDATED event
   ↓
5. Socket broadcast & Frontend update
   (giống flow đặt hàng)
```

## 🔍 Các trường hợp đặc biệt

### 1. Sản phẩm có Variant
- Mỗi variant có `stock` riêng
- Khi đặt hàng: trừ `variant.stock`, cộng `product.sold`
- Khi hoàn: cộng `variant.stock`, trừ `product.sold`

### 2. Sản phẩm không có Variant
- Dùng `product.available` làm stock
- Khi đặt hàng: trừ `available`, cộng `sold`
- Khi hoàn: cộng `available`, trừ `sold`

### 3. Validation
- **Khi đặt hàng**: Kiểm tra stock đủ không trước khi tạo order
- **Race condition**: Dùng `transaction.LOCK.UPDATE` để lock row khi update
- **Âm số**: Dùng `Math.max(0, ...)` để đảm bảo stock không âm

## 📱 Hiển thị cho User

### Buyer (Trang chi tiết sản phẩm)
```
Kho: Còn 45 sản phẩm  [màu xanh]
     Hết hàng          [màu đỏ]
```

### Seller (Trang quản lý sản phẩm)
```
Tồn kho:  45    [màu xanh - available]
         / 100  [màu xám - total stock]

Tooltip: "Còn lại: 45 | Tổng: 100"
```

## ✅ Checklist tính năng

- [x] Backend emit stock update event khi đặt hàng
- [x] Backend emit stock update event khi hủy đơn
- [x] Backend emit stock update event khi trả hàng
- [x] Frontend socket listener cho stock updates
- [x] Auto refetch product queries khi stock thay đổi
- [x] Hiển thị stock cho buyer (ProductDetail)
- [x] Hiển thị stock cho seller (ProductManagement)
- [x] Validation stock trước khi đặt hàng
- [x] Xử lý transaction lock để tránh race condition
- [x] Hỗ trợ cả variant và non-variant products

## 🚀 Test Scenarios

### Test 1: Đặt hàng thành công
1. Buyer xem sản phẩm (stock = 100)
2. Buyer đặt hàng 5 sản phẩm
3. ✅ Stock giảm xuống 95 real-time
4. ✅ Seller thấy stock update trong dashboard

### Test 2: Hủy đơn
1. Buyer đặt hàng 5 sản phẩm (stock = 100 → 95)
2. Buyer hủy đơn
3. ✅ Stock tăng lên 100 real-time

### Test 3: Trả hàng
1. Buyer đặt hàng (stock = 100 → 95)
2. Order hoàn tất → seller giao hàng
3. Buyer yêu cầu trả hàng
4. Seller chấp nhận và hoàn tiền
5. ✅ Stock tăng lên 100 real-time

### Test 4: Multiple buyers
1. Buyer A và B cùng xem sản phẩm (stock = 10)
2. Buyer A mua 5 sản phẩm
3. ✅ Buyer B thấy stock update thành 5 real-time
4. ✅ Buyer B không thể mua > 5 sản phẩm

## 📝 Notes
- Socket events sử dụng namespace `/system`
- Event được broadcast global (không cần join room riêng)
- Cache được update trực tiếp để tránh flicker
- Transaction afterCommit() đảm bảo emit sau khi data đã lưu
- Support cả buyer và seller socket connections
