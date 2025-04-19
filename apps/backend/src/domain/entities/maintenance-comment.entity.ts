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

@Entity('maintenance_comments')
export class MaintenanceComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  maintenance_record_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  is_technical: boolean;

  @Column({ type: 'boolean', default: false })
  is_internal: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by_id: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by_id: string;

  // Relaciones
  @ManyToOne(() => MaintenanceRecord, maintenance => maintenance.comments)
  @JoinColumn({ name: 'maintenance_record_id' })
  maintenance_record: MaintenanceRecord;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updated_by: User;

  // Métodos de utilidad
  isEdited(): boolean {
    return this.created_at.getTime() !== this.updated_at.getTime();
  }

  canEdit(userId: string): boolean {
    return this.created_by_id === userId;
  }
}
