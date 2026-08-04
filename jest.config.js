/**
 * Jest configuration for frontend utilities and Cloudflare Pages functions.
 */

export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__tests__/styleMock.js",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.js",
    "<rootDir>/src/**/*.test.js",
    "<rootDir>/functions/**/__tests__/**/*.test.js",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "functions/**/*.js",
    "!src/main.jsx",
    "!src/**/*.css",
    "!src/__tests__/**",
    "!functions/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 30,
      functions: 40,
      lines: 40,
    },
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testTimeout: 10000,
  verbose: true,
};
