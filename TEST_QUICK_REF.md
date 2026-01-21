# Test Quick Reference

## Install Dependencies
```bash
npm install
cd server && npm install
```

## Run Tests

### All Tests
```bash
npm test              # Frontend
cd server && npm test # Backend
```

### Specific Test Files
```bash
npm test krogerService.test.js
cd server && npm test kroger.test.js
cd server && npm test e2e.test.js
```

### Watch Mode
```bash
npm run test:watch
cd server && npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
cd server && npm run test:coverage
```

## Test Files Created

### Backend (58 tests)
| File | Tests | Purpose |
|------|-------|---------|
| `server/__tests__/kroger.test.js` | 15 | Kroger API service, OAuth2, product search |
| `server/__tests__/e2e.test.js` | 13 | Waitlist, beta codes, critical flows |

### Frontend (30 tests)
| File | Tests | Purpose |
|------|-------|---------|
| `src/__tests__/krogerService.test.js` | 30 | Frontend API wrapper, ingredient parsing |

## Configuration Files Added

- `server/jest.config.js` - Backend test config
- `jest.config.js` - Frontend test config
- `src/__tests__/setup.js` - React testing setup
- `babel.config.js` - JSX transpilation

## Documentation

- **TESTING_GUIDE.md** - Full testing reference with examples
- **TEST_IMPLEMENTATION.md** - Detailed summary of what's tested

## What's Covered

✅ Kroger API Integration
- Service initialization
- OAuth2 token management
- Product search
- Product details
- Error handling

✅ Critical User Flows
- Waitlist signup
- Beta code validation
- Kroger search
- Rate limiting
- Admin reporting

✅ Frontend Service
- URL building
- Error handling
- Data transformation
- Ingredient parsing
- Image/price formatting

## Key Commands

```bash
# Run everything
npm test && cd server && npm test

# Run with coverage
npm run test:coverage && cd server && npm run test:coverage

# Watch for changes
npm run test:watch

# Run specific pattern
npm test -- --testNamePattern="Waitlist"
```

## Status

✅ 58 test cases implemented
✅ All critical flows covered
✅ Ready for CI/CD integration
✅ Documentation complete
