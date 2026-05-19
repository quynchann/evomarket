import { apiRequest } from "./apiRequest.js";

export const shopApi = {
  getShop: async (sellerId) => {
    return await apiRequest(`/shops/${sellerId}`, { method: "GET" });
  },

  getShopProducts: async (sellerId, { page = 1, limit = 12, sortBy } = {}) => {
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("limit", String(limit));
    if (sortBy) q.set("sortBy", sortBy);
    return await apiRequest(`/shops/${sellerId}/products?${q.toString()}`, {
      method: "GET",
      useAuth: false,
    });
  },

  follow: async (sellerId) => {
    return await apiRequest(`/shops/${sellerId}/follow`, { method: "POST" });
  },

  unfollow: async (sellerId) => {
    return await apiRequest(`/shops/${sellerId}/follow`, { method: "DELETE" });
  },
};
