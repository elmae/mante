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

@Entity('maintenance_comments')
export class MaintenanceComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => Maintenance)
  @JoinColumn({ name: 'maintenance_id' })
  maintenance: Maintenance;

  @Column({ name: 'maintenance_id' })
  maintenanceId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by' })
  createdById: string;

  @Column({ name: 'is_technical', default: false })
  isTechnical: boolean;

  @Column({ name: 'is_private', default: false })
  isPrivate: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'parent_comment_id', nullable: true })
  parentCommentId: string;

  @ManyToOne(() => MaintenanceComment, { nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: MaintenanceComment;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'edited_by' })
  editedBy: User;

  @Column({ name: 'edited_by_id', nullable: true })
  editedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  canEdit(userId: string): boolean {
    if (this.createdById === userId) {
      return true;
    }

    if (this.editedById) {
      return this.editedById === userId;
    }

    return false;
  }
}
