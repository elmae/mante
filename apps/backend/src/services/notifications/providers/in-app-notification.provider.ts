import { Repository } from 'typeorm';
import { Notification } from '../../../domain/entities/notification.entity';
import { INotificationProvider } from './notification-provider.interface';

export class InAppNotificationProvider implements INotificationProvider {
  constructor(private readonly notificationRepository: Repository<Notification>) {}

  async send(notification: Notification): Promise<void> {
    // Las notificaciones in-app simplemente se guardan en la base de datos
    // y serán consultadas por el frontend
    await this.notificationRepository.save({
      ...notification,
      is_read: false
    });
  }

  canHandle(notification: Notification): boolean {
    return notification.type === 'in_app';
  }
}
