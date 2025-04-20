import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { MaintenanceRecord } from './maintenance-record.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

@Entity('maintenance_tasks')
export class MaintenanceTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @Column({ type: 'int' })
  sequence: number;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ type: 'json', nullable: true })
  taskData: {
    checklist?: string[];
    measurements?: Record<string, number>;
    observations?: string[];
    [key: string]: any;
  };

  @ManyToOne(() => MaintenanceRecord, record => record.tasks)
  @JoinColumn({ name: 'maintenanceRecordId' })
  maintenanceRecord: MaintenanceRecord;

  @Column()
  maintenanceRecordId: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<MaintenanceTask>) {
    Object.assign(this, partial);
  }
}
