import { Comment } from '../../../domain/entities/comment.entity';

export interface ICommentRepository {
  create(comment: Partial<Comment>): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByTicketId(ticketId: string): Promise<Comment[]>;
  update(id: string, comment: Partial<Comment>): Promise<Comment>;
  delete(id: string): Promise<void>;
}
