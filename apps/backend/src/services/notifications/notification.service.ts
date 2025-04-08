import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';
import { CreateNotificationDto } from '../../domain/dtos/notifications.dto';
import { INotificationProvider } from './providers/notification-provider.interface';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { InAppNotificationProvider } from './providers/in-app-notification.provider';
import { UserService } from '../user/adapters/input/user.service';
import { NotificationPreferences } from '../../domain/entities/user.entity';

@Injectable()
export class NotificationService {
  private providers: INotificationProvider[];

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly userService: UserService
  ) {
    this.providers = [
      new EmailNotificationProvider(userService),
      new InAppNotificationProvider(notificationRepository)
    ];
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(dto);

    const user = await this.userService.findById(dto.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    const { notification_preferences } = user;

    if (
      (dto.type === 'email' && !notification_preferences?.email_notifications) ||
      (dto.type === 'in_app' && !notification_preferences?.in_app_notifications) ||
      (dto.type === 'push' && !notification_preferences?.push_notifications)
    ) {
      throw new Error(`${dto.type} notifications are disabled for this user`);
    }

    await this.notificationRepository.save(notification);

    await Promise.all(
      this.providers
        .filter(provider => provider.canHandle(notification))
        .map(provider => provider.send(notification))
    );

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.is_read = true;
    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user_id: userId, is_read: false }
    });
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedPreferences = {
      ...user.notification_preferences,
      ...preferences
    };

    await this.userService.update(userId, {
      notification_preferences: updatedPreferences
    });
  }
}
