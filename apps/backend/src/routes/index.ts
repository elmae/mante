import { Router } from 'express';
import { DataSource } from 'typeorm';
import { createAuthRouter } from './auth.routes';
import { createUserRouter } from './user.routes';
import { createAtmRouter } from './atm.routes';
import { createTicketRouter } from './ticket.routes';
import { createMaintenanceRouter } from './maintenance.routes';
import { createClientRouter } from './client.routes';
import { createSettingsRouter } from './settings.routes';
import { createSlaRouter } from './sla.routes';
import { createAttachmentRouter } from './attachment.routes';
import { createDashboardRouter } from './dashboard.routes';
import { createNotificationRouter } from './notification.routes';
import { createCommentRouter } from './comment.routes';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';

/**
 * Crea y configura todas las rutas de la aplicación
 * @param dataSource Conexión a la base de datos
 * @returns Router configurado con todas las rutas
 */
export const createRouter = (dataSource: DataSource): Router => {
  const router = Router();

  // Crear router para API v1
  const apiRouter = Router();

  // Inicializar servicios comunes
  const jwtService = new JwtService();
  const userService = new UserService(dataSource.getRepository('User'));

  // Montar las diferentes rutas
  const authRouter = createAuthRouter(dataSource, jwtService, userService);
  apiRouter.use('/auth', authRouter);

  const usersRouter = createUserRouter(dataSource, jwtService, userService);
  apiRouter.use('/users', usersRouter);

  const atmsRouter = createAtmRouter(dataSource, jwtService, userService);
  apiRouter.use('/atms', atmsRouter);

  const ticketsRouter = createTicketRouter(dataSource, jwtService, userService);
  apiRouter.use('/tickets', ticketsRouter);

  const maintenanceRouter = createMaintenanceRouter(dataSource, jwtService, userService);
  apiRouter.use('/maintenance', maintenanceRouter);

  const clientsRouter = createClientRouter(dataSource, jwtService, userService);
  apiRouter.use('/clients', clientsRouter);

  const settingsRouter = createSettingsRouter(dataSource, jwtService, userService);
  apiRouter.use('/settings', settingsRouter);

  const slaRouter = createSlaRouter(dataSource, jwtService, userService);
  apiRouter.use('/sla', slaRouter);

  const attachmentsRouter = createAttachmentRouter(dataSource, jwtService, userService);
  apiRouter.use('/attachments', attachmentsRouter);

  const dashboardRouter = createDashboardRouter(dataSource, jwtService, userService);
  apiRouter.use('/dashboard', dashboardRouter);

  const notificationsRouter = createNotificationRouter(dataSource, jwtService, userService);
  apiRouter.use('/notifications', notificationsRouter);

  const commentsRouter = createCommentRouter(dataSource, jwtService, userService);
  apiRouter.use('/comments', commentsRouter);

  // Montar todas las rutas bajo /api/v1
  router.use('/api/v1', apiRouter);

  return router;
};

export default createRouter;
