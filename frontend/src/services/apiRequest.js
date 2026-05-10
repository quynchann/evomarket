const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api-v1";

/**
 * Shared state for token refresh queue
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Generic fetch wrapper with auto token refresh
 * 
 * @param {string} endpoint - API endpoint (e.g., "/auth/login")
 * @param {object} options - Fetch options
 * @param {boolean} retry - Whether to retry on 401 error
 * @returns {Promise<object>} Response data
 * 
 * Features:
 * - Auto token refresh on 401
 * - Request queuing during refresh
 * - Auto logout on refresh failure
 * - Error handling with consistent format
 */
export const apiRequest = async (endpoint, options = {}, retry = true) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  let headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if useAuth is not explicitly false
  if (options.useAuth !== false) {
    const authStore = await import("../stores/useAuthStore.js");
    const { accessToken } = authStore.useAuthStore.getState();
    
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  const config = {
    headers,
    credentials: "include",
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 - Unauthorized (token expired)
      if (response.status === 401 && retry && options.useAuth !== false) {
        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return apiRequest(endpoint, options, false);
            })
            .catch((err) => {
              throw err;
            });
        }

        isRefreshing = true;

        try {
          // Try to refresh token
          const authStore = await import("../stores/useAuthStore.js");
          const newAccessToken = await authStore.useAuthStore.getState().refreshAccessToken();
          processQueue(null, newAccessToken);
          isRefreshing = false;
          // Retry original request with new token
          return apiRequest(endpoint, options, false);
        } catch (refreshError) {
          // Refresh failed - logout user
          processQueue(refreshError, null);
          isRefreshing = false;
          
          const authStore = await import("../stores/useAuthStore.js");
          authStore.useAuthStore.getState().logout();
          
          throw refreshError;
        }
      }

      // Throw error with consistent format
      throw {
        message: data.error?.message || "Something went wrong",
        code: data.error?.code,
        status: response.status,
        details: data.error?.details,
      };
    }

    return data;
  } catch (error) {
    // Re-throw if already in our format
    if (error.message && error.code) {
      throw error;
    }
    // Convert network errors to our format
    throw {
      message: error.message || "Network error",
      code: "NETWORK_ERROR",
      status: 0,
    };
  }
};

// Export API_BASE_URL for use in other files (e.g., file uploads)
export { API_BASE_URL };
