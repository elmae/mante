import { Router } from 'express';
import { DataSource } from 'typeorm';
import { CommentController } from '../controllers/comment.controller';
import { CommentService } from '../services/ticket/comment.service';
import { CommentRepository } from '../services/ticket/adapters/comment.repository';
import { Comment } from '../domain/entities/comment.entity';
import { User } from '../domain/entities/user.entity';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { UserRepository } from '../services/user/adapters/output/user.repository';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { CreateCommentDto, UpdateCommentDto } from '../services/ticket/dtos/comment.dto';

export function createCommentRouter(dataSource: DataSource): Router {
  const router = Router();

  // Inicializar servicios necesarios
  const jwtService = new JwtService();
  const userRepository = new UserRepository(dataSource.getRepository(User));
  const userService = new UserService(userRepository);
  const auth = createAuthMiddleware(jwtService, userService);

  // Inicializar repositorio y servicio de comentarios
  const commentRepository = new CommentRepository(dataSource.getRepository(Comment));
  const commentService = new CommentService(commentRepository);
  const commentController = new CommentController(commentService);

  // Rutas de comentarios
  router.post('/', auth.authenticate, validate(CreateCommentDto), commentController.create);

  router.get('/ticket/:ticketId', auth.authenticate, commentController.getByTicketId);

  router.get('/:id', auth.authenticate, commentController.getById);

  router.patch('/:id', auth.authenticate, validate(UpdateCommentDto), commentController.update);

  router.delete('/:id', auth.authenticate, commentController.delete);

  return router;
}

export default createCommentRouter;
