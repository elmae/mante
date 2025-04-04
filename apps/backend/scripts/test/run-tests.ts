#!/usr/bin/env node
import { spawnSync } from "child_process";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import { createTestDatabase, closeDatabase } from "../../tests/utils/database-test.utils";
import { DataSource } from "typeorm";

const args = process.argv.slice(2);
const mode = args[0] || "all";
const watch = args.includes("--watch");
const coverage = args.includes("--coverage");
const verbose = args.includes("--verbose");
const updateSnapshots =
  args.includes("--updateSnapshot") || args.includes("-u");
const debug = args.includes("--debug");

// Test configuration
const config = {
  testTimeout: 30000,
  maxWorkers: "50%",
  coverageDirectory: "coverage",
  rootDir: resolve(__dirname, "../../"),
};

// Ensure coverage directory exists
if (coverage && !existsSync(config.coverageDirectory)) {
  mkdirSync(config.coverageDirectory);
}

// Build Jest command
const buildJestCommand = () => {
  const command = ["jest"];

  // Add test pattern based on mode
  switch (mode) {
    case "unit":
      command.push("unit/");
      break;
    case "integration":
      command.push("integration/");
      break;
    case "auth":
      command.push("(unit|integration)/.*auth.*");
      break;
    case "user":
      command.push("(unit|integration)/.*user.*");
      break;
    case "all":
    default:
      // Run all tests
      break;
  }

  // Add options
  if (watch) command.push("--watch");
  if (coverage) command.push("--coverage");
  if (verbose) command.push("--verbose");
  if (updateSnapshots) command.push("--updateSnapshot");
  if (debug) command.push("--debug");

  // Add config options
  command.push(`--testTimeout=${config.testTimeout}`);
  command.push(`--maxWorkers=${config.maxWorkers}`);

  return command;
};

// Print test configuration
console.log("\nTest Configuration:");
console.log("------------------");
console.log(`Mode: ${mode}`);
console.log(`Watch: ${watch}`);
console.log(`Coverage: ${coverage}`);
console.log(`Verbose: ${verbose}`);
console.log(`Update Snapshots: ${updateSnapshots}`);
console.log(`Debug: ${debug}`);
console.log("------------------\n");

// Initialize test database for integration tests
async function initializeTestDatabase() {
  if (mode === "integration" || mode === "all") {
    console.log("\nInitializing test database...");
    const connection = await createTestDatabase();
    return connection;
  }
  return null;
}

// Run tests
async function runTests() {
  let connection: DataSource | null = null;
  
  try {
    // Initialize database if needed
    connection = await initializeTestDatabase();

    // Run Jest
    const command = buildJestCommand();
    console.log(`\nRunning command: ${command.join(" ")}\n`);

    const result = spawnSync("npx", command, {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "test",
  },
});

// Handle test results
if (result.status !== 0) {
  console.error("\nTests failed!");
  process.exit(1);
}

// Generate test report if coverage is enabled
if (coverage) {
  console.log("\nGenerating coverage report...");
  const reportCommand = [
    "jest-coverage-report",
    `--coverageDirectory=${config.coverageDirectory}`,
    '--title="Backend Test Coverage Report"',
  ];

  spawnSync("npx", reportCommand, {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
  });
}

      console.log("\nTests completed successfully!");
    } finally {
      // Cleanup database connection
      if (connection) {
        console.log("\nCleaning up test database...");
        await closeDatabase(connection);
      }
    }
}

// Execute tests with proper setup and cleanup
runTests().catch((error) => {
  console.error("Error running tests:", error);
  process.exit(1);
});
