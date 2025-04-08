import { Notification } from '../../../domain/entities/notification.entity';

export interface INotificationProvider {
  send(notification: Notification): Promise<void>;
  canHandle(notification: Notification): boolean;
}
