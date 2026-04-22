/**
 * API Routes Documentation
 * This file documents all available API endpoints
 */

export const API_DOCUMENTATION = {
  baseUrl: '/api',
  version: '1.0.0',
  auth: {
    signup: {
      method: 'POST',
      path: '/api/signup',
      description: 'Create a new user account',
      body: {
        email: 'string (required) - User email',
        password: 'string (required) - Password (min 8 chars, must contain uppercase, lowercase, numbers)'
      },
      responses: {
        200: {
          token: 'JWT token',
          user: { id: 'string', email: 'string', role: 'user|admin' }
        },
        400: 'Invalid input or user already exists',
        429: 'Too many requests'
      }
    },
    login: {
      method: 'POST',
      path: '/api/login',
      description: 'Login with email and password',
      body: {
        email: 'string (required)',
        password: 'string (required)'
      },
      responses: {
        200: {
          token: 'JWT token',
          user: { id: 'string', email: 'string', role: 'user|admin' }
        },
        401: 'Invalid credentials',
        429: 'Too many login attempts'
      }
    }
  },
  plans: {
    list: {
      method: 'GET',
      path: '/plans',
      description: 'Get all plans for authenticated user',
      auth: 'Required (Bearer token)',
      query: {
        page: 'number (default: 1)',
        limit: 'number (default: 20, max: 100)',
        sort: '1 or -1 (default: -1, descending)'
      },
      responses: {
        200: {
          plans: 'array of plan objects',
          total: 'number',
          page: 'number',
          limit: 'number'
        },
        401: 'Unauthorized'
      }
    },
    create: {
      method: 'POST',
      path: '/plans',
      description: 'Create a new plan',
      auth: 'Required (Bearer token)',
      body: {
        name: 'string (required) - Plan name',
        meta: 'object (required) - {length: number, width: number}',
        objects: 'array (optional) - Drawing objects',
        description: 'string (optional) - Plan description'
      },
      responses: {
        201: {
          saved: true,
          plan: 'created plan object'
        },
        400: 'Validation error',
        401: 'Unauthorized'
      }
    },
    getOne: {
      method: 'GET',
      path: '/plans/:id',
      description: 'Get a specific plan',
      auth: 'Required (Bearer token)',
      responses: {
        200: 'Plan object',
        401: 'Unauthorized',
        404: 'Plan not found'
      }
    },
    update: {
      method: 'PUT',
      path: '/plans/:id',
      description: 'Update a plan',
      auth: 'Required (Bearer token)',
      body: 'Partial plan object',
      responses: {
        200: {
          saved: true,
          plan: 'updated plan object'
        },
        400: 'Validation error',
        401: 'Unauthorized',
        404: 'Plan not found'
      }
    },
    delete: {
      method: 'DELETE',
      path: '/plans/:id',
      description: 'Delete a plan',
      auth: 'Required (Bearer token)',
      responses: {
        200: { ok: true },
        401: 'Unauthorized',
        404: 'Plan not found'
      }
    }
  },
  generation: {
    generatePlan: {
      method: 'POST',
      path: '/generate-plan',
      description: 'Generate a plan using AI (Gemini)',
      auth: 'Required (Bearer token)',
      body: {
        requirements: 'string (required) - User requirements',
        budget: 'string (optional) - Budget info',
        style: 'string (optional) - Design style preferences'
      },
      responses: {
        200: {
          plan: 'Generated plan object with AI-generated layout'
        },
        400: 'Invalid input',
        401: 'Unauthorized',
        503: 'AI service unavailable'
      }
    }
  },
  admin: {
    getStats: {
      method: 'GET',
      path: '/api/admin/stats',
      description: 'Get admin dashboard statistics',
      auth: 'Required (Bearer token + Admin role)',
      responses: {
        200: {
          totalUsers: 'number',
          totalPlans: 'number',
          recentActivity: 'array'
        },
        401: 'Unauthorized',
        403: 'Access denied (not admin)'
      }
    },
    getUsers: {
      method: 'GET',
      path: '/api/admin/users',
      description: 'Get all users (admin only)',
      auth: 'Required (Bearer token + Admin role)',
      responses: {
        200: 'Array of user objects',
        401: 'Unauthorized',
        403: 'Access denied'
      }
    },
    updateUser: {
      method: 'PUT',
      path: '/api/admin/users/:id',
      description: 'Update user role or status (admin only)',
      auth: 'Required (Bearer token + Admin role)',
      body: {
        role: 'string - "user" or "admin"',
        status: 'string - "active" or "suspended"'
      },
      responses: {
        200: 'Updated user object',
        401: 'Unauthorized',
        403: 'Access denied',
        404: 'User not found'
      }
    }
  }
};

/**
 * Standard response format
 */
export const RESPONSE_FORMATS = {
  success: (data, message = null) => ({
    success: true,
    data,
    message
  }),
  error: (message, statusCode = 500, details = null) => ({
    success: false,
    error: message,
    statusCode,
    details
  }),
  paginated: (items, page, limit, total) => ({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  })
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  INVALID_INPUT: 'Invalid input data',
  SERVER_ERROR: 'Internal server error',
  DUPLICATE_EMAIL: 'Email already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Authentication token expired',
  TOKEN_INVALID: 'Invalid authentication token',
  AI_SERVICE_ERROR: 'AI service temporarily unavailable'
};
