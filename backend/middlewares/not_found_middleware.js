const { sendError } = require('../utils');
const { httpStatusCodes, HTTP_STATUS } = require('../constants');

function notFoundMiddleware(req, res) {
  const status = (httpStatusCodes && httpStatusCodes.notFound) || HTTP_STATUS.NOT_FOUND || 404;
  return sendError(
    res,
    status,
    `Rute [${req.method}] ${req.originalUrl} tidak ditemukan`,
    'ROUTE_NOT_FOUND'
  );
}

module.exports = notFoundMiddleware;
