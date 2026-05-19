import { apiRequest, API_BASE_URL } from './apiRequest.js';

/**
 * Authentication APIs
 * Base path: /api-v1/auth
 */
export const authApi = {
  /**
   * Register new user (buyer or seller)
   */
  register: async ({ email, password, fullname, role }) => {
    return await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullname, role }),
      useAuth: false,
    });
  },

  /**
   * Login user
   */
  login: async ({ email, password }) => {
    return await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      useAuth: false,
    });
  },

  /**
   * Logout user
   */
  logout: async () => {
    return await apiRequest("/auth/logout", {
      method: "POST",
    });
  },

  /**
   * Refresh access token using refresh token in cookie
   */
  refreshToken: async () => {
    return await apiRequest("/auth/refresh-token", {
      method: "GET",
      useAuth: false,
    });
  },

  /**
   * Get current user profile
   */
  getMe: async () => {
    return await apiRequest("/auth/me", {
      method: "GET",
    });
  },

  /**
   * Cập nhật thông tin cá nhân (fullname, phone_number, birthday, gender)
   */
  updateProfile: async ({ fullname, phone_number, birthday, gender, shop_name }) => {
    return await apiRequest("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ fullname, phone_number, birthday, gender, shop_name }),
    });
  },

  /**
   * Đổi mật khẩu (cần mật khẩu hiện tại)
   */
  changePassword: async ({ current_password, new_password }) => {
    return await apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    });
  },

  /**
   * Upload avatar (multipart). Cập nhật user.avatar trên server và trả về user mới.
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const authStore = await import("../stores/useAuthStore.js");
    const { accessToken } = authStore.useAuthStore.getState();

    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: "POST",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
      credentials: "include",
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw {
        message: data.error?.message || data.message || "Upload avatar thất bại",
        code: data.error?.code,
        status: response.status,
      };
    }

    return data;
  },

  /**
   * Verify token
   */
  verifyToken: async () => {
    return await apiRequest("/auth/verify", {
      method: "GET",
    });
  },
};

// ==================== TANSTACK QUERY HELPERS ====================

/**
 * Query keys for TanStack Query
 */
export const authQueryKeys = {
  me: ['auth', 'me'],
  verify: ['auth', 'verify'],
};

/**
 * Query functions for TanStack Query
 */
export const authQueryFunctions = {
  /**
   * Get current user
   * Usage: useQuery({ queryKey: authQueryKeys.me, queryFn: authQueryFunctions.getMe })
   */
  getMe: async () => {
    const response = await authApi.getMe();
    return response.data;
  },

  /**
   * Verify token
   */
  verifyToken: async () => {
    const response = await authApi.verifyToken();
    return response.data;
  },
};

// Default export for convenience
export default authApi;
