const orderRepository = require('./order_repository');
const orderService = require('./order_service');
const orderController = require('./order_controller');
const orderRoutes = require('./order_routes');

module.exports = {
  orderRepository,
  orderService,
  orderController,
  orderRoutes
};

