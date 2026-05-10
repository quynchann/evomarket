# API Services Structure

## 📁 File Organization

```
services/
├── apiRequest.js      # Core HTTP client with auto token refresh
├── authApi.js         # Authentication APIs
├── api.js            # Main aggregator (imports all modules)
├── productApi.js      # Public product APIs (existing)
├── API_USAGE_GUIDE.md
└── README.md         # This file
```

---

## 🎯 Import Guide

### Option 1: Import from specific modules (Recommended)

```javascript
// Auth APIs
import { authApi, authQueryKeys, authQueryFunctions } from '@/services/authApi'

// Seller APIs
import { sellerApi, queryKeys, queryFunctions } from '@/services/api'

// Core request function
import { apiRequest } from '@/services/apiRequest'

// Public product APIs
import { productApi } from '@/services/productApi'
```

### Option 2: Import from main aggregator

```javascript
// Everything in one import
import { 
  authApi, 
  sellerApi, 
  apiRequest,
  queryKeys,
  queryFunctions 
} from '@/services/api'
```

### Option 3: Backward compatible (Legacy)

```javascript
// Still works!
import api from '@/services/api'

api.auth.login(...)
api.seller.createProduct(...)
```

---

## 📦 Module Details

### 1. **apiRequest.js** - Core HTTP Client

The foundation for all API calls. Features:
- Auto token refresh on 401
- Request queuing during refresh
- Auto logout on refresh failure
- Consistent error format

**Exports:**
- `apiRequest(endpoint, options, retry)` - Generic fetch wrapper
- `API_BASE_URL` - Base API URL from env

**Usage:**
```javascript
import { apiRequest } from '@/services/apiRequest'

const response = await apiRequest('/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
  useAuth: true // default, set false for public endpoints
})
```

---

### 2. **authApi.js** - Authentication

All authentication-related APIs.

**Exports:**
- `authApi` - Auth API functions
- `authQueryKeys` - TanStack Query keys
- `authQueryFunctions` - TanStack Query functions

**APIs:**
```javascript
import { authApi } from '@/services/authApi'

// Register
await authApi.register({ email, password, fullname, role })

// Login
await authApi.login({ email, password })

// Logout
await authApi.logout()

// Get current user
await authApi.getMe()

// Refresh token
await authApi.refreshToken()

// Verify token
await authApi.verifyToken()
```

**TanStack Query:**
```javascript
import { useQuery } from '@tanstack/react-query'
import { authQueryKeys, authQueryFunctions } from '@/services/authApi'

// Get current user
const { data: user } = useQuery({
  queryKey: authQueryKeys.me,
  queryFn: authQueryFunctions.getMe,
  enabled: isAuthenticated
})
```

---

### 3. **api.js** - Main Aggregator

Combines all API modules.

**Exports:**
- All exports from `authApi.js`
- `sellerApi` - Seller APIs
- `queryKeys` - Seller query keys
- `queryFunctions` - Seller query functions
- `apiRequest` - Core request function
- `default` - Legacy object

**Seller APIs:**
```javascript
import { sellerApi } from '@/services/api'

// Upload product image
await sellerApi.uploadProductImage(file)

// List categories
await sellerApi.listCategories()

// List products
await sellerApi.listProducts()

// Create product
await sellerApi.createProduct(data)

// Update product
await sellerApi.updateProduct(id, data)

// Delete product
await sellerApi.deleteProduct(id)
```

**TanStack Query:**
```javascript
import { useQuery } from '@tanstack/react-query'
import { queryKeys, queryFunctions } from '@/services/api'

// Get seller products
const { data: products } = useQuery({
  queryKey: queryKeys.sellerProducts,
  queryFn: queryFunctions.getSellerProducts
})
```

---

### 4. **productApi.js** - Public Product APIs

Public APIs for browsing products (no auth required).

**Existing file - unchanged**

```javascript
import { productApi } from '@/services/productApi'

// Get products
await productApi.getProducts({ categoryId, search, page })

// Get product by ID
await productApi.getProductById(id)

// Get categories
await productApi.getCategories()

// Get featured products
await productApi.getFeaturedProducts()

// Search products
await productApi.searchProducts(query)
```

---

## 🔄 Migration from Old Structure

### Before (Single file):
```javascript
// services/api.js (248 lines)
class ApiService { ... }
export default new ApiService()
```

### After (Modular):
```javascript
// services/apiRequest.js  (117 lines) - Core
// services/authApi.js     (90 lines)  - Auth
// services/api.js         (120 lines) - Aggregator + Seller
```

**Benefits:**
- ✅ Easier to maintain
- ✅ Better code organization
- ✅ Smaller file sizes
- ✅ Easier to find APIs
- ✅ Better tree-shaking
- ✅ Still backward compatible!

---

## 📝 Adding New API Modules

### Step 1: Create new file (e.g., `cartApi.js`)

```javascript
import { apiRequest } from './apiRequest.js';

export const cartApi = {
  getCart: async () => {
    return await apiRequest("/cart", { method: "GET" });
  },

  addToCart: async (productId, quantity) => {
    return await apiRequest("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // ... more methods
};

export const cartQueryKeys = {
  cart: ['cart'],
  cartItem: (id) => ['cart', 'items', id],
};

export const cartQueryFunctions = {
  getCart: async () => {
    const response = await cartApi.getCart();
    return response.data;
  },
};

export default cartApi;
```

### Step 2: Export from `api.js`

```javascript
// In api.js
export { cartApi, cartQueryKeys, cartQueryFunctions } from './cartApi.js';

// Update default export
export default {
  auth: authApi,
  seller: sellerApi,
  cart: cartApi, // Add here
};
```

### Step 3: Use in components

```javascript
import { cartApi } from '@/services/cartApi'
// or
import { cartApi } from '@/services/api'

await cartApi.addToCart(productId, 1)
```

---

## 🧪 Testing

### Test auth APIs:
```javascript
import { authApi } from '@/services/authApi'

// Register
const response = await authApi.register({
  email: 'test@example.com',
  password: '12345678',
  fullname: 'Test User',
  role: 'buyer'
})
console.log(response.data)
```

### Test with TanStack Query:
```javascript
import { useQuery } from '@tanstack/react-query'
import { authQueryKeys, authQueryFunctions } from '@/services/authApi'

const MyComponent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: authQueryKeys.me,
    queryFn: authQueryFunctions.getMe
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return <div>Hello, {data.fullname}</div>
}
```

---

## 🎨 Best Practices

### 1. Use specific imports
```javascript
// ✅ Good
import { authApi } from '@/services/authApi'

// ❌ Avoid (unless you need everything)
import * as api from '@/services/api'
```

### 2. Use query helpers with TanStack Query
```javascript
// ✅ Good
const { data } = useQuery({
  queryKey: authQueryKeys.me,
  queryFn: authQueryFunctions.getMe
})

// ❌ Avoid (manual wrapping)
const { data } = useQuery({
  queryKey: ['auth', 'me'],
  queryFn: async () => {
    const res = await authApi.getMe()
    return res.data
  }
})
```

### 3. Handle errors consistently
```javascript
try {
  await authApi.login({ email, password })
} catch (error) {
  // error.message - Human readable message
  // error.code - Error code for logic
  // error.status - HTTP status code
  // error.details - Validation details (if any)
  console.error(error.message)
}
```

---

## 🔐 Security Notes

- All protected endpoints automatically include JWT token
- Token refresh happens automatically on 401
- User is logged out if refresh fails
- Use `useAuth: false` for public endpoints only

---

## 📚 Further Reading

- `API_USAGE_GUIDE.md` - Complete usage guide
- `MIGRATION_TO_NAMED_EXPORTS.md` - Migration guide
- Backend API docs - Check backend documentation

---

**Last updated:** April 15, 2026
