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

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => Ticket, ticket => ticket.comments)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ name: 'ticket_id' })
  ticketId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @Column({ name: 'is_private', default: false })
  isPrivate: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'parent_comment_id', nullable: true })
  parentCommentId: string;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: Comment;

  @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
  editedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'edited_by_id' })
  editedBy: User;

  @Column({ name: 'edited_by_id', nullable: true })
  editedById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  canEdit(userId: string): boolean {
    return this.createdById === userId || this.editedById === userId;
  }
}
