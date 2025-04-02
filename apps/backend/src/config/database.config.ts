import { DataSource } from "typeorm";
import config from "./config";
import Logger from "./logger.config";
import { entities } from "../domain/entities";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  logging: config.env === "development",
  entities: entities,
  migrations: ["src/infrastructure/database/migrations/**/*.ts"],
  subscribers: ["src/infrastructure/database/subscribers/**/*.ts"],
  // Configuraciones adicionales para PostGIS
  extra: {
    // Configuración para mejorar el rendimiento
    max: 20, // máximo de conexiones en el pool
    ssl: config.env === "production",
  },
});

export const setupDatabase = async (): Promise<void> => {
  try {
    // Asegurarnos de que las extensiones necesarias estén habilitadas
    await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "postgis"');

    // Inicializar la conexión
    await AppDataSource.initialize();
    Logger.info("Database initialized with PostGIS support");

    if (config.env === "development") {
      Logger.info("Database connection established in development mode");
      Logger.info(
        `Connected to: ${config.database.host}:${config.database.port}/${config.database.database}`
      );
    }
  } catch (error) {
    Logger.error("Error initializing database:", error);
    throw error;
  }
};

// Función de utilidad para limpiar la base de datos (solo para pruebas)
export const clearDatabase = async (): Promise<void> => {
  if (config.env !== "test") {
    throw new Error(
      "clearDatabase solo puede ser ejecutado en ambiente de pruebas"
    );
  }

  const entityMetadatas = AppDataSource.entityMetadatas;
  for (const entity of entityMetadatas) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE "${entity.tableName}" CASCADE`);
  }
};
