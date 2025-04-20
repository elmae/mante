import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  TICKET_CREATED = 'ticket_created',
  TICKET_UPDATED = 'ticket_updated',
  TICKET_ASSIGNED = 'ticket_assigned',
  TICKET_COMMENT = 'ticket_comment',
  MAINTENANCE_DUE = 'maintenance_due',
  SYSTEM_ALERT = 'system_alert'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: {
    resourceId?: string;
    resourceType?: string;
    priority?: string;
    [key: string]: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }
}
