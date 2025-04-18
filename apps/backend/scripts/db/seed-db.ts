import { config } from '../../src/config/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const initializeDB = async () => {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: false,
    logging: false,
    entities: [join(__dirname, '../../src/domain/entities/**/*.{ts,js}')],
    migrations: [join(__dirname, '../../src/infrastructure/database/migrations/**/*.{ts,js}')],
    subscribers: []
  });

  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    console.log('Running migrations and seeds...');
    await AppDataSource.runMigrations();
    console.log('Migrations and seeds completed successfully');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

initializeDB().catch(console.error);
