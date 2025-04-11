import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';
import { CreateNotificationDto } from '../../domain/dtos/notifications.dto';
import { INotificationProvider } from './providers/notification-provider.interface';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { InAppNotificationProvider } from './providers/in-app-notification.provider';
import { UserService } from '../user/adapters/input/user.service';
import { NotificationPreferences, User } from '../../domain/entities/user.entity';

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

    const prefs = user.notification_preferences ?? {
      email_notifications: true,
      in_app_notifications: true,
      push_notifications: false
    };

    if (
      (dto.type === 'email' && !prefs.email_notifications) ||
      (dto.type === 'in_app' && !prefs.in_app_notifications) ||
      (dto.type === 'push' && !prefs.push_notifications)
    ) {
      // Considerar si lanzar un error o simplemente no enviar si están deshabilitadas
      console.warn(
        `Notificación tipo ${dto.type} no enviada porque las preferencias están deshabilitadas para el usuario ${user.id}`
      );
      // Podríamos retornar aquí o manejarlo de otra forma según la lógica de negocio
      // throw new Error(`${dto.type} notifications are disabled for this user`);
      return notification; // Opcional: retornar la notificación creada pero no enviada
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

    // Asegurar que las preferencias base existan
    const basePreferences: NotificationPreferences = user.notification_preferences ?? {
      email_notifications: true, // Valor por defecto
      in_app_notifications: true, // Valor por defecto
      push_notifications: false // Valor por defecto
    };

    // Fusionar con las nuevas preferencias parciales
    const updatedPreferences: NotificationPreferences = {
      ...basePreferences,
      ...preferences
    };

    // Validar que todas las propiedades requeridas estén presentes
    if (
      updatedPreferences.email_notifications === undefined ||
      updatedPreferences.in_app_notifications === undefined ||
      updatedPreferences.push_notifications === undefined
    ) {
      throw new Error('Invalid notification preferences structure after merge.');
    }

    await this.userService.update(userId, {
      notification_preferences: updatedPreferences as NotificationPreferences // Asegurar el tipo
    });
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Devolver las preferencias o null si no están definidas
    return user.notification_preferences ?? null;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true }
    );
  }
}
