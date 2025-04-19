import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { MaintenanceRecord } from './maintenance-record.entity';
import { User } from './user.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Entity('maintenance_tasks')
export class MaintenanceTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  maintenance_record_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @Column({ type: 'text', nullable: true })
  completion_notes: string;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by_id: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by_id: string;

  @Column({ type: 'uuid', nullable: true })
  assigned_to_id: string;

  // Relaciones
  @ManyToOne(() => MaintenanceRecord, maintenance => maintenance.tasks)
  @JoinColumn({ name: 'maintenance_record_id' })
  maintenance_record: MaintenanceRecord;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updated_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to: User;

  // Métodos de utilidad
  isComplete(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  getDuration(): number | null {
    if (!this.completed_at || !this.started_at) return null;
    return this.completed_at.getTime() - this.started_at.getTime();
  }

  canStart(): boolean {
    return this.status === TaskStatus.PENDING;
  }

  canComplete(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }
}
