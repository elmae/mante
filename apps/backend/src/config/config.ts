import dotenv from "dotenv";
import { config as configEnv } from "./env.config";

dotenv.config();

const config = {
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@system.com",
    password: process.env.ADMIN_PASSWORD || "admin123",
  },
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),

  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "cmms_user",
    password: process.env.DB_PASSWORD || "cmms_password2",
    database: process.env.DB_NAME || "mante_db",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },

  minio: {
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000", 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    bucket: process.env.MINIO_BUCKET || "cmms-files",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },

  ...configEnv,
};

export default config;
