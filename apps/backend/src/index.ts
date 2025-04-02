import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config/config";
import Logger from "./config/logger.config";
import { setupDatabase } from "./config/database.config";
import { errorHandler } from "./middleware/error.middleware";
import { setupRoutes } from "./routes";

const app = express();

// Middleware de seguridad y configuración
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de rutas
setupRoutes(app);

// Middleware de manejo de errores
app.use(errorHandler);

// Inicialización de la base de datos y servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await setupDatabase();
    Logger.info("Database connection established");

    // Iniciar servidor
    app.listen(config.port, () => {
      Logger.info(`Server running on port ${config.port}`);
      Logger.info(`Environment: ${config.env}`);
    });
  } catch (error) {
    Logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on("SIGTERM", () => {
  Logger.info("SIGTERM signal received");
  process.exit(0);
});

process.on("SIGINT", () => {
  Logger.info("SIGINT signal received");
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  Logger.error("Unhandled Rejection:", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  Logger.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();

export default app;
