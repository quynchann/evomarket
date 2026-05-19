import { apiRequest } from "./apiRequest.js";

export const couponApi = {
  getPlatformCoupons: async () => {
    return await apiRequest("/coupons/platform", { method: "GET" });
  },

  getShopCoupons: async (sellerId) => {
    return await apiRequest(`/coupons/shop/${sellerId}`, { method: "GET" });
  },
};

export const couponQueryKeys = {
  platform: ["coupons", "platform"],
  shop: (sellerId) => ["coupons", "shop", sellerId],
};
