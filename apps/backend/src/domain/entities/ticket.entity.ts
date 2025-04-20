import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';

export enum TicketStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TicketType {
  INCIDENT = 'incident',
  REQUEST = 'request',
  MAINTENANCE = 'maintenance'
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING
  })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM
  })
  priority: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketType,
    default: TicketType.INCIDENT
  })
  type: TicketType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @OneToMany(() => Comment, comment => comment.ticket)
  comments: Comment[];

  @Column({ name: 'resolution_time', type: 'interval', nullable: true })
  resolutionTime: string;

  @Column({ name: 'first_response_time', type: 'interval', nullable: true })
  firstResponseTime: string;

  @Column({ name: 'met_sla', type: 'boolean', default: true })
  metSLA: boolean;

  @Column({ name: 'requires_follow_up', type: 'boolean', default: false })
  requiresFollowUp: boolean;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isOpen(): boolean {
    return this.status === TicketStatus.PENDING || this.status === TicketStatus.IN_PROGRESS;
  }

  canAssign(): boolean {
    return this.isOpen();
  }

  canClose(): boolean {
    return this.status === TicketStatus.RESOLVED;
  }

  canResolve(): boolean {
    return this.status === TicketStatus.IN_PROGRESS;
  }
}
