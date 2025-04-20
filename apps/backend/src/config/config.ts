import { validationSchema } from './validation.schema';
import { AppConfig, Environment } from './index';

const isValidEnvironment = (env: string): env is Environment => {
  return Object.values(Environment).includes(env as Environment);
};

export const config = (): AppConfig => {
  const validation = validationSchema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  });

  if (validation.error) {
    throw new Error(`Config validation error: ${validation.error.message}`);
  }

  const { value: env } = validation;

  const environment = env.NODE_ENV;
  if (!isValidEnvironment(environment)) {
    throw new Error(`Invalid environment: ${environment}`);
  }

  return {
    env: environment,
    port: parseInt(env.PORT, 10),
    host: env.HOST,
    apiPrefix: env.API_PREFIX,
    apiVersion: env.API_VERSION,
    database: {
      type: 'postgres',
      host: env.DB_HOST || '',
      port: parseInt(env.DB_PORT, 10),
      username: env.DB_USER || '',
      password: env.DB_PASS || '',
      database: env.DB_NAME || '',
      schema: env.DB_SCHEMA,
      synchronize: env.DB_SYNC === 'true',
      ssl: env.DB_SSL === 'true',
      logging: env.DB_LOGGING === 'true'
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
      algorithm: env.JWT_ALGORITHM
    },
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: env.CORS_CREDENTIALS
    },
    redis: env.REDIS_URL
      ? {
          host: env.REDIS_HOST || 'localhost',
          port: parseInt(env.REDIS_PORT, 10) || 6379,
          password: env.REDIS_PASSWORD
        }
      : undefined,
    email: env.SMTP_HOST
      ? {
          host: env.SMTP_HOST,
          port: parseInt(env.SMTP_PORT, 10),
          secure: env.SMTP_SECURE === 'true',
          auth: {
            user: env.SMTP_USER || '',
            pass: env.SMTP_PASS || ''
          }
        }
      : undefined,
    storage: {
      type: env.STORAGE_TYPE as 'local' | 's3',
      local:
        env.STORAGE_TYPE === 'local'
          ? {
              path: env.STORAGE_LOCAL_PATH || 'uploads'
            }
          : undefined,
      s3:
        env.STORAGE_TYPE === 's3'
          ? {
              bucket: env.AWS_S3_BUCKET || '',
              region: env.AWS_S3_REGION || '',
              accessKeyId: env.AWS_ACCESS_KEY_ID || '',
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY || ''
            }
          : undefined
    },
    logging: {
      level: env.LOG_LEVEL || 'info',
      format: env.LOG_FORMAT || 'json',
      file: env.LOG_FILE
    }
  };
};

// Export a type-safe config getter function
export function getConfig<T extends keyof AppConfig>(key: T): AppConfig[T] {
  const configValue = config()[key];
  if (configValue === undefined) {
    throw new Error(`Configuration key "${key}" not found`);
  }
  return configValue;
}

// Export individual config getters for common use cases
export const getEnvironment = (): Environment => {
  const env = getConfig('env');
  if (!isValidEnvironment(env)) {
    throw new Error(`Invalid environment: ${env}`);
  }
  return env;
};

export const getDatabaseConfig = () => getConfig('database');
export const getJwtConfig = () => getConfig('jwt');
export const getStorageConfig = () => getConfig('storage');
export const getLoggingConfig = () => getConfig('logging');
