const productRepository = require('./product_repository');
const productService = require('./product_service');
const productController = require('./product_controller');
const productRoutes = require('./product_routes');

module.exports = {
  productRepository,
  productService,
  productController,
  productRoutes
};

