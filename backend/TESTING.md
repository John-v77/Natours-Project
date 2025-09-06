# Testing Guide for Natours API

## Overview
This project now includes comprehensive API tests using Jest and Supertest, along with GitHub Actions CI/CD pipeline.

## Test Structure
```
tests/
├── setup/
│   ├── testSetup.js          # MongoDB Memory Server setup
│   ├── globalTeardown.js     # Global cleanup
│   └── testHelpers.js        # Test utilities and helpers
└── integration/
    ├── auth.test.js          # Authentication tests
    ├── tours.test.js         # Tours API tests
    ├── users.test.js         # Users API tests
    ├── reviews.test.js       # Reviews API tests
    └── bookings.test.js      # Bookings API tests
```

## Running Tests

### Local Development
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/integration/auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should login user"
```

### Environment Variables
Tests use these environment variables:
- `NODE_ENV=test`
- `JWT_SECRET=test-jwt-secret-key-for-testing-purposes-only`
- `JWT_EXPIRES_IN=90d`
- Database: In-memory MongoDB via MongoDB Memory Server

## Test Coverage

### Authentication (auth.test.js)
- User signup with validation
- User login with credentials
- Password reset functionality
- Password update for authenticated users
- Error handling for invalid inputs

### Tours (tours.test.js)
- CRUD operations for tours
- Filtering, sorting, pagination
- Field limiting
- Tour statistics and aggregations
- Authorization checks (admin-only operations)
- Special routes (top-5-cheap, tour-stats)

### Users (users.test.js)
- User management (admin operations)
- Profile management (self-service)
- Role-based access control
- Account deactivation

### Reviews (reviews.test.js)
- Review CRUD operations
- Tour-specific reviews
- Authorization (own reviews vs admin)
- Booking requirement validation
- Duplicate review prevention

### Bookings (bookings.test.js)
- Booking management (admin operations)
- Stripe checkout session creation
- Payment processing validation

## GitHub Actions CI/CD

### Workflow Features
- **Multi-Node Testing**: Tests run on Node.js 16.x, 18.x, and 20.x
- **MongoDB Service**: Uses MongoDB 5.0 service container
- **Security Auditing**: npm audit and vulnerability checks
- **Code Analysis**: CodeQL security analysis
- **Build Verification**: Ensures code builds successfully
- **Deployment Stages**: Separate staging and production deployments

### Workflow Files
- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.github/workflows/codeql.yml` - Security code analysis
- `.github/codeql/codeql-config.yml` - CodeQL configuration

### Pipeline Stages
1. **Test**: Run tests across multiple Node versions
2. **Security**: Run security audits and vulnerability checks
3. **Build**: Build application assets
4. **Deploy**: Deploy to staging/production (configured per branch)
5. **Notify**: Send notifications on success/failure

## Test Utilities

### Test Helpers (`testHelpers.js`)
```javascript
// Create test users with different roles
const { user, token } = await createTestUser();
const { user, token } = await createAdminUser();
const { user, token } = await createGuideUser();
```

### Database Setup (`testSetup.js`)
- Automatic in-memory MongoDB setup
- Database cleanup between tests
- Console output suppression during tests

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Database is cleaned between each test
3. **Authentication**: Use helper functions to create authenticated users
4. **Realistic Data**: Tests use realistic sample data
5. **Error Testing**: Both success and error scenarios are tested
6. **Authorization**: Role-based access control is thoroughly tested

## Troubleshooting

### Common Issues

1. **Tests Timeout**: Increase Jest timeout in `jest.config.js`
2. **MongoDB Connection**: Ensure MongoDB Memory Server starts correctly
3. **Environment Variables**: Check test environment configuration
4. **Booking Requirements**: Reviews require existing bookings for users

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file with debug
npm test -- --runInBand tests/integration/auth.test.js

# Check Jest configuration
npx jest --showConfig
```

## Contributing

When adding new features:
1. Write corresponding tests
2. Follow existing test patterns
3. Ensure all tests pass before committing
4. Update this documentation if needed

The GitHub Actions workflow will automatically run all tests on pull requests and pushes to main/develop branches.