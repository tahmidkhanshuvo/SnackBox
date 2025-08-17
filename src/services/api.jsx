// src/services/Api.jsx
"use client";

import { projectId, publicAnonKey } from '../../utils/info';



class ApiService {
  constructor() {
    this.baseURL = `https://${projectId}.supabase.co/functions/v1/make-server-bd12b0df/api`;
    this.token = this.getStoredToken();
  }

  // Get stored authentication token
  getStoredToken() {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return currentUser.token || null;
    } catch {
      return null;
    }
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
  }

  // Create request headers
  createHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(method, endpoint, data = null, requireAuth = false) {
    try {
      const config = {
        method,
        headers: this.createHeaders(requireAuth)
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`API ${method} ${endpoint} error:`, error);
      throw error;
    }
  }

  // Shortcut methods
  get(endpoint, requireAuth = false) {
    return this.request('GET', endpoint, null, requireAuth);
  }

  post(endpoint, data, requireAuth = false) {
    return this.request('POST', endpoint, data, requireAuth);
  }

  put(endpoint, data, requireAuth = true) {
    return this.request('PUT', endpoint, data, requireAuth);
  }

  delete(endpoint, requireAuth = true) {
    return this.request('DELETE', endpoint, null, requireAuth);
  }
}

// Singleton instance
const apiService = new ApiService();

// ------------------ Auth API ------------------
export const authAPI = {
  register: (userData) => apiService.post('/auth/register', userData),
  login: (credentials) => apiService.post('/auth/login', credentials),
  logout: () => apiService.post('/auth/logout', {}, true),
  getProfile: () => apiService.get('/auth/me', true),
  checkHealth: () => apiService.get('/auth/health')
};

// ------------------ Customer API ------------------
export const customerAPI = {
  getDashboard: () => apiService.get('/customer/dashboard', true),
  getMenu: () => apiService.get('/customer/menu', true),
  getMenuCategories: () => apiService.get('/customer/menu/categories', true),
  getMenuItems: (categoryId) => apiService.get(`/customer/menu/items/${categoryId}`, true),
  getOrders: () => apiService.get('/customer/orders', true),
  createOrder: (orderData) => apiService.post('/customer/orders', orderData, true),
  getOrder: (orderId) => apiService.get(`/customer/orders/${orderId}`, true),
  getReservations: () => apiService.get('/customer/reservations', true),
  createReservation: (reservationData) => apiService.post('/customer/reservations', reservationData, true),
  getProfile: () => apiService.get('/customer/profile', true),
  updateProfile: (profileData) => apiService.put('/customer/profile', profileData, true)
};

// ------------------ Staff API ------------------
export const staffAPI = {
  getDashboard: () => apiService.get('/staff/dashboard', true),
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/staff/orders${queryString ? `?${queryString}` : ''}`, true);
  },
  updateOrderStatus: (orderId, statusData) => apiService.put(`/staff/orders/${orderId}/status`, statusData, true),
  getOrder: (orderId) => apiService.get(`/staff/orders/${orderId}`, true),
  getKitchenQueue: () => apiService.get('/staff/kitchen/queue', true),
  completeOrder: (orderId) => apiService.post(`/staff/kitchen/complete/${orderId}`, {}, true),
  getComplaints: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/staff/complaints${queryString ? `?${queryString}` : ''}`, true);
  },
  updateComplaint: (complaintId, updateData) => apiService.put(`/staff/complaints/${complaintId}`, updateData, true),
  getSchedule: (date) => apiService.get(`/staff/schedule${date ? `?date=${date}` : ''}`, true),
  getProfile: () => apiService.get('/staff/profile', true),
  updateProfile: (profileData) => apiService.put('/staff/profile', profileData, true)
};

// ------------------ Manager API ------------------
export const managerAPI = {
  getDashboard: () => apiService.get('/manager/dashboard', true),

  // Menu
  getMenu: () => apiService.get('/manager/menu', true),
  createCategory: (categoryData) => apiService.post('/manager/menu/categories', categoryData, true),
  createMenuItem: (itemData) => apiService.post('/manager/menu/items', itemData, true),
  updateMenuItem: (itemId, itemData) => apiService.put(`/manager/menu/items/${itemId}`, itemData, true),
  deleteMenuItem: (itemId) => apiService.delete(`/manager/menu/items/${itemId}`, true),

  // Staff
  getStaff: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/manager/staff${queryString ? `?${queryString}` : ''}`, true);
  },
  getStaffDetails: (staffId) => apiService.get(`/manager/staff/${staffId}`, true),
  updateStaffStatus: (staffId, statusData) => apiService.put(`/manager/staff/${staffId}/status`, statusData, true),

  // Schedule
  getSchedules: (date) => apiService.get(`/manager/staff/schedules${date ? `?date=${date}` : ''}`, true),
  createSchedule: (scheduleData) => apiService.post('/manager/staff/schedules', scheduleData, true),

  // Inventory
  getInventory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/manager/inventory${queryString ? `?${queryString}` : ''}`, true);
  },
  createInventoryItem: (itemData) => apiService.post('/manager/inventory', itemData, true),
  updateInventoryItem: (itemId, itemData) => apiService.put(`/manager/inventory/${itemId}`, itemData, true),

  // Reports
  getSalesReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/manager/reports/sales${queryString ? `?${queryString}` : ''}`, true);
  },
  getStaffPerformanceReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/manager/reports/staff-performance${queryString ? `?${queryString}` : ''}`, true);
  },

  // Settings
  getSettings: () => apiService.get('/manager/settings', true),
  updateSettings: (settingsData) => apiService.put('/manager/settings', settingsData, true)
};

// ------------------ Health ------------------
export const healthAPI = {
  check: () => apiService.get('/')
};

// ------------------ Token Helpers ------------------
export const setAuthToken = (token) => apiService.setToken(token);
export const clearAuthToken = () => apiService.clearToken();

// Default export
export default apiService;
