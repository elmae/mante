import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ATM } from '../atms/entities/atm.entity';
import { Client } from '../clients/entities/client.entity';
import { GeographicZone } from '../atms/entities/geographic-zone.entity';
import { MaintenanceRecord } from '../maintenance/entities/maintenance-record.entity';
import { MaintenancePart } from '../maintenance/entities/maintenance-part.entity';
import { MaintenanceTask } from '../maintenance/entities/maintenance-task.entity';
import { MaintenanceComment } from '../maintenance/entities/maintenance-comment.entity';
import { MaintenanceAttachment } from '../maintenance/entities/maintenance-attachment.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Attachment } from '../attachments/entities/attachment.entity';
import { Notification } from '../notifications/entities/notification.entity';

const databaseConfig: TypeOrmModuleOptions = {
  type: (process.env.DB_TYPE as any) || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'cmms_user',
  password: process.env.DB_PASS || 'cmms_password2',
  database: process.env.DB_NAME || 'mante_db',
  schema: process.env.DB_SCHEMA || 'public',
  entities: [
    User,
    ATM,
    Client,
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
  synchronize: process.env.DB_SYNC === 'true',
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false
        }
      : false,
  logging: process.env.DB_LOGGING === 'true'
};

export default databaseConfig;

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  return {
    ...databaseConfig,
    autoLoadEntities: true
  };
};
