class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Sumber daya tidak ditemukan') {
    super(message, 404, 'NOT_FOUND');
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Permintaan tidak valid', errors = null) {
    super(message, 400, 'BAD_REQUEST', errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Akses tidak diizinkan. Silakan login terlebih dahulu') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Anda tidak memiliki hak akses untuk tindakan ini') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Terjadi konflik data') {
    super(message, 409, 'CONFLICT');
  }
}

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError
};
