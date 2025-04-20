import * as Joi from 'joi';
import { Environment } from './index';

export const validationSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid(Environment.Development, Environment.Production, Environment.Test)
    .default(Environment.Development),

  // Server
  PORT: Joi.number().default(3001),
  HOST: Joi.string().default('0.0.0.0'),
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('v1'),

  // Database
  DATABASE_URL: Joi.string().required(),
  DB_HOST: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  DB_PORT: Joi.number().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  DB_USER: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  DB_PASS: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  DB_NAME: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  DB_SCHEMA: Joi.string().default('public'),
  DB_SYNC: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  JWT_ALGORITHM: Joi.string().default('HS256'),

  // CORS
  CORS_ORIGIN: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).default('*'),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // Redis
  REDIS_URL: Joi.string().optional(),
  REDIS_HOST: Joi.string().when('REDIS_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.optional()
  }),
  REDIS_PORT: Joi.number().when('REDIS_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.optional()
  }),
  REDIS_PASSWORD: Joi.string().optional(),

  // Email
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_SECURE: Joi.boolean().default(true),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),

  // Storage
  STORAGE_TYPE: Joi.string().valid('local', 's3').default('local'),
  STORAGE_LOCAL_PATH: Joi.string().when('STORAGE_TYPE', {
    is: 'local',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  AWS_S3_BUCKET: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  AWS_S3_REGION: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  AWS_ACCESS_KEY_ID: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  AWS_SECRET_ACCESS_KEY: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),
  LOG_FORMAT: Joi.string().valid('json', 'pretty').default('json'),
  LOG_FILE: Joi.string().optional(),

  // Interceptors
  REQUEST_TIMEOUT: Joi.number().default(30000),
  CACHE_TTL: Joi.number().default(300),
  CACHE_PREFIX: Joi.string().default('cache:'),
  CACHE_EXCLUDE: Joi.string().default('')
});
