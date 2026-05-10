# API Services Architecture

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                       │
│  (Register, Login, ProductManagement, etc.)                 │
└────────────┬───────────────┬─────────────────┬──────────────┘
             │               │                 │
             ▼               ▼                 ▼
┌────────────────┐  ┌────────────────┐  ┌──────────────┐
│   authApi.js   │  │    api.js      │  │ productApi.js│
│                │  │  (Aggregator)  │  │   (Public)   │
│ - register()   │  │                │  │              │
│ - login()      │  │ - sellerApi    │  │ - getProducts│
│ - logout()     │  │ - queryKeys    │  │ - getProduct │
│ - getMe()      │  │ - queryFns     │  │ - categories │
│                │  │                │  │              │
│ Query helpers  │  │ Re-exports:    │  │              │
│ - keys         │  │ - authApi ──┐  │  │              │
│ - functions    │  │ - apiRequest│  │  │              │
└────────┬───────┘  └──────┬──────┘  └──────┬─────────┘
         │                 │                 │
         │                 │                 │
         └─────────┬───────┴─────────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  apiRequest.js   │
         │                  │
         │ Core HTTP Client │
         │ - Auto refresh   │
         │ - Queue requests │
         │ - Error handling │
         │ - Logout on fail │
         └─────────┬────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Backend APIs    │
         │ localhost:8080   │
         │  /api-v1/*       │
         └──────────────────┘
```

---

## 📦 Module Dependencies

### apiRequest.js (Base Layer)
```
apiRequest.js
├── No dependencies (base layer)
├── Imports dynamically:
│   └── useAuthStore (for token & logout)
└── Exports:
    ├── apiRequest()
    └── API_BASE_URL
```

### authApi.js (Auth Layer)
```
authApi.js
├── Depends on:
│   └── apiRequest.js
├── Exports:
│   ├── authApi (6 methods)
│   ├── authQueryKeys
│   └── authQueryFunctions
└── Used by:
    ├── useAuthStore
    ├── Register components
    ├── Login components
    └── Profile components
```

### api.js (Aggregator Layer)
```
api.js
├── Depends on:
│   ├── apiRequest.js
│   └── authApi.js
├── Defines:
│   ├── sellerApi
│   ├── queryKeys (seller)
│   └── queryFunctions (seller)
├── Re-exports:
│   ├── authApi
│   ├── authQueryKeys
│   ├── authQueryFunctions
│   ├── apiRequest
│   └── API_BASE_URL
└── Used by:
    ├── ProductManagement
    ├── Seller components
    └── Any component needing APIs
```

### productApi.js (Public Layer)
```
productApi.js
├── Independent module
├── Uses fetch() directly (no auth)
├── Exports:
│   └── productApi (6 methods)
└── Used by:
    ├── Home
    ├── ProductDetail
    └── Category pages
```

---

## 🔄 Data Flow Examples

### Example 1: User Login

```
┌─────────────┐
│ Login.jsx   │
│ Component   │
└──────┬──────┘
       │ 1. User clicks "Login"
       ▼
┌─────────────────┐
│ useAuthStore    │
│ login() action  │
└──────┬──────────┘
       │ 2. Calls authApi.login()
       ▼
┌─────────────────┐
│ authApi.js      │
│ login()         │
└──────┬──────────┘
       │ 3. Calls apiRequest()
       ▼
┌─────────────────┐
│ apiRequest.js   │
│ POST /auth/login│
└──────┬──────────┘
       │ 4. HTTP request
       ▼
┌─────────────────┐
│ Backend API     │
│ Verify & token  │
└──────┬──────────┘
       │ 5. Response
       ▼
┌─────────────────┐
│ useAuthStore    │
│ Save token+user │
└──────┬──────────┘
       │ 6. Success
       ▼
┌─────────────────┐
│ Navigate home   │
└─────────────────┘
```

### Example 2: Token Refresh Flow

```
┌──────────────────┐
│ Seller component │
│ requests products│
└────────┬─────────┘
         │ 1. GET /seller/products
         ▼
┌──────────────────┐
│ apiRequest()     │
│ Add Bearer token │
└────────┬─────────┘
         │ 2. Request with old token
         ▼
┌──────────────────┐
│ Backend          │
│ Returns 401      │
└────────┬─────────┘
         │ 3. Token expired!
         ▼
┌──────────────────┐
│ apiRequest()     │
│ Detect 401       │
│ isRefreshing=true│
└────────┬─────────┘
         │ 4. Call refreshAccessToken()
         ▼
┌──────────────────┐
│ useAuthStore     │
│ refreshToken()   │
└────────┬─────────┘
         │ 5. POST /auth/refresh-token
         ▼
┌──────────────────┐
│ Backend          │
│ New access token │
└────────┬─────────┘
         │ 6. Save new token
         ▼
┌──────────────────┐
│ apiRequest()     │
│ Process queue    │
│ Retry original   │
└────────┬─────────┘
         │ 7. Retry with new token
         ▼
┌──────────────────┐
│ Backend          │
│ Success 200      │
└────────┬─────────┘
         │ 8. Return data
         ▼
┌──────────────────┐
│ Component        │
│ Displays products│
└──────────────────┘
```

### Example 3: Seller Product CRUD

```
┌──────────────────────┐
│ ProductManagement    │
│ Component            │
└──────────┬───────────┘
           │ TanStack Query
           ▼
┌──────────────────────┐
│ useQuery({           │
│   queryKey:          │
│     queryKeys        │
│       .sellerProducts│
│   queryFn:           │
│     queryFunctions   │
│       .getSellerProd │
│ })                   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ queryFunctions       │
│ .getSellerProducts() │
└──────────┬───────────┘
           │ Unwraps response.data
           ▼
┌──────────────────────┐
│ sellerApi            │
│ .listProducts()      │
└──────────┬───────────┘
           │ POST request
           ▼
┌──────────────────────┐
│ apiRequest()         │
│ With auth & refresh  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Backend              │
│ Returns products     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Component renders    │
│ Product list         │
└──────────────────────┘
```

---

## 🎯 Import Strategy

### For Components:

```javascript
// ✅ Specific imports (Best for tree-shaking)
import { authApi } from '@/services/authApi'
import { sellerApi } from '@/services/api'
import { productApi } from '@/services/productApi'

// ✅ Grouped imports (Convenient)
import { 
  authApi, 
  sellerApi, 
  queryKeys 
} from '@/services/api'

// ❌ Avoid (Unless you need everything)
import * as api from '@/services/api'
```

### For Stores:

```javascript
// useAuthStore.js - Only needs auth
import { authApi } from '@/services/authApi'

// useCartStore.js - Only needs cart
import { cartApi } from '@/services/cartApi'
```

### For Query Hooks:

```javascript
// With query helpers (Recommended)
import { authQueryKeys, authQueryFunctions } from '@/services/authApi'

const { data } = useQuery({
  queryKey: authQueryKeys.me,
  queryFn: authQueryFunctions.getMe
})

// Manual (If you need custom logic)
import { authApi } from '@/services/authApi'

const { data } = useQuery({
  queryKey: ['auth', 'me'],
  queryFn: async () => {
    const res = await authApi.getMe()
    // Custom transform
    return { ...res.data, customField: 'value' }
  }
})
```

---

## 🔐 Security Flow

### Protected Endpoints:

```
Request → apiRequest() → Add Bearer token → Backend
                ↓
              401 Unauthorized
                ↓
         Refresh token flow
                ↓
         ┌─── Success ───┐
         │               │
    Retry with       Logout user
    new token        & clear data
```

### Token Storage:

```
┌──────────────┐
│ Access Token │ → Memory (Zustand store)
└──────────────┘   - Fast access
                   - Auto-cleared on close

┌──────────────┐
│Refresh Token │ → HttpOnly Cookie
└──────────────┘   - Secure
                   - Auto-sent by browser
                   - Cannot be accessed by JS
```

---

## 📈 Scalability Plan

### Adding New Features:

```
1. Create new API module
   └── cartApi.js, orderApi.js, adminApi.js

2. Export from api.js
   └── Maintain single entry point

3. Use in components
   └── Import directly or from api.js
```

### Example: Adding Cart API

```javascript
// 1. Create services/cartApi.js
export const cartApi = {
  getCart: async () => { ... },
  addToCart: async (productId, quantity) => { ... },
  updateQuantity: async (itemId, quantity) => { ... },
  removeItem: async (itemId) => { ... },
  clearCart: async () => { ... },
}

export const cartQueryKeys = {
  cart: ['cart'],
  cartCount: ['cart', 'count'],
}

export const cartQueryFunctions = {
  getCart: async () => {
    const res = await cartApi.getCart()
    return res.data
  },
}

// 2. Export from services/api.js
export { cartApi, cartQueryKeys, cartQueryFunctions } from './cartApi.js'

// Update default export
export default {
  auth: authApi,
  seller: sellerApi,
  cart: cartApi,
}

// 3. Use in components
import { cartApi, cartQueryKeys } from '@/services/api'

const { data: cart } = useQuery({
  queryKey: cartQueryKeys.cart,
  queryFn: cartQueryFunctions.getCart
})
```

---

## 🎨 Design Principles

### 1. **Separation of Concerns**
- Each module handles one domain
- apiRequest.js = HTTP client
- authApi.js = Authentication
- productApi.js = Public products
- Future: cartApi.js, orderApi.js, etc.

### 2. **Single Responsibility**
- Each function does one thing
- Small, focused modules
- Easy to test & maintain

### 3. **DRY (Don't Repeat Yourself)**
- apiRequest() used by all modules
- Query helpers reduce boilerplate
- Consistent error handling

### 4. **Progressive Enhancement**
- Backward compatible
- Old code still works
- New features don't break existing code

### 5. **Developer Experience**
- Clear import paths
- Auto-complete friendly
- Well documented
- Easy to find what you need

---

**Last Updated:** April 15, 2026
