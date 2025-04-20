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

@Entity('maintenance_comments')
export class MaintenanceComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => MaintenanceRecord, record => record.comments)
  @JoinColumn({ name: 'maintenanceRecordId' })
  maintenanceRecord: MaintenanceRecord;

  @Column()
  maintenanceRecordId: string;

  @Column({ default: false })
  isInternal: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: {
    taskId?: string;
    partId?: string;
    status?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<MaintenanceComment>) {
    Object.assign(this, partial);
  }
}
