# SOFT DELETE IMPLEMENTATION GUIDE
## Hướng dẫn triển khai Soft Delete cho EvoMarket

---

## 📋 TỔNG QUAN

**Soft Delete** = Xóa mềm, không xóa thật khỏi database
- Đánh dấu `deleted = true` và `deleted_at = timestamp`
- Dữ liệu vẫn còn để audit, rollback, reference
- Ẩn khỏi queries thông thường

---

## ✅ CÁC BẢNG ĐÃ THÊM SOFT DELETE

### 1. Users ⭐
```sql
deleted: BOOLEAN DEFAULT false
deleted_at: TIMESTAMP NULL
```
**Lý do**: Giữ lại user history, orders, reviews

### 2. UserAddresses 📍
```sql
deleted: BOOLEAN DEFAULT false
deleted_at: TIMESTAMP NULL
```
**Lý do**: User có thể "xóa" rồi thêm lại địa chỉ cũ

### 3. Categories 📂
```sql
deleted: BOOLEAN DEFAULT false
deleted_at: TIMESTAMP NULL
```
**Lý do**: Products cần reference category history

### 4. Products 📦
```sql
deleted: BOOLEAN (đã có)
deleted_at: TIMESTAMP NULL (mới thêm)
```
**Lý do**: Orders cần product history, seller analytics

### 5. ProductVariants 🎨
```sql
deleted: BOOLEAN DEFAULT false
deleted_at: TIMESTAMP NULL
```
**Lý do**: OrderItems reference variants

### 6. Coupons 🎟️
```sql
deleted: BOOLEAN DEFAULT false
deleted_at: TIMESTAMP NULL
```
**Lý do**: Lịch sử sử dụng coupon, analytics

### 7. ShippingProviders 🚚
```sql
deleted: BOOLEAN DEFAULT false
deleted_at: TIMESTAMP NULL
```
**Lý do**: Shipment history, không mất data khi đổi provider

### 8. Reviews ⭐
```sql
deleted: BOOLEAN DEFAULT false
deleted_at: TIMESTAMP NULL
```
**Lý do**: Admin moderation, có thể restore review

---

## 🔧 CẬP NHẬT SEQUELIZE MODELS

### Cách 1: Sử dụng Sequelize paranoid (Recommended)

```javascript
// Example: User model
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // ... associations
    }
  }
  
  User.init(
    {
      fullname: DataTypes.STRING(100),
      email: {
        type: DataTypes.STRING(150),
        unique: true,
      },
      // ... other fields
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      underscored: true,
      updatedAt: false,
      
      // 🔥 Enable soft delete
      paranoid: true,
      deletedAt: 'deleted_at',
    }
  );
  
  return User;
};
```

### Cách 2: Manual Implementation

```javascript
// Example: Category model
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // ... associations
    }
  }
  
  Category.init(
    {
      name: DataTypes.STRING(100),
      description: DataTypes.TEXT,
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deleted_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'Categories',
      underscored: true,
      timestamps: false, // or true with created_at
      
      // Default scope: chỉ lấy records chưa xóa
      defaultScope: {
        where: { deleted: false }
      },
      scopes: {
        // Scope để lấy cả records đã xóa
        withDeleted: {
          where: {}
        },
        // Scope chỉ lấy records đã xóa
        onlyDeleted: {
          where: { deleted: true }
        }
      }
    }
  );
  
  return Category;
};
```

---

## 💻 SỬ DỤNG TRONG CODE

### 1. Sequelize Paranoid Mode

#### Xóa (soft delete)
```javascript
// Cách 1: destroy() - auto set deleted_at
await User.destroy({
  where: { id: 123 }
});

// Cách 2: instance method
const user = await User.findByPk(123);
await user.destroy();

// 🎯 Result: deleted_at = NOW()
```

#### Lấy data (exclude deleted)
```javascript
// Default: tự động exclude deleted
const users = await User.findAll();
// ✅ Chỉ lấy users chưa xóa

const user = await User.findByPk(123);
// ✅ Null nếu user đã xóa
```

#### Lấy cả deleted
```javascript
// Include deleted records
const allUsers = await User.findAll({
  paranoid: false
});

const user = await User.findByPk(123, {
  paranoid: false
});
```

#### Restore (khôi phục)
```javascript
await User.restore({
  where: { id: 123 }
});

// hoặc
const user = await User.findByPk(123, { paranoid: false });
await user.restore();

// 🎯 Result: deleted_at = NULL
```

#### Hard delete (xóa thật)
```javascript
await User.destroy({
  where: { id: 123 },
  force: true  // 🔥 Hard delete
});
```

---

### 2. Manual Soft Delete (với defaultScope)

#### Xóa
```javascript
// Cập nhật deleted flag
await Category.update(
  { 
    deleted: true, 
    deleted_at: new Date() 
  },
  { where: { id: 123 } }
);
```

#### Lấy data (exclude deleted)
```javascript
// Default scope tự động filter
const categories = await Category.findAll();
// ✅ Chỉ lấy categories chưa xóa
```

#### Lấy cả deleted
```javascript
const allCategories = await Category.scope('withDeleted').findAll();
```

#### Chỉ lấy deleted
```javascript
const deletedCategories = await Category.scope('onlyDeleted').findAll();
```

#### Restore
```javascript
await Category.update(
  { 
    deleted: false, 
    deleted_at: null 
  },
  { 
    where: { id: 123 },
    paranoid: false  // Bỏ qua defaultScope
  }
);
```

---

## 🎯 USE CASES

### Use Case 1: User xóa account

```javascript
// routes/user.js
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Soft delete user
    await User.destroy({
      where: { id: userId }
    });
    
    // Orders, Reviews vẫn giữ nguyên
    // Chỉ ẩn user khỏi listings
    
    res.json({ 
      message: 'Account deleted successfully',
      note: 'You can restore within 30 days'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Use Case 2: Seller xóa product

```javascript
// routes/product.js
router.delete('/:id', authSeller, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Soft delete
    await product.update({
      deleted: true,
      deleted_at: new Date(),
      status: 'inactive'
    });
    
    // OrderItems vẫn reference được product
    
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Use Case 3: Admin moderation - xóa review

```javascript
// routes/admin/review.js
router.delete('/reviews/:id', authAdmin, async (req, res) => {
  try {
    await Review.update(
      {
        deleted: true,
        deleted_at: new Date(),
        report_status: 'Reviewed'
      },
      { where: { id: req.params.id } }
    );
    
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin có thể restore
router.post('/reviews/:id/restore', authAdmin, async (req, res) => {
  try {
    await Review.update(
      {
        deleted: false,
        deleted_at: null
      },
      { 
        where: { id: req.params.id },
        paranoid: false 
      }
    );
    
    res.json({ message: 'Review restored' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Use Case 4: Cleanup job - hard delete sau 30 ngày

```javascript
// jobs/cleanup.js
const { Op } = require('sequelize');

async function cleanupDeletedRecords() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Hard delete users đã xóa > 30 ngày
  const deletedUsers = await User.findAll({
    where: {
      deleted_at: {
        [Op.lt]: thirtyDaysAgo
      }
    },
    paranoid: false
  });
  
  for (const user of deletedUsers) {
    console.log(`Hard deleting user ${user.id}`);
    await user.destroy({ force: true });
  }
  
  console.log(`Cleaned up ${deletedUsers.length} users`);
}

// Run daily
setInterval(cleanupDeletedRecords, 24 * 60 * 60 * 1000);
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Unique Constraints

```javascript
// ❌ Problem: email unique + soft delete
// User A: email="test@test.com", deleted=false
// User A deleted: email="test@test.com", deleted=true
// User B tries: email="test@test.com" → UNIQUE VIOLATION!

// ✅ Solution 1: Composite unique
ALTER TABLE Users ADD UNIQUE INDEX unique_email_not_deleted (email, deleted);

// ✅ Solution 2: Clear email khi delete
await user.update({
  email: `deleted_${user.id}_${user.email}`,
  deleted: true,
  deleted_at: new Date()
});

// ✅ Solution 3: Partial index (PostgreSQL)
CREATE UNIQUE INDEX unique_active_email 
ON Users(email) 
WHERE deleted = false;
```

### 2. Foreign Key References

```javascript
// Orders -> Users (user_id)
// Nếu User bị soft delete, Orders vẫn OK
// Nhưng JOIN cần cẩn thận:

// ❌ Bad: user null nếu deleted
const orders = await Order.findAll({
  include: [{ model: User, as: 'Buyer' }]
});

// ✅ Good: include deleted users
const orders = await Order.findAll({
  include: [{ 
    model: User, 
    as: 'Buyer',
    paranoid: false 
  }]
});
```

### 3. Count & Aggregations

```javascript
// Default scope ảnh hưởng count
const count = await Product.count();
// ✅ Chỉ đếm products chưa xóa

const totalCount = await Product.count({ paranoid: false });
// ✅ Đếm tất cả
```

---

## 📊 MIGRATION CHECKLIST

### Chạy Migration

```bash
# 1. Copy migration file
cp migration-add-soft-delete.js backend/src/migrations/20260603010000-add-soft-delete.js

# 2. Chạy migration
cd backend
npx sequelize-cli db:migrate

# 3. Kiểm tra
npx sequelize-cli db:migrate:status
```

### Update Models

```bash
# Update từng model file:
- ✅ user.js → add paranoid
- ✅ user_address.js → add paranoid
- ✅ category.js → add paranoid + defaultScope
- ✅ product.js → add paranoid (đã có deleted)
- ✅ product_variant.js → add paranoid
- ✅ coupon.js → add paranoid
- ✅ shipping_provider.js → add paranoid
- ✅ review.js → add paranoid
```

### Update Queries

```bash
# Kiểm tra toàn bộ code:
1. findAll() → OK (auto exclude deleted)
2. findByPk() → OK (auto exclude deleted)
3. count() → OK (auto exclude deleted)
4. Associations → Thêm paranoid: false nếu cần
```

---

## 🧪 TESTING

### Test Soft Delete

```javascript
// test/models/user.test.js
describe('User Soft Delete', () => {
  it('should soft delete user', async () => {
    const user = await User.create({
      email: 'test@test.com',
      password: 'password'
    });
    
    await user.destroy();
    
    const found = await User.findByPk(user.id);
    expect(found).toBeNull();
    
    const foundWithDeleted = await User.findByPk(user.id, { 
      paranoid: false 
    });
    expect(foundWithDeleted).not.toBeNull();
    expect(foundWithDeleted.deleted_at).not.toBeNull();
  });
  
  it('should restore deleted user', async () => {
    const user = await User.create({
      email: 'test2@test.com',
      password: 'password'
    });
    
    await user.destroy();
    await user.restore();
    
    const found = await User.findByPk(user.id);
    expect(found).not.toBeNull();
    expect(found.deleted_at).toBeNull();
  });
});
```

---

## 📈 PERFORMANCE

### Indexes

```sql
-- Đã thêm trong migration
CREATE INDEX idx_users_deleted ON Users(deleted);
CREATE INDEX idx_products_deleted ON Products(deleted);
-- etc...

-- Composite index cho queries phức tạp
CREATE INDEX idx_products_seller_deleted 
ON Products(seller_id, deleted, status);
```

### Query Optimization

```javascript
// ✅ Good: explicit deleted filter + index
const products = await Product.findAll({
  where: {
    seller_id: 123,
    deleted: false,
    status: 'active'
  }
});

// ❌ Bad: paranoid=false rồi filter
const products = await Product.findAll({
  where: {
    seller_id: 123,
    status: 'active'
  },
  paranoid: false
}).filter(p => !p.deleted);
```

---

## ✅ HOÀN TẤT

Soft delete đã được implement cho 8 bảng:
- [x] Users
- [x] UserAddresses
- [x] Categories
- [x] Products
- [x] ProductVariants
- [x] Coupons
- [x] ShippingProviders
- [x] Reviews

Migration sẵn sàng: `migration-add-soft-delete.js`
Schema updated: `database-schema-simplified.dbml`

---

*Last updated: 2026-06-03*
*Version: 2.1 - With Soft Delete*
