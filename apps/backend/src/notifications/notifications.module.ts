import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../domain/entities/notification.entity';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { EmailNotificationProvider } from './services/providers/email-notification.provider';
import { InAppNotificationProvider } from './services/providers/in-app-notification.provider';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), UsersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailNotificationProvider, InAppNotificationProvider],
  exports: [NotificationsService]
})
export class NotificationsModule {}
