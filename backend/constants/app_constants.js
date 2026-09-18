const userRoles = {
  admin: 'admin',
  staff: 'staff',
  customer: 'customer',

  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer'
};

const orderStatus = {
  pending: 'Pending',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',

  PENDING: 'Pending',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan'
};

const stockMutationTypes = {
  in: 'masuk',
  outSale: 'penjualan',
  adjustment: 'penyesuaian',

  IN: 'masuk',
  OUT_SALE: 'penjualan',
  ADJUSTMENT: 'penyesuaian'
};

const paymentMethods = [
  'QRIS',
  'Transfer BCA',
  'Transfer Mandiri',
  'GoPay',
  'OVO',
  'Tunai',
  'COD'
];

module.exports = {
  userRoles,
  orderStatus,
  stockMutationTypes,
  paymentMethods,

  // Aliases for compatibility
  USER_ROLES: userRoles,
  ORDER_STATUS: orderStatus,
  STOCK_MUTATION_TYPES: stockMutationTypes,
  PAYMENT_METHODS: paymentMethods
};
