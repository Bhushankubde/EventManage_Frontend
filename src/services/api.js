const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('eventdeco_token');

let isRefreshing = false;
let refreshPromise = null;

async function refreshToken() {
  const rt = localStorage.getItem('eventdeco_refresh_token');
  if (!rt) throw new Error('No refresh token available');
  
  const response = await fetch(`${API_BASE_URL}/auth/refreshtoken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  });
  
  if (!response.ok) throw new Error('Session expired');
  
  const json = await response.json();
  const data = json.data !== undefined ? json.data : json;
  
  const newToken = data.accessToken || data.token;
  localStorage.setItem('eventdeco_token', newToken);
  return newToken;
}

async function authFetch(url, options = {}) {
  let token = getAuthToken();
  
  const getHeaders = (t) => ({
    'Content-Type': 'application/json',
    ...(t && { Authorization: `Bearer ${t}` }),
    ...options.headers,
  });
  
  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: getHeaders(token),
  });
  
  if (response.status === 401 && !url.includes('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    
    try {
      token = await refreshPromise;
      // Retry request
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: getHeaders(token),
      });
    } catch (refreshErr) {
      // Refresh failed, user needs to login again
      localStorage.removeItem('eventdeco_token');
      localStorage.removeItem('eventdeco_refresh_token');
      localStorage.removeItem('eventdeco_user');
      window.location.href = '/auth';
      throw new Error('Session expired. Please log in again.');
    }
  }
  
  if (!response.ok) {
    let errorMsg = 'API request failed';
    try {
      const error = await response.json();
      errorMsg = error.message || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  
  // Return empty object for 204 No Content
  if (response.status === 204) return {};
  
  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Profile
  getCurrentUser: () =>
    authFetch('/users/me'),
    
  updateCurrentUser: (data) =>
    authFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  uploadAvatar: (formData) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        let errorMsg = 'Failed to upload avatar';
        try {
          const error = await response.json();
          errorMsg = error.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    });
  },

  // Auth
  login: (email, password) =>
    authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  register: (data) =>
    authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  // Categories
  getCategories: () =>
    authFetch('/categories'),
  createCategory: (data) =>
    authFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) =>
    authFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) =>
    authFetch(`/categories/${id}`, { method: 'DELETE' }),
    
  // Items
  getItems: (params) => {
    const query = new URLSearchParams();
    if (params?.categoryId && params.categoryId !== 'all') query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);
    
    return authFetch(`/items?${query.toString()}`);
  },
  getItemById: (id) =>
    authFetch(`/items/${id}`),
  createItem: (data) =>
    authFetch('/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) =>
    authFetch(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id) =>
    authFetch(`/items/${id}`, { method: 'DELETE' }),
  
  // Bookings
  getBookings: () =>
    authFetch('/bookings'),

  createBooking: (data) =>
    authFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBookingStatus: (id, status) =>
    authFetch(`/bookings/${id}/status?status=${status}`, {
      method: 'PUT',
    }),
    
  // Orders
  getOrders: () =>
    authFetch('/orders'),

  createOrder: (data) =>
    authFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Offline Sales
  getOfflineSales: () =>
    authFetch('/offline-sales'),

  createOfflineSale: (data) =>
    authFetch('/offline-sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Walk-in Customers
  getWalkInCustomers: () =>
    authFetch('/walk-in-customers'),

  createWalkInCustomer: (data) =>
    authFetch('/walk-in-customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  searchWalkInCustomerByPhone: (phone) =>
    authFetch(`/walk-in-customers/search?phone=${phone}`),

  // Admin Portal Extensions
  getDashboardStats: () =>
    authFetch('/admin/stats'),

  getAdminUsers: () =>
    authFetch('/admin/users'),

  updateUserRole: (id, role) =>
    authFetch(`/admin/users/${id}/role?role=${role}`, {
      method: 'PUT',
    }),

  deleteUser: (id) =>
    authFetch(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  getReviews: () =>
    authFetch('/admin/reviews'),

  deleteReview: (id) =>
    authFetch(`/admin/reviews/${id}`, {
      method: 'DELETE',
    }),

  getCoupons: () =>
    authFetch('/admin/coupons'),

  createCoupon: (data) =>
    authFetch('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCoupon: (id, data) =>
    authFetch(`/admin/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCoupon: (id) =>
    authFetch(`/admin/coupons/${id}`, {
      method: 'DELETE',
    }),

  getVendors: () =>
    authFetch('/admin/vendors'),

  createVendor: (data) =>
    authFetch('/admin/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVendor: (id, data) =>
    authFetch(`/admin/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteVendor: (id) =>
    authFetch(`/admin/vendors/${id}`, {
      method: 'DELETE',
    }),

  getNotifications: () =>
    authFetch('/admin/notifications'),

  createNotification: (data) =>
    authFetch('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markNotificationsRead: () =>
    authFetch('/admin/notifications/mark-read', {
      method: 'POST',
    }),

  deleteNotification: (id) =>
    authFetch(`/admin/notifications/${id}`, {
      method: 'DELETE',
    }),

  getCmsContent: () =>
    authFetch('/admin/cms'),

  saveCmsContent: (data) =>
    authFetch('/admin/cms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCmsContentByKey: (key) =>
    authFetch(`/admin/cms/${key}`),

  getActivityLogs: () =>
    authFetch('/admin/activity-logs'),

  getSystemSettings: () =>
    authFetch('/admin/settings'),

  saveSystemSetting: (data) =>
    authFetch('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cart
  getCart: () =>
    authFetch('/cart'),
  addToCart: (data) =>
    authFetch('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCartItemQuantity: (id, quantity) =>
    authFetch(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (id) =>
    authFetch(`/cart/${id}`, {
      method: 'DELETE',
    }),
  clearCart: () =>
    authFetch('/cart', {
      method: 'DELETE',
    }),
};

