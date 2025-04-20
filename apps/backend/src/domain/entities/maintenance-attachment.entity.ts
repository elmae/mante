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

@Entity('maintenance_attachments')
export class MaintenanceAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @ManyToOne(() => Maintenance)
  @JoinColumn({ name: 'maintenance_id' })
  maintenance: Maintenance;

  @Column({ name: 'maintenance_id' })
  maintenanceId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column({ name: 'uploaded_by' })
  uploadedById: string;

  @Column({ name: 'is_technical', default: false })
  isTechnical: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'retention_date', type: 'timestamp', nullable: true })
  retentionDate: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy: User;

  @Column({ name: 'deleted_by_id', nullable: true })
  deletedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
