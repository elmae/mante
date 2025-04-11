import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notifications/notification.service';
import {
  CreateNotificationDto,
  UpdateNotificationPreferencesDto
} from '../domain/dtos/notifications.dto';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await this.notificationService.create(req.body as CreateNotificationDto);
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }

  async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DEBUG] GET /notifications - userId:', req.user.id);
      const notifications = await this.notificationService.getUserNotifications(req.user.id);
      console.log('[DEBUG] Notificaciones encontradas:', notifications.length);
      res.json(notifications);
    } catch (error) {
      console.error('[ERROR] getUserNotifications:', error);
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(
        '[DEBUG] PATCH /notifications/:id/read - notificationId:',
        req.params.id,
        'userId:',
        req.user.id
      );
      const notification = await this.notificationService.markAsRead(req.params.id, req.user.id);
      console.log('[DEBUG] Notificación marcada como leída:', notification.id);
      res.json(notification);
    } catch (error) {
      console.error('[ERROR] markAsRead:', error);
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await this.notificationService.getUnreadCount(req.user.id);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.notificationService.updateNotificationPreferences(
        req.user.id,
        req.body as UpdateNotificationPreferencesDto
      );
      res.json({ message: 'Notification preferences updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('[DEBUG] POST /notifications/mark-all-read - userId:', req.user.id);
      await this.notificationService.markAllAsRead(req.user.id);
      console.log('[DEBUG] Todas las notificaciones marcadas como leídas');
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('[ERROR] markAllAsRead:', error);
      next(error);
    }
  }

  async getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const preferences = await this.notificationService.getNotificationPreferences(req.user.id);
      // Devolver las preferencias o un objeto por defecto si son null/undefined
      res.json(
        preferences ?? {
          email_notifications: true,
          in_app_notifications: true,
          push_notifications: false
        }
      );
    } catch (error) {
      next(error);
    }
  }
}
