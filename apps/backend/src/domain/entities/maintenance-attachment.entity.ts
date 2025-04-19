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

export enum AttachmentType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  OTHER = 'other'
}

@Entity('maintenance_attachments')
export class MaintenanceAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  maintenance_record_id: string;

  @Column({ type: 'varchar' })
  file_name: string;

  @Column({ type: 'varchar' })
  file_path: string;

  @Column({ type: 'varchar' })
  mime_type: string;

  @Column({ type: 'int' })
  file_size: number;

  @Column({
    type: 'enum',
    enum: AttachmentType,
    default: AttachmentType.OTHER
  })
  type: AttachmentType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by_id: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by_id: string;

  // Relaciones
  @ManyToOne(() => MaintenanceRecord, maintenance => maintenance.attachments)
  @JoinColumn({ name: 'maintenance_record_id' })
  maintenance_record: MaintenanceRecord;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updated_by: User;

  // Métodos de utilidad
  getFileExtension(): string {
    return this.file_name.split('.').pop() || '';
  }

  isImage(): boolean {
    return this.type === AttachmentType.IMAGE;
  }

  getFormattedSize(): string {
    const kb = this.file_size / 1024;
    if (kb < 1024) {
      return `${Math.round(kb * 10) / 10} KB`;
    }
    const mb = kb / 1024;
    return `${Math.round(mb * 10) / 10} MB`;
  }
}
