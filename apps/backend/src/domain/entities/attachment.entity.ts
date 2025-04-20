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
import { Ticket } from './ticket.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_name' })
  file_name: string;

  @Column({ name: 'file_path' })
  file_path: string;

  @Column({ name: 'mime_type' })
  mime_type: string;

  @Column({ name: 'file_size', type: 'bigint' })
  file_size: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column({ name: 'uploaded_by' })
  uploaded_by_id: string;

  @ManyToOne(() => Ticket, { nullable: true })
  @JoinColumn({ name: 'ticket_id' })
  ticket?: Ticket;

  @Column({ name: 'ticket_id', nullable: true })
  ticket_id?: string;

  @Column({ name: 'maintenance_record_id', nullable: true })
  maintenance_record_id?: string;

  @Column({ name: 'is_public', default: true })
  is_public: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'retention_date', type: 'timestamp', nullable: true })
  retention_date: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @Column({ name: 'deleted_by_id', nullable: true })
  deleted_by_id?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
