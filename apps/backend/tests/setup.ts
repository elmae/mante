import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { jest } from "@jest/globals";

// Load test environment variables
dotenv.config({
  path: path.resolve(__dirname, "../.env.test"),
});

// Set test environment
process.env.NODE_ENV = "test";

// Default test environment variables
process.env.TEST_DB_HOST = process.env.TEST_DB_HOST || "localhost";
process.env.TEST_DB_PORT = process.env.TEST_DB_PORT || "5432";
process.env.TEST_DB_USER = process.env.TEST_DB_USER || "postgres";
process.env.TEST_DB_PASS = process.env.TEST_DB_PASS || "postgres";
process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || "mante_test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Setup global test timeouts
jest.setTimeout(30000);

// Mock console methods
console.error = jest.fn();
console.warn = jest.fn();

// Define the TestUtils interface
interface TestUtils {
  sleep: (ms: number) => Promise<void>;
}

// Global test utilities
const testUtils: TestUtils = {
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Assign to global
(global as any).testUtils = testUtils;

declare global {
  var testUtils: TestUtils;
}
