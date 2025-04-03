import { jest, expect, beforeEach, beforeAll, afterAll } from "@jest/globals";
import { DataSource } from "typeorm";

let testConnection: DataSource | null = null;

// Clear all mocks automatically between each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },

  toBeISOString(received: any) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    const pass = typeof received === "string" && isoDateRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be an ISO date string`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be an ISO date string`,
        pass: false,
      };
    }
  },

  toBeDatabaseId(received: any) {
    const pass =
      typeof received === "string" && /^[0-9a-fA-F-]{36}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid database ID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid database ID`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received: any) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === "string" && emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});

// Global test helpers
global.testHelpers = {
  setTestConnection: (connection: DataSource) => {
    testConnection = connection;
  },
  getTestConnection: () => testConnection,
  clearTestConnection: () => {
    testConnection = null;
  },
};

// Type definitions for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toBeValidDate(): R;
      toBeISOString(): R;
      toBeDatabaseId(): R;
      toBeValidEmail(): R;
    }
  }

  // Type definitions for global test helpers
  var testHelpers: {
    setTestConnection: (connection: DataSource) => void;
    getTestConnection: () => DataSource | null;
    clearTestConnection: () => void;
  };
}

// Handle unhandled promise rejections in tests
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection in tests:", error);
  process.exit(1);
});

// Register cleanup functions
beforeAll(() => {
  // Setup any global test requirements
});

afterAll(() => {
  if (testConnection) {
    testConnection.destroy().catch(console.error);
  }
});
