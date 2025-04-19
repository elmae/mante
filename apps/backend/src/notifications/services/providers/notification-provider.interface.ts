import { Notification } from '../../../domain/entities/notification.entity';

export interface INotificationProvider {
  canHandle(notification: Notification): boolean;
  send(notification: Notification): Promise<void>;
}
