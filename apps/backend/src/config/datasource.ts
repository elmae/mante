import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { config } from './config';
import { entities } from '../domain/entities';

// Cargar variables de entorno si config no está inicializado
if (!config?.database) {
  dotenv.config({ path: join(__dirname, '../../.env') });
}

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
