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

/**
 * Ghi cache giỏ từ response API và kích hoạt refetch để header/sidebar luôn đồng bộ.
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {unknown} apiResult — body { success, data } hoặc đã unwrap { items, summary }
 */
export function syncCartQueryAfterMutation(queryClient, apiResult) {
  const nested = apiResult && typeof apiResult === "object" ? apiResult.data : null;
  const payload =
    nested && Array.isArray(nested.items) && nested.summary && typeof nested.summary === "object"
      ? nested
      : apiResult &&
          typeof apiResult === "object" &&
          Array.isArray(apiResult.items) &&
          apiResult.summary &&
          typeof apiResult.summary === "object"
        ? apiResult
        : null;
  if (payload) {
    queryClient.setQueryData(cartQueryKeys.cart, payload);
  }
  return queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart });
}

export const cartQueryFunctions = {
  getCart: async () => {
    const res = await cartApi.getCart();
    return res.data;
  },
};

export default cartApi;
