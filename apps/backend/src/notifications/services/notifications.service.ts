import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';
import { CreateNotificationDto, NotificationType } from '../dto/create-notification.dto';
import { INotificationProvider } from './providers/notification-provider.interface';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { InAppNotificationProvider } from './providers/in-app-notification.provider';
import { UsersService } from '../../users/services/users.service';
import { NotificationPreferences } from '../../domain/entities/user.entity';

@Injectable()
export class NotificationsService {
  private providers: INotificationProvider[];

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly usersService: UsersService,
    emailProvider: EmailNotificationProvider,
    inAppProvider: InAppNotificationProvider
  ) {
    this.providers = [emailProvider, inAppProvider];
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.usersService.findById(dto.user_id);
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found`);
    }

    const prefs = user.notification_preferences ?? {
      email_notifications: true,
      in_app_notifications: true,
      push_notifications: false
    };

    if (
      (dto.type === NotificationType.EMAIL && !prefs.email_notifications) ||
      (dto.type === NotificationType.IN_APP && !prefs.in_app_notifications) ||
      (dto.type === NotificationType.PUSH && !prefs.push_notifications)
    ) {
      console.warn(`Notification type ${dto.type} is disabled for user ${user.id}`);
      return this.notificationRepository.create(dto);
    }

    const notification = await this.notificationRepository.save(
      this.notificationRepository.create(dto)
    );

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
      throw new NotFoundException(`Notification with ID ${id} not found`);
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
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const basePreferences: NotificationPreferences = user.notification_preferences ?? {
      email_notifications: true,
      in_app_notifications: true,
      push_notifications: false
    };

    const updatedPreferences: NotificationPreferences = {
      ...basePreferences,
      ...preferences
    };

    await this.usersService.update(userId, {
      notification_preferences: updatedPreferences
    } as any); // TODO: Actualizar UpdateUserDto para incluir notification_preferences
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user.notification_preferences ?? null;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true }
    );
  }
}
