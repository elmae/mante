import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtmsModule } from './atms/atms.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { ClientsModule } from './clients/clients.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { CommentsModule } from './comments/comments.module';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ATM } from './domain/entities/atm.entity';
import { Client } from './domain/entities/client.entity';
import { User } from './domain/entities/user.entity';
import { GeographicZone } from './domain/entities/geographic-zone.entity';
import { MaintenanceRecord } from './domain/entities/maintenance-record.entity';
import { MaintenancePart } from './domain/entities/maintenance-part.entity';
import { MaintenanceTask } from './domain/entities/maintenance-task.entity';
import { MaintenanceComment } from './domain/entities/maintenance-comment.entity';
import { MaintenanceAttachment } from './domain/entities/maintenance-attachment.entity';
import { Ticket } from './domain/entities/ticket.entity';
import { Comment } from './domain/entities/comment.entity';
import { Attachment } from './domain/entities/attachment.entity';
import { Notification } from './domain/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          ATM,
          Client,
          User,
          GeographicZone,
          MaintenanceRecord,
          MaintenancePart,
          MaintenanceTask,
          MaintenanceComment,
          MaintenanceAttachment,
          Ticket,
          Comment,
          Attachment,
          Notification
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
        ssl: configService.get('NODE_ENV') === 'production'
      }),
      inject: [ConfigService]
    }),
    AtmsModule,
    UsersModule,
    TicketsModule,
    ClientsModule,
    MaintenanceModule,
    DashboardModule,
    AttachmentsModule,
    CommentsModule,
    MetricsModule,
    NotificationsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
