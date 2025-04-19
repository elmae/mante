import { Injectable } from '@nestjs/common';
import { UsersService } from '../../../users/services/users.service';
import { Notification } from '../../../domain/entities/notification.entity';
import { INotificationProvider } from './notification-provider.interface';
import { NotificationType } from '../../dto/create-notification.dto';

@Injectable()
export class EmailNotificationProvider implements INotificationProvider {
  constructor(private readonly usersService: UsersService) {}

  canHandle(notification: Notification): boolean {
    return notification.type === NotificationType.EMAIL;
  }

  async send(notification: Notification): Promise<void> {
    const user = await this.usersService.findById(notification.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // TODO: Implementar lógica de envío de email usando el servicio de email configurado
    console.log(`[Email Provider] Sending email to ${user.email}:`, {
      title: notification.title,
      content: notification.content
    });
  }
}
