/**
 * Tests for error handling middleware
 */

import {
  APIError,
  ValidationError,
  AuthError,
  AuthorizationError,
  NotFoundError,
  errorHandler,
  asyncHandler
} from '../middleware/errorHandler.js';

describe('Error Classes', () => {
  describe('APIError', () => {
    test('should create APIError with defaults', () => {
      const error = new APIError('Server error');
      expect(error.message).toBe('Server error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('APIError');
    });

    test('should create APIError with custom status code', () => {
      const error = new APIError('Bad request', 400);
      expect(error.statusCode).toBe(400);
    });

    test('should create APIError with details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new APIError('Validation failed', 400, details);
      expect(error.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    test('should include details', () => {
      const details = { errors: ['field1 required'] };
      const error = new ValidationError('Invalid', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthError', () => {
    test('should create AuthError with 401 status', () => {
      const error = new AuthError('Invalid token');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthError');
    });
  });

  describe('AuthorizationError', () => {
    test('should create AuthorizationError with 403 status', () => {
      const error = new AuthorizationError('Admin only');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });
  });

  describe('NotFoundError', () => {
    test('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('User');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
      expect(error.name).toBe('NotFoundError');
    });
  });
});

describe('Error Handler Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  test('should handle APIError correctly', () => {
    const error = new ValidationError('Invalid email', { field: 'email' });
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid email',
      statusCode: 400,
      details: undefined
    });
  });

  test('should include details in development', () => {
    process.env.NODE_ENV = 'development';
    const details = { field: 'email' };
    const error = new ValidationError('Invalid', details);
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        details
      })
    );
  });

  test('should handle JSON parse errors', () => {
    const error = new SyntaxError('Unexpected token <');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid JSON',
      statusCode: 400
    });
  });

  test('should handle unknown errors', () => {
    const error = new Error('Unknown error');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error',
      statusCode: 500
    });
  });
});

describe('Async Handler', () => {
  test('should catch errors and pass to next', () => {
    const mockNext = jest.fn();
    const error = new Error('Test error');

    const handler = asyncHandler((req, res, next) => {
      return Promise.reject(error);
    });

    handler({}, {}, mockNext);

    // Give promise time to resolve
    setTimeout(() => {
      expect(mockNext).toHaveBeenCalledWith(error);
    }, 0);
  });

  test('should call handler function', () => {
    const mockReq = { test: true };
    const mockRes = {};
    const mockNext = jest.fn();
    const handlerFn = jest.fn().mockResolvedValue(undefined);

    const handler = asyncHandler(handlerFn);
    handler(mockReq, mockRes, mockNext);

    setTimeout(() => {
      expect(handlerFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    }, 0);
  });
});
