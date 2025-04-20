// Configuration functions
export { config } from './config';
export { getTypeOrmConfig } from './database.config';
export { getLogger } from './logger.config';

// Interceptor configuration
export * from './interceptors.config';

// Types
export interface AppConfig {
  env: string;
  port: number;
  host: string;
  apiPrefix: string;
  apiVersion: string;
  database: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    schema: string;
    synchronize: boolean;
    ssl: boolean;
    logging: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    algorithm: string;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  email?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  storage: {
    type: 'local' | 's3';
    local?: {
      path: string;
    };
    s3?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  logging: {
    level: string;
    format: string;
    file?: string;
  };
}

// Constants
export const CONFIG_NAMESPACE = 'app';
export const DEFAULT_CONFIG_PATH = '.env';

// Environment Types
export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

// Default Values
export const defaultConfig = {
  env: Environment.Development,
  port: 3001,
  host: '0.0.0.0',
  apiPrefix: 'api',
  apiVersion: 'v1',
  cors: {
    origin: '*',
    credentials: true
  },
  logging: {
    level: 'info',
    format: 'json'
  }
};

// Utility function to validate environment variables
export const validateEnv = (config: Partial<AppConfig>): void => {
  const requiredVars = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET'];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};
