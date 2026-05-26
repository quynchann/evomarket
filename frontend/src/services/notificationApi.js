import { apiRequest } from "./apiRequest.js";

export const notificationApi = {
  list: async ({ limit = 50, offset = 0 } = {}) => {
    const q = new URLSearchParams();
    q.set("limit", String(limit));
    q.set("offset", String(offset));
    return await apiRequest(`/notifications?${q.toString()}`, { method: "GET" });
  },

  unreadCount: async () => {
    return await apiRequest("/notifications/unread-count", { method: "GET" });
  },

  markRead: async (id) => {
    return await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
  },

  markAllRead: async () => {
    return await apiRequest("/notifications/read-all", { method: "PATCH" });
  },

  getSettings: async () => {
    return await apiRequest("/notifications/settings", { method: "GET" });
  },

  updateSettings: async (partial) => {
    return await apiRequest("/notifications/settings", {
      method: "PATCH",
      body: JSON.stringify(partial ?? {}),
    });
  },
};
