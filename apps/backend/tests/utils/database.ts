import { DataSource, DataSourceOptions } from 'typeorm';
import { entities } from '../../src/domain/entities';

export const createTestDatabase = async (): Promise<DataSource> => {
  const testConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    username: process.env.TEST_DB_USERNAME || 'test',
    password: process.env.TEST_DB_PASSWORD || 'test',
    database: process.env.TEST_DB_NAME || 'test_db',
    entities,
    synchronize: true,
    dropSchema: true,
    logging: false
  };

  const dataSource = new DataSource(testConfig);
  await dataSource.initialize();
  return dataSource;
};

export const cleanupDatabase = async (dataSource: DataSource): Promise<void> => {
  if (dataSource.isInitialized) {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  }
};
