import { apiRequest } from './apiRequest.js'

function toQuery(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const adminApi = {
  getStats: () => apiRequest('/admin/stats'),
  getOrders: (params) => apiRequest(`/admin/orders${toQuery(params)}`),
  getRevenue: (params) => apiRequest(`/admin/revenue${toQuery(params)}`),
  getUsers: (params) => apiRequest(`/admin/users${toQuery(params)}`),
  patchUserStatus: (id, account_status) =>
    apiRequest(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ account_status }),
    }),
  getProducts: (params) => apiRequest(`/admin/products${toQuery(params)}`),
  patchProductVisibility: (id, deleted) =>
    apiRequest(`/admin/products/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ deleted }),
    }),
  getReviews: (params) => apiRequest(`/admin/reviews${toQuery(params)}`),
  patchReview: (id, body) =>
    apiRequest(`/admin/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  getPlatformCoupons: () => apiRequest('/admin/coupons/platform'),
  createPlatformCoupon: (body) =>
    apiRequest('/admin/coupons/platform', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updatePlatformCoupon: (id, body) =>
    apiRequest(`/admin/coupons/platform/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deletePlatformCoupon: (id) =>
    apiRequest(`/admin/coupons/platform/${id}`, { method: 'DELETE' }),
  notifyByRole: (body) =>
    apiRequest('/admin/notifications/by-role', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
