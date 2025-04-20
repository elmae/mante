// Helpers
export {
  createMockExecutionContext,
  createMockConfigService,
  createMockRepository,
  createTestingModule,
  createTestObject,
  expectAsync,
  expectDatesEqual
} from './test-helpers';

// Types
export {
  type JestMockFn,
  type DeepPartial,
  type MockQueryBuilder,
  type MockRepository,
  type TestConfig,
  type TestConstants,
  type CustomMatchers
} from './types';

// Configuration
export {
  TEST_CONFIG,
  TEST_CONSTANTS,
  TEST_MATCHERS,
  getTestConfig,
  getTestDatabaseConfig,
  getTestAuthConfig,
  getTestStorageConfig,
  getTestMailConfig
} from './config';

// Re-export everything for convenience
export * from './test-helpers';
export * from './types';
export * from './config';

// Initialize Jest matchers
import { TEST_MATCHERS } from './config';
expect.extend(TEST_MATCHERS);

/**
 * @file Common test utilities index
 *
 * This module exports all testing utilities, including:
 * - Mock creation helpers
 * - Type definitions
 * - Test configuration
 * - Custom matchers
 * - Utility functions
 *
 * Usage:
 * ```typescript
 * import {
 *   createMockRepository,
 *   TEST_CONFIG,
 *   expectAsync
 * } from '@common/test';
 * ```
 */

/**
 * Common setup for test files
 *
 * @example
 * ```typescript
 * describe('MyTest', () => {
 *   let module: TestingModule;
 *
 *   beforeAll(async () => {
 *     module = await createTestingModule({
 *       imports: [MyModule],
 *       providers: [MyService]
 *     }).compile();
 *   });
 *
 *   it('should work', () => {
 *     // ...
 *   });
 * });
 * ```
 */
