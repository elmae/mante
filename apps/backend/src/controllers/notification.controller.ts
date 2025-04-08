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
      const notifications = await this.notificationService.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await this.notificationService.markAsRead(req.params.id, req.user.id);
      res.json(notification);
    } catch (error) {
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
}
