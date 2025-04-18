import * as dotenv from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno según el ambiente
const env = process.env.NODE_ENV || 'development';
const envFile = env === 'test' ? '.env.test' : '.env';
dotenv.config({ path: join(process.cwd(), envFile) });

export const config = {
  env,
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'cmms_user',
    password: process.env.DB_PASS || 'cmms_password2',
    database: process.env.DB_NAME || 'mante_db',
    entities: [join(__dirname, '../domain/entities/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '../infrastructure/database/migrations/*.{ts,js}')],
    synchronize: env === 'development',
    logging: env === 'development'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  }
};

export type Config = typeof config;
