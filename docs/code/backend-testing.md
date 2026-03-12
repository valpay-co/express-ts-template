# Testing Guidelines

This document outlines our testing strategy and provides guidelines for implementing tests in the Transaction Corrections System.

## Table of Contents
- [Testing Approach](#testing-approach)
- [Unit Testing](#unit-testing)
- [BDD Testing Setup](#bdd-testing-setup)
- [Writing Feature Files](#writing-feature-files)
- [Implementing Step Definitions](#implementing-step-definitions)
- [Best Practices](#best-practices)
- [Example Implementation](#example-implementation)

## Testing Approach

Our testing strategy follows a multi-layered approach:

1. **Unit Tests**: For testing individual components and functions
2. **BDD Tests**: For testing API endpoints and business scenarios
3. **Integration Tests**: For testing interactions between components

## Unit Testing

### Setup

1. Install the required dependencies:

```bash
npm install --save-dev jest @types/jest ts-jest
```

2. Configure Jest in `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": [
      "<rootDir>/src"
    ],
    "testMatch": [
      "**/__tests__/**/*.test.ts"
    ],
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "node"
    ],
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/__tests__/**"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": [
      "text",
      "lcov",
      "html"
    ]
  }
}
```

### Project Structure

```
src/
├── __tests__/
│   ├── controllers/
│   │   └── transactionController.test.ts
│   ├── services/
│   │   └── transactionService.test.ts
│   └── helpers/
│       └── testUtils.ts
├── controllers/
├── services/
└── models/
```

### Writing Unit Tests

#### 1. Controller Tests

Controllers should be tested with mocked services:

```typescript
import { Request, Response } from 'express';
import { getTransactions } from '../../controllers/transactionController';
import * as transactionService from '../../services/transactionService';

// Mock the service
jest.mock('../../services/transactionService');

describe('Transaction Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated results', async () => {
    const mockResult = {
      data: [{ id: '1', amount: 100 }],
      total: 1,
      page: 1
    };

    mockRequest.query = { page: '1', pageSize: '10' };
    (transactionService.queryCorrections as jest.Mock)
      .mockResolvedValue(mockResult);

    await getTransactions(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
  });

  it('should handle errors', async () => {
    mockRequest.query = {};
    (transactionService.queryCorrections as jest.Mock)
      .mockRejectedValue(new Error('Database error'));

    await getTransactions(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
});
```

#### 2. Service Tests

Services should be tested with a mock database:

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { queryCorrections } from '../../services/transactionService';
import { TransactionCorrection } from '../../models/TransactionCorrection';

describe('Transaction Service', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(await mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it('should return paginated results', async () => {
    // Create test data
    await TransactionCorrection.create([
      { transactionId: '1', amount: 100 },
      { transactionId: '2', amount: 200 }
    ]);

    const result = await queryCorrections({
      page: 1,
      pageSize: 10
    });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
  });
});
```

#### 3. Test Utilities

Create reusable test utilities:

```typescript
// src/__tests__/helpers/testUtils.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export const setupTestDB = () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(await mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });
};

export const createTestData = async (model: any, data: any[]) => {
  return model.insertMany(data);
};
```

### Best Practices for Unit Testing

1. **Test Structure**
   - Use descriptive test names
   - Follow the Arrange-Act-Assert pattern
   - Group related tests using `describe` blocks

2. **Mocking**
   - Mock external dependencies
   - Use `jest.mock()` for module-level mocking
   - Reset mocks between tests

3. **Database Testing**
   - Use `mongodb-memory-server` for database tests
   - Clean up data between tests
   - Don't rely on test order

4. **Coverage**
   - Aim for high test coverage (>80%)
   - Focus on critical business logic
   - Use `npm run test:coverage` to check coverage

5. **Async Testing**
   - Always await async operations
   - Test both success and error cases
   - Use `try/catch` blocks appropriately

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## BDD Testing Setup

### Required Dependencies

```json
{
  "devDependencies": {
    "@cucumber/cucumber": "latest",
    "supertest": "latest",
    "@types/supertest": "latest",
    "chai": "latest",
    "@types/chai": "latest",
    "mongodb-memory-server": "latest",
    "ts-node": "latest",
    "tsconfig-paths": "latest"
  }
}
```

### Configuration

Create a `cucumber.js` configuration file:

```javascript
module.exports = {
  default: {
    requireModule: [
      'ts-node/register',
      'tsconfig-paths/register'
    ],
    require: [
      'features/step-definitions/**/*.ts'
    ],
    format: [
      'progress-bar',
      'html:cucumber-report.html'
    ],
    paths: [
      'features/**/*.feature'
    ],
    worldParameters: {
      timeout: 5000
    }
  }
};
```

### NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:bdd": "NODE_ENV=test cucumber-js",
    "test:bdd:report": "NODE_ENV=test cucumber-js --format html:cucumber-report.html"
  }
}
```

## Writing Feature Files

Feature files should be written in Gherkin syntax and placed in the `features` directory. They should describe business scenarios in a clear, concise manner.

### Example Feature File

```gherkin
Feature: Transaction Corrections API
  As an API user
  I want to manage transaction corrections
  So that I can track and modify transaction data

  Scenario: Get all transaction corrections with pagination
    Given the API is running
    When I request transaction corrections with page 1 and pageSize 10
    Then I should receive a 200 status code
    And I should receive a list of transaction corrections
    And the response should include pagination metadata

  Scenario: Create a new transaction correction
    Given the API is running
    When I create a new transaction correction with the following details:
      | field             | value                |
      | transactionId    | "12345"             |
      | originalAmount   | 100.00              |
      | correctedAmount  | 150.00              |
      | reason           | "Price adjustment"   |
    Then I should receive a 201 status code
    And the response should contain the created transaction correction
```

## Implementing Step Definitions

Step definitions should be placed in the `features/step-definitions` directory. Each feature file should have a corresponding step definition file.

### Example Step Definition

```typescript
import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;
let api: any;
let response: request.Response;

Before(async function() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri);
  api = request(app);
});

After(async function() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

Given('the API is running', () => {
  expect(app).to.exist;
});

When('I request transaction corrections with page {int} and pageSize {int}', 
  async (page: number, pageSize: number) => {
    response = await api
      .get('/api/transactions')
      .query({ page, pageSize });
});

Then('I should receive a {int} status code', (statusCode: number) => {
  expect(response.status).to.equal(statusCode);
});
```

## Best Practices

1. **Isolation**: Use `mongodb-memory-server` for testing to ensure tests don't affect the production database.

2. **Clear Scenarios**: Write scenarios that are easy to understand by non-technical stakeholders.

3. **Reusable Steps**: Create step definitions that can be reused across different scenarios.

4. **Clean Setup/Teardown**: Always clean up resources in the `After` hook.

5. **Meaningful Assertions**: Write assertions that verify business requirements, not just technical details.

## Example Implementation

### Project Structure

```
├── features/
│   ├── transaction-corrections.feature
│   └── step-definitions/
│       └── transaction-corrections.steps.ts
├── src/
│   ├── controllers/
│   ├── services/
│   └── models/
├── cucumber.js
└── package.json
```

### Running Tests

To run the tests:
```bash
npm run test:bdd
```

To generate an HTML report:
```bash
npm run test:bdd:report
```

### Debugging Tests

1. Use the `--tags` option to run specific scenarios:
```bash
npm run test:bdd -- --tags @debug
```

2. Add debug logging in step definitions:
```typescript
console.log('Response:', JSON.stringify(response.body, null, 2));
```

3. Use VS Code's debugger by adding a launch configuration for Cucumber.

## Continuous Integration

Configure your CI pipeline to:
1. Run BDD tests in a test environment
2. Generate and store test reports as artifacts
3. Fail the build if tests fail
4. Track test coverage over time

Remember to keep your tests up to date with any API changes and regularly review test coverage to ensure critical business scenarios are properly tested.
