import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './user.entity';
import { Maintenance } from './maintenance.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Entity('maintenance_tasks')
export class MaintenanceTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  @ManyToOne(() => Maintenance)
  @JoinColumn({ name: 'maintenance_id' })
  maintenance: Maintenance;

  @Column({ name: 'maintenance_id' })
  maintenanceId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ name: 'estimated_duration', type: 'interval', nullable: true })
  estimatedDuration: string;

  @Column({ name: 'actual_duration', type: 'interval', nullable: true })
  actualDuration: string;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'technical_notes', type: 'jsonb', nullable: true })
  technicalNotes: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  isInProgress(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }

  canStart(): boolean {
    return this.status === TaskStatus.PENDING;
  }

  canComplete(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }
}
