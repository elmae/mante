import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/ticket/comment.service';
import { CreateCommentDto, UpdateCommentDto } from '../services/ticket/dtos/comment.dto';
import { validate } from 'class-validator';

export class CommentController {
  constructor(private commentService: CommentService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = new CreateCommentDto();
      Object.assign(dto, req.body);

      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const comment = await this.commentService.createComment(dto, req.user.id);
      return res.status(201).json(comment);
    } catch (error) {
      next(error);
      return;
    }
  };

  getByTicketId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ticketId } = req.params;
      const comments = await this.commentService.getCommentsByTicketId(ticketId);
      return res.json(comments);
    } catch (error) {
      next(error);
      return;
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const comment = await this.commentService.getCommentById(id);
      return res.json(comment);
    } catch (error) {
      next(error);
      return;
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto = new UpdateCommentDto();
      Object.assign(dto, req.body);

      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const comment = await this.commentService.updateComment(id, dto);
      return res.json(comment);
    } catch (error) {
      next(error);
      return;
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.commentService.deleteComment(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
      return;
    }
  };
}
