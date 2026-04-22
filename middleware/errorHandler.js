/**
 * Custom Error Class for API errors
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'APIError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends APIError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error
 */
export class AuthError extends APIError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends APIError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Log error
  console.error('Error:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    stack: isDevelopment ? err.stack : undefined
  });

  // Handle known errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: isDevelopment ? err.details : undefined,
      statusCode: err.statusCode
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: isDevelopment ? err.message : undefined,
      statusCode: 400
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      error: 'Invalid JSON',
      statusCode: 400
    });
  }

  // Handle unknown errors
  res.status(500).json({
    error: 'Internal server error',
    details: isDevelopment ? err.message : undefined,
    statusCode: 500
  });
};

/**
 * Async handler wrapper to catch errors in async routes
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
