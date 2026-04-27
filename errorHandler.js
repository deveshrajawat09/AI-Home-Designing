/**
 * @file errorHandler.js
 * @description Enhanced error handling with custom error types and middleware
 */

// ── Custom Error Classes ─────────────────────────────────────
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, "VALIDATION_ERROR");
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      details: this.errors,
    };
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429, "RATE_LIMITED");
  }
}

// ── Error Handling Middleware ────────────────────────────────
export const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  // Log error
  console.error(`[${err.code || "ERROR"}] ${err.message}`);
  if (isDevelopment) console.error(err.stack);

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      code: "INVALID_TOKEN",
      statusCode: 401,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Session expired. Please login again",
      code: "TOKEN_EXPIRED",
      statusCode: 401,
    });
  }

  // Handle syntax errors (JSON parsing)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON in request body",
      code: "INVALID_JSON",
      statusCode: 400,
    });
  }

  // Generic error handler
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
    statusCode: 500,
    ...(isDevelopment && { message: err.message, stack: err.stack }),
  });
};

// ── Async Wrapper ────────────────────────────────────────────
/**
 * Wrap async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── Error Logger ────────────────────────────────────────────
export class ErrorLogger {
  static log(err, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      code: err.code || "UNKNOWN_ERROR",
      message: err.message,
      statusCode: err.statusCode || 500,
      ...context,
    };

    console.error(JSON.stringify(logEntry, null, 2));
    return logEntry;
  }

  static logRequest(req, err) {
    return this.log(err, {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user?.id || "anonymous",
    });
  }
}
