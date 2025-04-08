import { DataSource } from 'typeorm';
import { join } from 'path';
import config from './config';
import { entities } from '../domain/entities';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  logging: true,
  entities,
  migrations: [join(__dirname, '../infrastructure/database/migrations/**/*.{ts,js}')],
  subscribers: []
});

export default AppDataSource;
