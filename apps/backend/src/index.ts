import 'reflect-metadata';
import config from './config/config';
import Logger from './config/logger.config';
import { app, initializeApp } from './app';

// Inicialización del servidor
const startServer = async () => {
  try {
    // Inicializar la aplicación (base de datos y rutas)
    await initializeApp();

    // Iniciar servidor
    app.listen(config.port, () => {
      Logger.info(`Server running on port ${config.port}`);
      Logger.info(`Environment: ${config.env}`);
    });
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  Logger.info('SIGTERM signal received');
  process.exit(0);
});

process.on('SIGINT', () => {
  Logger.info('SIGINT signal received');
  process.exit(0);
});

process.on('unhandledRejection', error => {
  Logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', error => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;
