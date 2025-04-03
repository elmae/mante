import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  displayName: "backend",
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setupAfterEnv.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/tests/$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  verbose: true,
  testTimeout: 30000,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/migrations/**",
    "!src/**/*.d.ts",
    "!src/types/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
      diagnostics: {
        ignoreCodes: [2571, 6133, 7044],
      },
    },
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  watchPathIgnorePatterns: ["/node_modules/", "/dist/"],
  maxWorkers: "50%",
};

export default config;
