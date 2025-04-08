import { Router } from 'express';
import { DataSource } from 'typeorm';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { DashboardController } from '../controllers/dashboard.controller';
import { createLogger } from '../config/logger.config';
import { createAuthMiddleware } from '../middleware/auth.middleware';

const logger = createLogger('dashboard-routes');

export function createDashboardRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();
  const dashboardController = new DashboardController(dataSource);

  // Auth middleware
  const authMiddleware = createAuthMiddleware(jwtService, userService);
  router.use(authMiddleware.authenticate);

  // Logging middleware
  router.use((req, res, next) => {
    logger.info(`Dashboard route accessed: ${req.method} ${req.path}`);
    logger.info('Headers:', req.headers);
    next();
  });

  // Rutas del dashboard
  router.get('/stats', async (req, res, next) => {
    try {
      logger.info('Procesando petición de estadísticas');
      await dashboardController.getStats(req, res);
    } catch (error) {
      logger.error('Error en endpoint /stats:', error);
      next(error);
    }
  });

  router.get('/activity', async (req, res, next) => {
    try {
      logger.info('Procesando petición de actividad reciente');
      await dashboardController.getRecentActivity(req, res);
    } catch (error) {
      logger.error('Error en endpoint /activity:', error);
      next(error);
    }
  });

  router.get('/tickets/distribution', async (req, res, next) => {
    try {
      logger.info('Procesando petición de distribución de tickets');
      await dashboardController.getTicketDistribution(req, res);
    } catch (error) {
      logger.error('Error en endpoint /tickets/distribution:', error);
      next(error);
    }
  });

  return router;
}
