/**
 * Tests for input validators
 */

import {
  validateEmail,
  validatePassword,
  validatePlan,
  validateId,
  sanitizeString
} from '../middleware/validators.js';
import { ValidationError } from '../middleware/errorHandler.js';

describe('Input Validators', () => {
  describe('validateEmail', () => {
    test('should validate correct email format', () => {
      expect(validateEmail('user@example.com')).toBe('user@example.com');
    });

    test('should lowercase email', () => {
      expect(validateEmail('User@Example.COM')).toBe('user@example.com');
    });

    test('should throw error for invalid email', () => {
      expect(() => validateEmail('notanemail')).toThrow(ValidationError);
      expect(() => validateEmail('user@')).toThrow(ValidationError);
      expect(() => validateEmail('@example.com')).toThrow(ValidationError);
    });
  });

  describe('validatePassword', () => {
    test('should validate strong password', () => {
      expect(validatePassword('ValidPass123')).toBe('ValidPass123');
    });

    test('should throw error for short password', () => {
      expect(() => validatePassword('Short1')).toThrow(ValidationError);
    });

    test('should throw error for password without uppercase', () => {
      expect(() => validatePassword('lowercase123')).toThrow(ValidationError);
    });

    test('should throw error for password without lowercase', () => {
      expect(() => validatePassword('UPPERCASE123')).toThrow(ValidationError);
    });

    test('should throw error for password without numbers', () => {
      expect(() => validatePassword('NoNumbers')).toThrow(ValidationError);
    });

    test('should throw error for too long password', () => {
      const longPass = 'ValidPass123' + 'a'.repeat(150);
      expect(() => validatePassword(longPass)).toThrow(ValidationError);
    });
  });

  describe('validatePlan', () => {
    const validPlan = {
      name: 'Test Plan',
      meta: { length: 10, width: 15 },
      objects: []
    };

    test('should validate correct plan', () => {
      expect(validatePlan(validPlan)).toEqual(validPlan);
    });

    test('should throw error for missing name', () => {
      expect(() => validatePlan({ meta: { length: 10, width: 15 } }))
        .toThrow(ValidationError);
    });

    test('should throw error for missing meta', () => {
      expect(() => validatePlan({ name: 'Plan' }))
        .toThrow(ValidationError);
    });

    test('should throw error for invalid dimensions', () => {
      expect(() => validatePlan({
        name: 'Plan',
        meta: { length: -5, width: 15 }
      })).toThrow(ValidationError);
    });

    test('should throw error for invalid objects type', () => {
      expect(() => validatePlan({
        name: 'Plan',
        meta: { length: 10, width: 15 },
        objects: 'not-an-array'
      })).toThrow(ValidationError);
    });
  });

  describe('validateId', () => {
    test('should validate valid ID', () => {
      const id = Date.now().toString();
      expect(validateId(id)).toBe(id);
    });

    test('should throw error for invalid ID format', () => {
      expect(() => validateId('not-a-number')).toThrow(ValidationError);
      expect(() => validateId('0')).toThrow(ValidationError);
      expect(() => validateId('-123')).toThrow(ValidationError);
    });
  });

  describe('sanitizeString', () => {
    test('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    test('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    });

    test('should truncate to max length', () => {
      const str = 'a'.repeat(1000);
      expect(sanitizeString(str, 500).length).toBe(500);
    });

    test('should return empty string for non-string input', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('');
    });
  });
});
