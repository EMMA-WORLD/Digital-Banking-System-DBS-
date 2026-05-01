class AppError extends Error {
  constructor(message, statusCode = 500, metadata = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.metadata = metadata;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
