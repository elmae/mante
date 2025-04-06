import { ICommentRepository } from './ports/comment.repository';
import { CreateCommentDto, UpdateCommentDto } from './dtos/comment.dto';
import { Comment } from '../../domain/entities/comment.entity';

export class CommentService {
  constructor(private commentRepository: ICommentRepository) {}

  async createComment(dto: CreateCommentDto, userId: string): Promise<Comment> {
    const comment = new Comment();
    comment.content = dto.content;
    comment.ticket_id = dto.ticket_id;
    comment.created_by = { id: userId } as any; // TypeORM will handle the relation

    return await this.commentRepository.create(comment);
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    return comment;
  }

  async getCommentsByTicketId(ticketId: string): Promise<Comment[]> {
    return await this.commentRepository.findByTicketId(ticketId);
  }

  async updateComment(id: string, dto: UpdateCommentDto): Promise<Comment> {
    // Verificar que el comentario existe
    await this.getCommentById(id);

    return await this.commentRepository.update(id, {
      content: dto.content
    });
  }

  async deleteComment(id: string): Promise<void> {
    // Verificar que el comentario existe
    await this.getCommentById(id);

    await this.commentRepository.delete(id);
  }
}
