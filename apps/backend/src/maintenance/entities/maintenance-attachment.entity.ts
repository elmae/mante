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
import { MaintenanceRecord } from './maintenance-record.entity';

@Entity('maintenance_attachments')
export class MaintenanceAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  fileKey: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @ManyToOne(() => MaintenanceRecord, record => record.attachments)
  @JoinColumn({ name: 'maintenanceRecordId' })
  maintenanceRecord: MaintenanceRecord;

  @Column()
  maintenanceRecordId: string;

  @Column({ type: 'json', nullable: true })
  metadata: {
    originalName: string;
    encoding: string;
    category?: string;
    taskId?: string;
    partId?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<MaintenanceAttachment>) {
    Object.assign(this, partial);
  }
}
