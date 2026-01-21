# Testing Guide

## Quick Start

### Backend Tests

```bash
cd server
npm install  # First time only
npm test     # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Frontend Tests

```bash
npm install  # First time only
npm test     # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## Test Files

### Backend (`server/__tests__/`)
- **kroger.test.js** - Kroger API service tests
  - KrogerAuth token management
  - searchProducts() and getProductDetails()
  - Static helpers (toGroceryItem, getProductPrice, getProductImages)
  - HTTP endpoint tests (requires running server)

- **e2e.test.js** - End-to-end integration tests
  - Waitlist signup flow
  - Beta code validation
  - Kroger search flow
  - Rate limiting
  - Admin reporting endpoints
  - Health check

### Frontend (`src/__tests__/`)
- **krogerService.test.js** - Frontend API wrapper tests
  - searchKrogerProducts() - URL building, error handling
  - getKrogerProduct() - Product details fetching
  - ingredientsToGroceryItems() - Recipe ingredient conversion
  - extractMainIngredient() - Ingredient parsing
  - getProductImage() - Image selection logic
  - formatProductPrice() - Price formatting
  - isKrogerAvailable() - Availability detection

## Running Tests

### Test All
```bash
npm test
```

### Test Specific File
```bash
npm test -- kroger.test.js
npm test -- e2e.test.js
npm test -- krogerService.test.js
```

### Test Pattern
```bash
npm test -- --testNamePattern="Waitlist"
npm test -- --testNamePattern="Kroger"
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

## Endpoint Tests

Some tests require a running server. To run full E2E tests:

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Run E2E tests (from root)
npm test -- e2e.test.js
```

Or set API_BASE before running:
```bash
API_BASE=http://localhost:3001 npm test -- e2e.test.js
```

## Environment Setup

### Backend Tests
Create `server/.env.test`:
```
KROGER_CLIENT_ID=your_test_id
KROGER_CLIENT_SECRET=your_test_secret
SUPABASE_URL=your_test_url
SUPABASE_SERVICE_ROLE_KEY=your_test_key
RESEND_API_KEY=your_test_key
```

### Frontend Tests
Tests use mocked fetch by default. No special setup needed.

## Coverage Thresholds

### Backend
- Statements: 50%
- Branches: 40%
- Functions: 50%
- Lines: 50%

### Frontend
- Statements: 40%
- Branches: 30%
- Functions: 40%
- Lines: 40%

View detailed report:
```bash
npm test -- --coverage
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
```

## Test Structure

### Kroger API Tests
```javascript
describe('KrogerService', () => {
  describe('Initialization', () => { ... })
  describe('searchProducts', () => { ... })
  describe('getProductDetails', () => { ... })
  describe('Static helpers', () => { ... })
})
```

### E2E Tests
```javascript
describe('Critical User Flows', () => {
  describe('Waitlist Signup Flow', () => { ... })
  describe('Beta Code Validation Flow', () => { ... })
  describe('Kroger Search Flow', () => { ... })
  describe('Rate Limiting', () => { ... })
  describe('Admin Reporting', () => { ... })
})
```

### Frontend Service Tests
```javascript
describe('krogerService', () => {
  describe('searchKrogerProducts', () => { ... })
  describe('getKrogerProduct', () => { ... })
  describe('ingredientsToGroceryItems', () => { ... })
  describe('Helper functions', () => { ... })
})
```

## Mocking Strategy

### Backend
- Real Kroger API calls (will fail if credentials invalid - expected during beta)
- Real Supabase/email calls in E2E tests
- Tests skip gracefully if services unavailable

### Frontend
- Mock fetch using Jest
- Test error handling, URL building, data transformation
- No actual API calls made

## Tips

1. **Debugging a test**
   ```bash
   npm test -- --testNamePattern="specific test" --verbose
   ```

2. **Update snapshots** (if using them)
   ```bash
   npm test -- --updateSnapshot
   ```

3. **Run single test file**
   ```bash
   npm test kroger.test.js
   ```

4. **Clear Jest cache**
   ```bash
   npm test -- --clearCache
   ```

5. **Check what's being tested**
   ```bash
   npm test -- --listTests
   ```

## Common Issues

### "Timeout" in E2E tests
- Server might not be running
- Start `npm run dev` in another terminal
- Or skip endpoint tests: `npm test -- --testNamePattern="not Endpoint"`

### "Kroger API credentials not configured"
- Tests skip gracefully - this is expected during beta
- To test real Kroger integration, add valid credentials to .env

### "Network error" in frontend tests
- This is normal - tests use mocked fetch
- Verify setup.js is loaded in jest.config.js

## Next Steps

1. Run backend tests: `cd server && npm test`
2. Run frontend tests: `npm test`
3. Fix any failures
4. Run with coverage: `npm test -- --coverage`
5. Commit test files with passing results
