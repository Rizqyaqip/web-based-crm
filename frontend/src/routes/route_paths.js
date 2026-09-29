// Route paths configuration in snake_case

export const ROUTE_PATHS = {
  LANDING: 'landing',
  CATALOG: 'catalog',
  CHECKOUT_SUCCESS: 'checkout-success',
  LOGIN: 'login',

  // Rute bersama untuk staf dan admin (digeneralisir ke user)
  USER_DASHBOARD: 'user-dashboard',
  USER_STOCK_ENTRY: 'user-stock-entry',
  USER_STOCK_LOGS: 'user-stock-logs',
  USER_ORDERS: 'user-orders',

  // Rute khusus administrator (mempertahankan penamaan admin)
  ADMIN_STAFF: 'admin-staff',

  // Alias kompatibilitas
  ADMIN_DASHBOARD: 'user-dashboard',
  ADMIN_STOCK_ENTRY: 'user-stock-entry',
  ADMIN_STOCK_LOGS: 'user-stock-logs',
  ADMIN_ORDERS: 'user-orders'
};

