const { envConfig } = require('../config');
const { sendError } = require('../utils');

function errorMiddleware(err, req, res, next) {
  // Log internal error for server monitoring
  console.error('[Server Error Log]:', {
    message: err.message,
    code: err.code,
    path: req.originalUrl,
    method: req.method
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'SERVER_ERROR';
  let errors = err.errors || null;

  // Handle specific MySQL errors gracefully
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Data duplikat terdeteksi. Silakan gunakan nilai lain.';
    errorCode = 'DUPLICATE_ENTRY';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Relasi data referensi tidak ditemukan.';
    errorCode = 'FOREIGN_KEY_VIOLATION';
  }

  const extra = {};
  const currentEnv = envConfig.nodeEnv || envConfig.NODE_ENV;
  if (currentEnv !== 'production' && err.stack) {
    extra.stack = err.stack;
  }

  return sendError(res, statusCode, message, errorCode, errors, extra);
}

module.exports = errorMiddleware;
