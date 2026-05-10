import { apiRequest } from "./apiRequest.js";

/**
 * Buyer cart APIs (requires auth + buyer role)
 * Base: /api-v1/cart
 */
export const cartApi = {
  getCart: async () => {
    return await apiRequest("/cart", { method: "GET" });
  },

  addItem: async ({ productId, variantId = null, quantity }) => {
    return await apiRequest("/cart/items", {
      method: "POST",
      body: JSON.stringify({
        productId,
        variantId,
        quantity,
      }),
    });
  },

  updateItem: async (cartItemId, quantity) => {
    return await apiRequest(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (cartItemId) => {
    return await apiRequest(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    });
  },

  clearCart: async () => {
    return await apiRequest("/cart", { method: "DELETE" });
  },
};

export const cartQueryKeys = {
  cart: ["cart"],
};

export const cartQueryFunctions = {
  getCart: async () => {
    const res = await cartApi.getCart();
    return res.data;
  },
};

export default cartApi;
