const httpStatusCodes = require('./http_status_codes');
const {
  userRoles,
  orderStatus,
  stockMutationTypes,
  paymentMethods,
  USER_ROLES,
  ORDER_STATUS,
  STOCK_MUTATION_TYPES,
  PAYMENT_METHODS
} = require('./app_constants');

module.exports = {
  httpStatusCodes,
  userRoles,
  orderStatus,
  stockMutationTypes,
  paymentMethods,

  HTTP_STATUS: httpStatusCodes,
  USER_ROLES,
  ORDER_STATUS,
  STOCK_MUTATION_TYPES,
  PAYMENT_METHODS
};
