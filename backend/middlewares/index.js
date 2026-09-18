const errorMiddleware = require('./error_middleware');
const notFoundMiddleware = require('./not_found_middleware');
const { upload, uploadProductImageMiddleware } = require('./upload_middleware');

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
  upload,
  uploadProductImageMiddleware
};


