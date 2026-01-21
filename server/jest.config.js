/**
 * Jest Configuration for Backend
 * Tests for server/kroger.js, server endpoints, and E2E flows
 */

export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 50,
      lines: 50
    }
  },
  testTimeout: 10000,
  verbose: true
};
