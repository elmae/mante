import { User } from '../../domain/entities/user.entity';

declare global {
  interface Request {
    user: User;
  }
}
