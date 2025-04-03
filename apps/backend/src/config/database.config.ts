import { DataSource, DataSourceOptions } from "typeorm";
import config from "./config";
import { User } from "../domain/entities/user.entity";
import { Role } from "../domain/entities/role.entity";
import { Permission } from "../domain/entities/permission.entity";
import { ATM } from "../domain/entities/atm.entity";
import { Ticket } from "../domain/entities/ticket.entity";
import { MaintenanceRecord } from "../domain/entities/maintenance-record.entity";
import { SLAConfig } from "../domain/entities/sla-config.entity";
import { GeographicZone } from "../domain/entities/geographic-zone.entity";
import { Attachment } from "../domain/entities/attachment.entity";

export const createDataSourceOptions = (dbConfig: any): DataSourceOptions => ({
  type: "postgres",
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [
    User,
    Role,
    Permission,
    ATM,
    Ticket,
    MaintenanceRecord,
    SLAConfig,
    GeographicZone,
    Attachment,
  ],
  migrations: ["src/infrastructure/database/migrations/*.ts"],
  synchronize: dbConfig.synchronize || false,
  logging: dbConfig.logging || false,
  dropSchema: dbConfig.dropSchema || false,
});

export const createDatabaseConnection = async (
  customConfig?: any
): Promise<DataSource> => {
  const dbConfig = customConfig?.database || config.database;
  const options = createDataSourceOptions(dbConfig);
  const dataSource = new DataSource(options);

  try {
    await dataSource.initialize();
    console.log("Database connection initialized successfully");
    return dataSource;
  } catch (error) {
    console.error("Error initializing database connection:", error);
    throw error;
  }
};

// Singleton instance para la aplicación principal
let dataSource: DataSource;

export const getDataSource = async (): Promise<DataSource> => {
  if (!dataSource) {
    dataSource = await createDatabaseConnection();
  }
  return dataSource;
};

export const closeDatabase = async (): Promise<void> => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
};

export default {
  createDataSourceOptions,
  createDatabaseConnection,
  getDataSource,
  closeDatabase,
};
