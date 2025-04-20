import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/*.d.ts'
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  // Configuración específica para pruebas de integración
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/**/*.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/**/*.integration.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts']
    }
  ],
  // Manejo de errores asincrónicos
  testTimeout: 10000,
  maxWorkers: '50%',
  errorOnDeprecated: true
};

export default config;
