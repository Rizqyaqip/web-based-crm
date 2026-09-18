const stockRepository = require('./stock_repository');
const stockService = require('./stock_service');
const stockController = require('./stock_controller');
const stockRoutes = require('./stock_routes');

module.exports = {
  stockRepository,
  stockService,
  stockController,
  stockRoutes
};

