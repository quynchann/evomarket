const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api-v1';

/**
 * Get all products with filters
 */
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.search) params.append('search', filters.search);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await fetch(`${API_URL}/products?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
};

/**
 * Get product detail by ID
 */
export const getProductById = async (productId) => {
  const response = await fetch(`${API_URL}/products/${productId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch product detail');
  }
  
  return response.json();
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  return response.json();
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId, filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);

  const response = await fetch(
    `${API_URL}/categories/${categoryId}/products?${params.toString()}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch products by category');
  }
  
  return response.json();
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit = 8) => {
  const response = await fetch(`${API_URL}/products/featured?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch featured products');
  }
  
  return response.json();
};

/**
 * Search products
 */
export const searchProducts = async (query, filters = {}) => {
  const params = new URLSearchParams({ q: query });
  
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

  const response = await fetch(`${API_URL}/products/search?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  
  return response.json();
};

const VISITOR_KEY = 'evm_shop_visit_vid';

/** Khóa ẩn danh cho đếm lượt xem shop (8–64 ký tự). */
export function getOrCreateVisitorKey() {
  try {
    let k = localStorage.getItem(VISITOR_KEY);
    if (k && /^[a-zA-Z0-9_-]{8,64}$/.test(k)) return k;
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    k = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 20);
    localStorage.setItem(VISITOR_KEY, k);
    return k;
  } catch {
    return `g${Date.now().toString(36)}x${Math.random().toString(36).slice(2, 12)}`;
  }
}

/**
 * Ghi nhận xem trang sản phẩm (cập nhật khách truy cập shop khi là lượt unique mới trong ngày).
 */
export async function trackProductView(productId, { accessToken, isBuyer } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const body = isBuyer ? {} : { visitorKey: getOrCreateVisitorKey() };
  const response = await fetch(`${API_URL}/products/${productId}/view`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || 'Failed to track view');
  }
  return response.json();
}
