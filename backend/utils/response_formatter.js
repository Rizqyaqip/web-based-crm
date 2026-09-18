function sendSuccess(res, statusCode = 200, message = 'Berhasil', data = null, extra = {}) {
  const payload = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...extra
  };
  return res.status(statusCode).json(payload);
}

function sendError(res, statusCode = 500, message = 'Internal Server Error', code = 'SERVER_ERROR', errors = null, extra = {}) {
  const payload = {
    success: false,
    message,
    code,
    ...(errors !== null && { errors }),
    ...extra
  };
  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
  sendError
};
