// API network configuration

export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
  HEALTH: '/health',
  PRODUCTS: '/products',
  PRODUCT_BEST_SELLERS: '/products/best-sellers',
  PRODUCT_CATEGORIES: '/products/categories',
  ORDERS: '/orders',
  ORDER_STATUS: (id) => `/orders/${id}/status`,
  ORDER_CHECK_PAYMENT: (id) => `/orders/${id}/check-payment`,
  STOCK_LOGS: '/stock-logs',
  AUTH_LOGIN: '/auth/login',
  AUTH_USERS: '/auth/users',
  DASHBOARD_STATS: '/dashboard/stats'
};
