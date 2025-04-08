import { Router } from 'express';
import { DataSource } from 'typeorm';
import { createUserRouter } from './user.routes';
import { createAuthRouter } from './auth.routes';
import { createAtmRouter } from './atm.routes';
import { createTicketRouter } from './ticket.routes';
import { createMaintenanceRouter } from './maintenance.routes';
import { createSlaRouter } from './sla.routes';
import { createClientRouter } from './client.routes';
import { createSettingsRouter } from './settings.routes';
import { createCommentRouter } from './comment.routes';
import { createAttachmentRouter } from './attachment.routes';
import { createNotificationRouter } from './notification.routes';
import { createDashboardRouter } from './dashboard.routes';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { UserRepository } from '../services/user/adapters/output/user.repository';
import { User } from '../domain/entities/user.entity';

export function createRoutes(dataSource: DataSource): Router {
  const router = Router();

  // Inicializar servicios comunes
  const userRepository = new UserRepository(dataSource.getRepository(User));
  const userService = new UserService(userRepository);
  const jwtService = new JwtService();

  // Rutas públicas y de autenticación
  router.use('/auth', createAuthRouter(dataSource, jwtService, userService));

  // Rutas protegidas
  router.use('/users', createUserRouter(dataSource, jwtService, userService));
  router.use('/atms', createAtmRouter(dataSource, jwtService, userService));
  router.use('/tickets', createTicketRouter(dataSource, jwtService, userService));
  router.use('/maintenance', createMaintenanceRouter(dataSource, jwtService, userService));
  router.use('/sla', createSlaRouter(dataSource, jwtService, userService));
  router.use('/clients', createClientRouter(dataSource, jwtService, userService));
  router.use('/settings', createSettingsRouter(dataSource, jwtService, userService));
  router.use('/comments', createCommentRouter(dataSource));
  router.use('/attachments', createAttachmentRouter(dataSource, jwtService, userService));
  router.use('/notifications', createNotificationRouter(dataSource, jwtService, userService));
  router.use('/dashboard', createDashboardRouter(dataSource, jwtService, userService));

  return router;
}

export default createRoutes;
