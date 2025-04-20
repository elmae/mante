import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ATM } from '../../atms/entities/atm.entity';
import { MaintenanceTask } from './maintenance-task.entity';
import { MaintenancePart } from './maintenance-part.entity';
import { MaintenanceComment } from './maintenance-comment.entity';
import { MaintenanceAttachment } from './maintenance-attachment.entity';

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency'
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PENDING_PARTS = 'pending_parts'
}

@Entity('maintenance_records')
export class MaintenanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MaintenanceType
  })
  type: MaintenanceType;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED
  })
  status: MaintenanceStatus;

  @Column('text')
  description: string;

  @ManyToOne(() => ATM)
  @JoinColumn({ name: 'atmId' })
  atm: ATM;

  @Column()
  atmId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'technicianId' })
  technician: User;

  @Column()
  technicianId: string;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @OneToMany(() => MaintenanceTask, task => task.maintenanceRecord)
  tasks: MaintenanceTask[];

  @OneToMany(() => MaintenancePart, part => part.maintenanceRecord)
  parts: MaintenancePart[];

  @OneToMany(() => MaintenanceComment, comment => comment.maintenanceRecord)
  comments: MaintenanceComment[];

  @OneToMany(() => MaintenanceAttachment, attachment => attachment.maintenanceRecord)
  attachments: MaintenanceAttachment[];

  @Column({ type: 'json', nullable: true })
  diagnosticData: {
    findings: string[];
    recommendations: string[];
    [key: string]: any;
  };

  @Column({ type: 'json', nullable: true })
  completionDetails: {
    outcome: string;
    issues: string[];
    followUpNeeded: boolean;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<MaintenanceRecord>) {
    Object.assign(this, partial);
  }
}
