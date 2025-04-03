import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../domain/entities/permission.entity';
import { ATM } from '../../domain/entities/atm.entity';
import { Ticket } from '../../domain/entities/ticket.entity';
import { MaintenanceRecord } from '../../domain/entities/maintenance-record.entity';
import { SLAConfig } from '../../domain/entities/sla-config.entity';
import { GeographicZone } from '../../domain/entities/geographic-zone.entity';
import { Attachment } from '../../domain/entities/attachment.entity';

// Load environment variables
config({ path: resolve(__dirname, '../../../.env') });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'cmms_user',
  password: process.env.DB_PASS || 'cmms_password2',
  database: process.env.DB_NAME || 'mante_dev',
  schema: process.env.DB_SCHEMA || 'public',
  entities: [
    User,
    Role,
    Permission,
    ATM,
    Ticket,
    MaintenanceRecord,
    SLAConfig,
    GeographicZone,
    Attachment
  ],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  migrationsRun: true,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
};

// Create and export DataSource instance
const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;

// Initialize database connection
export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connection initialized');
    }
    return AppDataSource;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};