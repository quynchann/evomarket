import { apiRequest } from './apiRequest.js'

/**
 * Checkout APIs
 */
export const checkoutApi = {
  // Get user addresses
  getAddresses: async () => {
    return await apiRequest('/addresses', { method: 'GET' })
  },

  // Create new address
  createAddress: async (data) => {
    return await apiRequest('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update address
  updateAddress: async (id, data) => {
    return await apiRequest(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete address
  deleteAddress: async (id) => {
    return await apiRequest(`/addresses/${id}`, {
      method: 'DELETE',
    })
  },

  // Set default address
  setDefaultAddress: async (id) => {
    return await apiRequest(`/addresses/${id}/default`, {
      method: 'PATCH',
    })
  },

  // Create order from cart
  createOrder: async (orderData) => {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  },

  // Get shipping methods
  getShippingMethods: async () => {
    return await apiRequest('/shipping-methods', {
      method: 'GET',
    })
  },

  /** Tạo URL thanh toán VNPay cho đơn Online (sau khi POST /orders) */
  createVNPayUrl: async (orderId) => {
    return await apiRequest('/payments/vnpay/create-url', {
      method: 'POST',
      body: JSON.stringify({ orderId: Number(orderId) }),
    })
  },
}

export const checkoutQueryKeys = {
  addresses: ['addresses'],
  shippingMethods: ['shipping-methods'],
}

export default checkoutApi
