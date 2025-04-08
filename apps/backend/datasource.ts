import { DataSource } from 'typeorm';
import { join } from 'path';
import config from './src/config/config';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  logging: true,
  entities: [join(__dirname, 'src/domain/entities/**/*.{ts,js}')],
  migrations: [join(__dirname, 'src/infrastructure/database/migrations/**/*.{ts,js}')],
  subscribers: []
});

export default AppDataSource;
