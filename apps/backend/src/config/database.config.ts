import { DataSource, DataSourceOptions } from 'typeorm';
import config from './config';
import { entities } from '../domain/entities';

export const createDataSourceOptions = (dbConfig: any): DataSourceOptions => ({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities,
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  synchronize: dbConfig.synchronize || false,
  logging: dbConfig.logging || false,
  dropSchema: dbConfig.dropSchema || false
});

export const createDatabaseConnection = async (customConfig?: any): Promise<DataSource> => {
  const dbConfig = customConfig?.database || config.database;
  const options = createDataSourceOptions(dbConfig);
  const dataSource = new DataSource(options);

  try {
    await dataSource.initialize();
    console.log('Database connection initialized successfully');
    return dataSource;
  } catch (error) {
    console.error('Error initializing database connection:', error);
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
  closeDatabase
};
