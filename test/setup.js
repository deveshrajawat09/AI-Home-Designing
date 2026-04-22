/**
 * Test utilities setup
 */

// Mock environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';

// Add global test utilities
global.testTimeout = 10000;

// Mock console methods to reduce noise
global.console.log = jest.fn();
global.console.info = jest.fn();
global.console.warn = jest.fn();
