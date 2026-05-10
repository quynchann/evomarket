# API Service Usage Guide - TanStack Query

## 📦 Import Options

### Option 1: Named Exports (Recommended - Modern)
```javascript
import { authApi, sellerApi, queryKeys, queryFunctions } from '@/services/api'
```

### Option 2: Default Export (Backward Compatible)
```javascript
import api from '@/services/api'
// Use: api.auth.login(), api.seller.listProducts()
```

---

## 🔐 Authentication APIs

### Register
```javascript
import { authApi } from '@/services/api'
import { useMutation } from '@tanstack/react-query'

const registerMutation = useMutation({
  mutationFn: (data) => authApi.register(data),
  onSuccess: (response) => {
    console.log('Registered:', response.data)
  }
})

// Usage
registerMutation.mutate({
  email: 'user@example.com',
  password: 'password123',
  fullname: 'John Doe',
  role: 'buyer' // or 'seller'
})
```

### Login
```javascript
const loginMutation = useMutation({
  mutationFn: (credentials) => authApi.login(credentials),
  onSuccess: (response) => {
    // Save token to store
    setAuth(response.data.accessToken, response.data.user)
  }
})

loginMutation.mutate({
  email: 'user@example.com',
  password: 'password123'
})
```

### Get Current User (with TanStack Query)
```javascript
import { useQuery } from '@tanstack/react-query'
import { queryKeys, queryFunctions } from '@/services/api'

const { data: user, isLoading } = useQuery({
  queryKey: queryKeys.me,
  queryFn: queryFunctions.getMe,
  enabled: isAuthenticated // only fetch if logged in
})
```

---

## 🛍️ Seller APIs

### List Categories (with TanStack Query)
```javascript
import { useQuery } from '@tanstack/react-query'
import { queryKeys, queryFunctions } from '@/services/api'

const { data: categories, isLoading } = useQuery({
  queryKey: queryKeys.sellerCategories,
  queryFn: queryFunctions.getSellerCategories
})
```

### List Products (with TanStack Query)
```javascript
const { data: products, isLoading, refetch } = useQuery({
  queryKey: queryKeys.sellerProducts,
  queryFn: queryFunctions.getSellerProducts
})
```

### Create Product
```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sellerApi, queryKeys } from '@/services/api'

const queryClient = useQueryClient()

const createProductMutation = useMutation({
  mutationFn: (productData) => sellerApi.createProduct(productData),
  onSuccess: () => {
    // Invalidate products list to refetch
    queryClient.invalidateQueries(queryKeys.sellerProducts)
  }
})

// Usage
createProductMutation.mutate({
  title: 'New Product',
  price: 100000,
  category_id: 1,
  // ... other fields
})
```

### Update Product
```javascript
const updateProductMutation = useMutation({
  mutationFn: ({ id, data }) => sellerApi.updateProduct(id, data),
  onSuccess: (response, variables) => {
    // Invalidate both list and single product
    queryClient.invalidateQueries(queryKeys.sellerProducts)
    queryClient.invalidateQueries(queryKeys.sellerProduct(variables.id))
  }
})

// Usage
updateProductMutation.mutate({
  id: 123,
  data: {
    title: 'Updated Title',
    price: 150000
  }
})
```

### Delete Product
```javascript
const deleteProductMutation = useMutation({
  mutationFn: (id) => sellerApi.deleteProduct(id),
  onSuccess: () => {
    queryClient.invalidateQueries(queryKeys.sellerProducts)
  }
})

// Usage
deleteProductMutation.mutate(productId)
```

### Upload Product Image
```javascript
const uploadImageMutation = useMutation({
  mutationFn: (file) => sellerApi.uploadProductImage(file)
})

// Usage
const handleFileChange = (e) => {
  const file = e.target.files[0]
  uploadImageMutation.mutate(file, {
    onSuccess: (response) => {
      const imageUrl = response.data.url
      console.log('Uploaded:', imageUrl)
    }
  })
}
```

---

## 🎯 Complete Component Example

```javascript
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sellerApi, queryKeys, queryFunctions } from '@/services/api'
import { toast } from 'sonner'

export const SellerProductManagement = () => {
  const queryClient = useQueryClient()

  // Fetch products
  const { 
    data: products, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: queryKeys.sellerProducts,
    queryFn: queryFunctions.getSellerProducts
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: sellerApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.sellerProducts)
      toast.success('Sản phẩm đã được tạo')
    },
    onError: (error) => {
      toast.error(error.message || 'Có lỗi xảy ra')
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sellerApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.sellerProducts)
      toast.success('Cập nhật thành công')
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: sellerApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.sellerProducts)
      toast.success('Đã xóa sản phẩm')
    }
  })

  const handleCreate = (data) => {
    createMutation.mutate(data)
  }

  const handleUpdate = (id, data) => {
    updateMutation.mutate({ id, data })
  }

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc muốn xóa?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <button onClick={() => handleUpdate(product.id, { title: 'New Title' })}>
            Update
          </button>
          <button onClick={() => handleDelete(product.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔄 Auto Token Refresh

Token refresh được xử lý tự động bởi `apiRequest`:

- Khi API trả về 401, hệ thống tự động gọi refresh token
- Các requests đang pending sẽ được queue lại
- Sau khi refresh thành công, tất cả requests được retry
- Nếu refresh thất bại, user bị logout tự động

---

## 🎨 Query Keys Structure

```javascript
export const queryKeys = {
  // Auth
  me: ['auth', 'me'],
  
  // Seller
  sellerCategories: ['seller', 'categories'],
  sellerProducts: ['seller', 'products'],
  sellerProduct: (id) => ['seller', 'products', id],
}
```

**Lợi ích:**
- Dễ invalidate queries
- Tránh typo
- Type-safe (khi dùng TypeScript)
- Dễ refactor

---

## ✨ Best Practices

### 1. Sử dụng optimistic updates
```javascript
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => sellerApi.updateProduct(id, data),
  onMutate: async ({ id, data }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(queryKeys.sellerProducts)
    
    // Snapshot previous value
    const previousProducts = queryClient.getQueryData(queryKeys.sellerProducts)
    
    // Optimistically update
    queryClient.setQueryData(queryKeys.sellerProducts, (old) => {
      return old.map(p => p.id === id ? { ...p, ...data } : p)
    })
    
    return { previousProducts }
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.sellerProducts, context.previousProducts)
  },
  onSettled: () => {
    queryClient.invalidateQueries(queryKeys.sellerProducts)
  }
})
```

### 2. Prefetch data
```javascript
const prefetchProducts = async () => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.sellerProducts,
    queryFn: queryFunctions.getSellerProducts
  })
}

// Call trước khi user navigate
<Link 
  to="/seller/products" 
  onMouseEnter={prefetchProducts}
>
  Products
</Link>
```

### 3. Sử dụng staleTime
```javascript
const { data } = useQuery({
  queryKey: queryKeys.sellerCategories,
  queryFn: queryFunctions.getSellerCategories,
  staleTime: 5 * 60 * 1000, // 5 minutes - categories ít thay đổi
})
```

---

## 🐛 Troubleshooting

### 401 Unauthorized loop
- Check xem refresh token có hợp lệ không
- Đảm bảo `credentials: 'include'` để gửi cookies

### Request không retry sau refresh
- Đảm bảo không pass `retry: false` vào options
- Check `isRefreshing` state

### Mutations không invalidate queries
- Đảm bảo dùng đúng queryKey
- Check xem `queryClient` đã được provide chưa

---

## 📝 Migration từ Class-based

### Before (Class-based)
```javascript
import api from '@/services/api'

const response = await api.seller.updateProduct(id, data)
```

### After (Named exports)
```javascript
import { sellerApi } from '@/services/api'

const response = await sellerApi.updateProduct(id, data)
```

**Backward compatible:** Code cũ vẫn hoạt động bình thường!

---

## 🚀 Next Steps

1. Tạo `cartApi` cho shopping cart
2. Tạo `orderApi` cho orders
3. Tạo `adminApi` cho admin features
4. Thêm TypeScript types cho tất cả APIs
