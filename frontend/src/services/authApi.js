import { apiRequest } from './apiRequest.js';

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
