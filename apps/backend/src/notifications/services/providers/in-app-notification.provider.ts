import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../../../domain/entities/notification.entity';
import { INotificationProvider } from './notification-provider.interface';
import { NotificationType } from '../../dto/create-notification.dto';

@Injectable()
export class InAppNotificationProvider implements INotificationProvider {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  canHandle(notification: Notification): boolean {
    return notification.type === NotificationType.IN_APP;
  }

  async send(notification: Notification): Promise<void> {
    // La notificación ya está guardada en la base de datos por el servicio principal
    // Aquí podríamos implementar lógica adicional como WebSockets para notificaciones en tiempo real
    console.log('[InApp Provider] Notification stored:', {
      id: notification.id,
      title: notification.title,
      userId: notification.user_id
    });

    // TODO: Implementar WebSocket para notificaciones en tiempo real
    await Promise.resolve(); // Para satisfacer el lint de async/await
  }
}
