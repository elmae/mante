import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import createRoutes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import config from './config/config';
import { createDatabaseConnection } from './config/database.config';
import { setupCronJobs } from './config/cron.config';
import { createLogger } from './config/logger.config';

const logger = createLogger('app');

// Create Express app
const app = express();

// Apply middlewares
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database and routes
const initializeApp = async () => {
  try {
    logger.info('Inicializando aplicación...');

    // Conectar a la base de datos
    const dataSource = await createDatabaseConnection();
    logger.info('Conexión a base de datos establecida');

    // Configurar rutas
    app.use((req, res, next) => {
      logger.info(`Petición recibida: ${req.method} ${req.path}`);
      next();
    });

    const apiPrefix = config.apiPrefix || '/api';
    logger.info(`Usando prefijo API: ${apiPrefix}`);
    app.use(apiPrefix, createRoutes(dataSource));
    logger.info('Rutas configuradas');

    // Configurar trabajos programados
    setupCronJobs(dataSource);
    logger.info('Trabajos programados inicializados');

    logger.info('Aplicación inicializada exitosamente');
  } catch (error) {
    logger.error('Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Log no controlado
process.on('uncaughtException', error => {
  logger.error('Error no controlado:', error);
  process.exit(1);
});

process.on('unhandledRejection', error => {
  logger.error('Promesa rechazada no controlada:', error);
  process.exit(1);
});

export { app, initializeApp };
