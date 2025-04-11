import { User } from './user.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { ATM } from './atm.entity';
import { Ticket } from './ticket.entity';
import { MaintenanceRecord } from './maintenance-record.entity';
import { MaintenanceComment } from './maintenance-comment.entity';
import { Comment } from './comment.entity';
import { Attachment } from './attachment.entity';
import { GeographicZone } from './geographic-zone.entity';
import { SLAConfig } from './sla-config.entity';
import { UserSession } from './user-session.entity';
import { Notification } from './notification.entity';

// Enums
export { PermissionEnum } from './permission.entity';
export { TicketType, TicketPriority, TicketStatus } from './ticket.entity';
export { MaintenanceType as MaintenanceRecordType } from './maintenance-record.entity';
export { MaintenanceType as SLAMaintenanceType } from './sla-config.entity';

// Entidades
export const entities = [
  User,
  Role,
  Permission,
  ATM,
  Ticket,
  MaintenanceRecord,
  MaintenanceComment,
  Comment,
  Attachment,
  GeographicZone,
  SLAConfig,
  UserSession,
  Notification
];

export {
  User,
  Role,
  Permission,
  ATM,
  Ticket,
  MaintenanceRecord,
  MaintenanceComment,
  Comment,
  Attachment,
  GeographicZone,
  SLAConfig,
  UserSession,
  Notification
};
