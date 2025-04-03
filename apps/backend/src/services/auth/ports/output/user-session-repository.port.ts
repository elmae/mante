import { UserSession } from '../../../../domain/entities/user-session.entity';

export interface IUserSessionRepositoryPort {
  findById(id: string): Promise<UserSession | null>;
  findByRefreshToken(refreshToken: string): Promise<UserSession | null>;
  findValidSessionsByUserId(userId: string): Promise<UserSession[]>;
  create(session: Partial<UserSession>): Promise<UserSession>;
  update(id: string, data: Partial<UserSession>): Promise<UserSession>;
  delete(id: string): Promise<void>;
  revokeAllUserSessions(userId: string, reason?: string): Promise<void>;
  cleanExpiredSessions(): Promise<number>;
  revokeSession(id: string, reason?: string): Promise<void>;
  updateLastUsed(id: string): Promise<void>;
}