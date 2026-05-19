import { apiRequest } from "./apiRequest.js";

export const orderApi = {
  listMine: async ({ page = 1, limit = 20, status } = {}) => {
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("limit", String(limit));
    if (status) q.set("status", status);
    return await apiRequest(`/orders?${q.toString()}`, { method: "GET" });
  },

  getById: async (id) => {
    return await apiRequest(`/orders/${id}`, { method: "GET" });
  },

  /** GET /seller/orders — luôn 20 đơn/trang (backend cố định) */
  sellerList: async ({ page = 1, status } = {}) => {
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("limit", "20");
    if (status) q.set("status", status);
    return await apiRequest(`/seller/orders?${q.toString()}`, { method: "GET" });
  },

  sellerOrderCounts: async () => {
    return await apiRequest("/seller/orders/counts", { method: "GET" });
  },

  /** GET /seller/stats/today — doanh thu / đơn / khách (theo ngày server DB) */
  sellerTodayStats: async () => {
    return await apiRequest("/seller/stats/today", { method: "GET" });
  },

  updateStatus: async (orderId, body) => {
    return await apiRequest(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  confirmDelivery: async (orderId) => {
    return await apiRequest(`/orders/${orderId}/confirm-delivery`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  requestReturn: async (orderId, note) => {
    return await apiRequest(`/orders/${orderId}/request-return`, {
      method: "POST",
      body: JSON.stringify({ note: note || undefined }),
    });
  },

  cancelOrder: async (orderId, note) => {
    return await apiRequest(`/orders/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ note: note || undefined }),
    });
  },

  sellerAcceptReturn: async (orderId) => {
    return await apiRequest(`/seller/orders/${orderId}/accept-return`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  sellerRejectReturn: async (orderId) => {
    return await apiRequest(`/seller/orders/${orderId}/reject-return`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  sellerCompleteRefund: async (orderId) => {
    return await apiRequest(`/seller/orders/${orderId}/complete-refund`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
};
