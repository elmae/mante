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
import { createNotificationRouter } from './notification.routes';
import { createCommentRouter } from './comment.routes';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { RedisService } from '../infrastructure/redis/redis.service';
import { TokenBlacklistService } from '../services/auth/adapters/input/token-blacklist.service';
import { AuthService } from '../services/auth/adapters/input/auth.service';

/**
 * Crea y configura todas las rutas de la aplicación
 * @param dataSource Conexión a la base de datos
 * @returns Router configurado con todas las rutas
 */
export const createRouter = async (dataSource: DataSource): Promise<Router> => {
  const router = Router();

  // Crear router para API v1
  const apiRouter = Router();

  // Inicializar servicios comunes
  const jwtService = new JwtService();
  const userService = new UserService(dataSource.getRepository('User'));
  const redisService = new RedisService();
  const tokenBlacklistService = new TokenBlacklistService(redisService);
  const authService = new AuthService(userService, jwtService, tokenBlacklistService);

  // Montar las diferentes rutas
  const authRouter = await createAuthRouter(dataSource, jwtService, userService, authService);
  apiRouter.use('/auth', authRouter);

  const usersRouter = await createUserRouter(dataSource, jwtService, userService, authService);
  apiRouter.use('/users', usersRouter);

  const atmsRouter = await createAtmRouter(dataSource, jwtService, userService, authService);
  apiRouter.use('/atms', atmsRouter);

  const ticketsRouter = await createTicketRouter(dataSource, jwtService, userService, authService);
  apiRouter.use('/tickets', ticketsRouter);

  const maintenanceRouter = await createMaintenanceRouter(
    dataSource,
    jwtService,
    userService,
    authService
  );
  apiRouter.use('/maintenance', maintenanceRouter);

  const clientsRouter = await createClientRouter(dataSource, jwtService, userService, authService);
  apiRouter.use('/clients', clientsRouter);

  const settingsRouter = await createSettingsRouter(
    dataSource,
    jwtService,
    userService,
    authService
  );
  apiRouter.use('/settings', settingsRouter);

  const slaRouter = await createSlaRouter(dataSource, jwtService, userService, authService);
  apiRouter.use('/sla', slaRouter);

  const attachmentsRouter = await createAttachmentRouter(
    dataSource,
    jwtService,
    userService,
    authService
  );
  apiRouter.use('/attachments', attachmentsRouter);

  const notificationsRouter = await createNotificationRouter(
    dataSource,
    jwtService,
    userService,
    authService
  );
  apiRouter.use('/notifications', notificationsRouter);

  const commentsRouter = await createCommentRouter(
    dataSource,
    jwtService,
    userService,
    authService
  );
  apiRouter.use('/comments', commentsRouter);

  // Montar todas las rutas bajo /api/v1
  router.use('/api/v1', apiRouter);

  return router;
};

export default createRouter;
