import { ValidationError } from "./errorHandler.js";

/**
 * Validation utilities for input validation
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  return email.toLowerCase();
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required');
  }
  
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    throw new ValidationError('Password must be less than 128 characters');
  }

  // Optional: Add complexity requirements
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
    throw new ValidationError('Password must contain uppercase, lowercase, and numbers');
  }

  return password;
};

/**
 * Validate plan data
 */
export const validatePlan = (planData) => {
  if (!planData || typeof planData !== 'object') {
    throw new ValidationError('Plan data is required');
  }

  const errors = [];

  // Validate required fields
  if (!planData.name || typeof planData.name !== 'string') {
    errors.push('Plan name is required and must be a string');
  }

  if (!planData.meta || typeof planData.meta !== 'object') {
    errors.push('Plan metadata is required');
  } else {
    if (typeof planData.meta.length !== 'number' || planData.meta.length <= 0) {
      errors.push('Plan length must be a positive number');
    }
    if (typeof planData.meta.width !== 'number' || planData.meta.width <= 0) {
      errors.push('Plan width must be a positive number');
    }
  }

  if (planData.objects && !Array.isArray(planData.objects)) {
    errors.push('Plan objects must be an array');
  }

  if (errors.length > 0) {
    throw new ValidationError('Invalid plan data', { errors });
  }

  return planData;
};

/**
 * Validate ID format (numeric timestamp ID)
 */
export const validateId = (id) => {
  if (!id || typeof id !== 'string') {
    throw new ValidationError('Invalid ID format');
  }

  const ts = Number(id);
  if (!Number.isFinite(ts) || ts <= 0) {
    throw new ValidationError('Invalid ID format');
  }

  return id;
};

/**
 * Sanitize user input
 */
export const sanitizeString = (str, maxLength = 500) => {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potentially dangerous characters
};

/**
 * Validate query parameters for list operations
 */
export const validateListParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const sort = query.sort === '-1' ? -1 : 1;

  return { page, limit, sort };
};
