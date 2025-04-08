import config from '../../config/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const { database } = config;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: database.host,
  port: database.port,
  username: database.username,
  password: database.password,
  database: database.database,
  synchronize: false,
  logging: false,
  entities: [join(__dirname, '../../domain/entities/**/*.{ts,js}')],
  migrations: [
    join(__dirname, './migrations/**/*.{ts,js}'),
    join(__dirname, './seeds/**/*.{ts,js}')
  ],
  subscribers: []
});

export default AppDataSource;
