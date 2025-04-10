import { DataSource } from 'typeorm';
import { config } from './config';
import { entities } from '../domain/entities';

let dataSource: DataSource | null = null;

export const getDataSource = async (): Promise<DataSource> => {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    entities,
    migrations: ['src/infrastructure/database/migrations/*.ts'],
    synchronize: config.database.synchronize || false,
    logging: config.database.logging || false
  });

  await dataSource.initialize();
  console.log('🗄️  Conexión a base de datos establecida');
  return dataSource;
};

export const closeDatabase = async (): Promise<void> => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
    console.log('🗄️  Conexión a base de datos cerrada');
  }
};

export default {
  getDataSource,
  closeDatabase
};
