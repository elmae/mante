import { DataSource, DataSourceOptions } from "typeorm";
import { join } from "path";
import { User } from "../../src/domain/entities/user.entity";
import { Role } from "../../src/domain/entities/role.entity";
import { Permission } from "../../src/domain/entities/permission.entity";

const getTestConfig = (): DataSourceOptions => ({
  type: "postgres",
  host: process.env.TEST_DB_HOST || "localhost",
  port: parseInt(process.env.TEST_DB_PORT || "5432"),
  username: process.env.TEST_DB_USER || "postgres",
  password: process.env.TEST_DB_PASS || "postgres",
  database: process.env.TEST_DB_NAME || generateTestDatabaseName(),
  entities: [User, Role, Permission],
  synchronize: true,
  dropSchema: true,
  logging: false,
});

export const createTestDatabase = async (): Promise<DataSource> => {
  const config = getTestConfig();
  const connection = new DataSource(config);
  await connection.initialize();
  return connection;
};

export const clearDatabase = async (connection: DataSource): Promise<void> => {
  const entities = connection.entityMetadatas;
  const tableNames = entities
    .map((entity) => `"${entity.tableName}"`)
    .join(", ");

  try {
    await connection.query(`TRUNCATE ${tableNames} CASCADE;`);
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};

export const closeDatabase = async (connection: DataSource): Promise<void> => {
  try {
    await connection.destroy();
  } catch (error) {
    console.error("Error closing database connection:", error);
    throw error;
  }
};

export const createTestingModule = async () => {
  const connection = await createTestDatabase();
  return {
    connection,
    cleanup: async () => {
      await clearDatabase(connection);
      await closeDatabase(connection);
    },
  };
};

export const withTestDatabase = async <T>(
  testFn: (connection: DataSource) => Promise<T>
): Promise<T> => {
  const connection = await createTestDatabase();
  try {
    return await testFn(connection);
  } finally {
    await connection.destroy();
  }
};

export const generateTestDatabaseName = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `mante_test_${timestamp}_${random}`;
};

export const getTestMigrationsPath = (): string => {
  return join(__dirname, "../../src/infrastructure/database/migrations/test");
};

// Helper function to wait for database operations
export const waitForDatabase = async (ms: number = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
