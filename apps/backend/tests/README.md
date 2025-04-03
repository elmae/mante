# Backend Tests Documentation

## Overview

This directory contains the test suite for the backend application. The tests are organized into different categories and supported by various utilities and helpers.

## Directory Structure

```
tests/
├── integration/          # Integration tests
│   ├── auth/            # Authentication integration tests
│   └── user/            # User management integration tests
├── unit/                # Unit tests
│   ├── controllers/     # Controller unit tests
│   └── services/        # Service unit tests
├── utils/               # Test utilities and helpers
│   ├── auth-test.utils.ts
│   ├── database-test.utils.ts
│   ├── express-test.utils.ts
│   └── user-test.utils.ts
├── setup.ts             # Global test setup
└── setupAfterEnv.ts     # Post-environment setup
```

## Test Categories

### Unit Tests

- Test individual components in isolation
- Mock external dependencies
- Focus on business logic
- Fast execution

### Integration Tests

- Test multiple components working together
- Use test database
- Test HTTP endpoints
- Validate complete workflows

## Setup and Configuration

### Prerequisites

1. Node.js and npm installed
2. PostgreSQL database for tests
3. Environment variables configured

### Environment Setup

1. Copy `.env.test.example` to `.env.test`
2. Configure test database settings:

```env
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_USER=postgres
TEST_DB_PASS=postgres
TEST_DB_NAME=mante_test
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.spec.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Utilities

### auth-test.utils.ts

- Mock JWT service
- Authentication helpers
- Token generation utilities

### database-test.utils.ts

- Database connection management
- Test data seeding
- Cleanup utilities

### express-test.utils.ts

- Request/Response mocks
- Middleware testing helpers
- Route testing utilities

### user-test.utils.ts

- User fixtures
- Mock user repository
- User-related test helpers

## Custom Matchers

```typescript
expect(value).toBeWithinRange(min, max);
expect(value).toBeValidDate();
expect(value).toBeISOString();
expect(value).toBeDatabaseId();
expect(value).toBeValidEmail();
```

## Best Practices

1. Test Setup

   - Use beforeAll/beforeEach for setup
   - Clean up after tests
   - Keep tests isolated

2. Test Structure

   - Follow AAA pattern (Arrange, Act, Assert)
   - Clear test descriptions
   - Group related tests using describe

3. Mocking

   - Mock external dependencies
   - Use provided mock utilities
   - Reset mocks between tests

4. Database

   - Use test database
   - Clean up after each test
   - Use transactions when possible

5. Assertions
   - Make specific assertions
   - Use custom matchers
   - Test edge cases

## Examples

### Unit Test Example

```typescript
describe("UserService", () => {
  it("should create user successfully", async () => {
    // Arrange
    const userDto = createMockCreateUserDto();

    // Act
    const result = await userService.create(userDto);

    // Assert
    expect(result).toBeDefined();
    expect(result.email).toBe(userDto.email);
  });
});
```

### Integration Test Example

```typescript
describe("Auth Endpoints", () => {
  it("should authenticate user", async () => {
    // Arrange
    const credentials = mockLoginDto();

    // Act
    const response = await request(app).post("/auth/login").send(credentials);

    // Assert
    expect(response.status).toBe(200);
    expectAuthenticatedResponse(response.body);
  });
});
```

## Troubleshooting

1. Database Connection Issues

   - Check environment variables
   - Verify database is running
   - Check connection string

2. Failed Tests

   - Check test setup
   - Verify mocks are configured
   - Check for timing issues

3. Coverage Issues
   - Verify test patterns
   - Check excluded files
   - Run with --coverage flag

## Contributing

1. Follow existing patterns
2. Add tests for new features
3. Update documentation
4. Run full test suite before committing
