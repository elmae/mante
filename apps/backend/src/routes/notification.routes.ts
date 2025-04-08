import { Router } from 'express';
import { DataSource } from 'typeorm';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notifications/notification.service';
import { validate } from '../middleware/validation.middleware';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import {
  CreateNotificationDto,
  UpdateNotificationPreferencesDto
} from '../domain/dtos/notifications.dto';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { Notification } from '../domain/entities/notification.entity';

export function createNotificationRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();

  const notificationService = new NotificationService(
    dataSource.getRepository(Notification),
    userService
  );

  const notificationController = new NotificationController(notificationService);
  const authMiddleware = createAuthMiddleware(jwtService, userService);

  // Crear notificación (solo para uso interno/admin)
  router.post(
    '/',
    authMiddleware.hasRole(['admin']),
    validate(CreateNotificationDto),
    notificationController.create.bind(notificationController)
  );

  // Obtener notificaciones del usuario
  router.get(
    '/',
    authMiddleware.authenticate,
    notificationController.getUserNotifications.bind(notificationController)
  );

  // Obtener contador de notificaciones no leídas
  router.get(
    '/unread-count',
    authMiddleware.authenticate,
    notificationController.getUnreadCount.bind(notificationController)
  );

  // Marcar notificación como leída
  router.patch(
    '/:id/read',
    authMiddleware.authenticate,
    notificationController.markAsRead.bind(notificationController)
  );

  // Actualizar preferencias de notificaciones
  router.put(
    '/preferences',
    authMiddleware.authenticate,
    validate(UpdateNotificationPreferencesDto),
    notificationController.updatePreferences.bind(notificationController)
  );

  return router;
}
