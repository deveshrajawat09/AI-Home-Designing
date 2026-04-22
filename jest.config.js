/**
 * Jest Configuration
 * For testing both backend and frontend code
 */

export default {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'middleware/**/*.js',
    'routes/**/*.js',
    'server.js',
    '!**/*.bak.js',
    '!**/node_modules/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Module transformation
  transform: {},

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Bail on first test failure in CI
  bail: process.env.CI ? 1 : 0
};
