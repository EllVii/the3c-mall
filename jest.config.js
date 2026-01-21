/**
 * Jest Configuration for Frontend
 * Tests for React components and utilities
 */

export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.js',
    '<rootDir>/src/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.css',
    '!src/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 30,
      functions: 40,
      lines: 40
    }
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testTimeout: 10000,
  verbose: true
};
