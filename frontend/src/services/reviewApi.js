import { apiRequest } from "./apiRequest.js";

export const reviewApi = {
  /**
   * POST /reviews — buyer (một lần / order_item, không chỉnh sau khi gửi).
   * Body: { order_item_id, rating (1-5), comment?: string }
   */
  create: async ({ order_item_id, rating, comment }) => {
    return apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify({
        order_item_id,
        rating,
        comment: comment ?? undefined,
      }),
    });
  },

  /** GET /products/:id/reviews — public */
  listByProduct: async (productId, { page = 1, limit = 10 } = {}) => {
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("limit", String(limit));
    return apiRequest(`/products/${productId}/reviews?${q.toString()}`, {
      method: "GET",
    });
  },
};
