import { Repository } from 'typeorm';
import { Comment } from '../../../domain/entities/comment.entity';
import { ICommentRepository } from '../ports/comment.repository';

export class CommentRepository implements ICommentRepository {
  constructor(private repository: Repository<Comment>) {}

  async create(comment: Partial<Comment>): Promise<Comment> {
    const newComment = this.repository.create(comment);
    return await this.repository.save(newComment);
  }

  async findById(id: string): Promise<Comment | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['created_by']
    });
  }

  async findByTicketId(ticketId: string): Promise<Comment[]> {
    return await this.repository.find({
      where: { ticket_id: ticketId },
      relations: ['created_by'],
      order: { created_at: 'DESC' }
    });
  }

  async update(id: string, comment: Partial<Comment>): Promise<Comment> {
    await this.repository.update(id, comment);
    const updatedComment = await this.findById(id);
    if (!updatedComment) {
      throw new Error('Comment not found after update');
    }
    return updatedComment;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
