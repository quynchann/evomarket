/**
 * Main API Service
 * This file aggregates all API modules
 */

// Import core request function
import { apiRequest, API_BASE_URL } from './apiRequest.js';

// Import and re-export auth APIs
export { 
  authApi, 
  authQueryKeys, 
  authQueryFunctions 
} from './authApi.js';

export {
  cartApi,
  cartQueryKeys,
  cartQueryFunctions,
} from './cartApi.js';

import { cartQueryFunctions } from './cartApi.js';

export { chatApi } from './chatApi.js';

// Re-export apiRequest for direct use
export { apiRequest, API_BASE_URL };

// ==================== SELLER APIs ====================

export const sellerApi = {
  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    
    const authStore = await import("../stores/useAuthStore.js");
    const { accessToken } = authStore.useAuthStore.getState();
    
    const response = await fetch(`${API_BASE_URL}/upload/product-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw {
        message: data.error?.message || "Upload failed",
        code: data.error?.code,
        status: response.status,
      };
    }
    
    return data;
  },

  listCategories: async () => {
    return await apiRequest("/seller/categories", { method: "GET" });
  },

  listProducts: async () => {
    return await apiRequest("/seller/products", { method: "GET" });
  },

  createProduct: async (payload) => {
    return await apiRequest("/seller/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateProduct: async (id, payload) => {
    return await apiRequest(`/seller/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteProduct: async (id) => {
    return await apiRequest(`/seller/products/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== TANSTACK QUERY KEYS ====================

export const queryKeys = {
  cart: ['cart'],
  // Seller
  sellerCategories: ['seller', 'categories'],
  sellerProducts: ['seller', 'products'],
  sellerProduct: (id) => ['seller', 'products', id],
};

// ==================== TANSTACK QUERY FUNCTIONS ====================

export const queryFunctions = {
  getCart: cartQueryFunctions.getCart,
  // Seller
  getSellerCategories: async () => {
    const response = await sellerApi.listCategories();
    return response.data;
  },
  
  getSellerProducts: async () => {
    const response = await sellerApi.listProducts();
    return response.data;
  },
};

// ==================== BACKWARD COMPATIBILITY ====================

// Import authApi for backward compatibility
import { authApi } from './authApi.js';
import { cartApi as cartApiDefault } from './cartApi.js';
import { chatApi } from './chatApi.js';

// Export default as legacy class-like object
export default {
  auth: authApi,
  cart: cartApiDefault,
  seller: sellerApi,
  chat: chatApi,
};
