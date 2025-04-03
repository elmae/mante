import { Repository, MoreThan, LessThan, FindOptionsWhere } from 'typeorm';
import { UserSession } from '../../../../domain/entities/user-session.entity';
import { IUserSessionRepositoryPort } from '../../ports/output/user-session-repository.port';

export class UserSessionRepository implements IUserSessionRepositoryPort {
  constructor(private readonly repository: Repository<UserSession>) {}

  async findById(id: string): Promise<UserSession | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user']
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return this.repository.findOne({
      where: { 
        refreshToken, 
        isRevoked: false,
        expiresAt: MoreThan(new Date())
      },
      relations: ['user']
    });
  }

  async findValidSessionsByUserId(userId: string): Promise<UserSession[]> {
    const now = new Date();
    return this.repository.find({
      where: {
        userId,
        isRevoked: false,
        expiresAt: MoreThan(now)
      },
      relations: ['user'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async create(session: Partial<UserSession>): Promise<UserSession> {
    const newSession = this.repository.create({
      ...session,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.repository.save(newSession);
  }

  async update(id: string, data: Partial<UserSession>): Promise<UserSession> {
    await this.repository.update(id, {
      ...data,
      updatedAt: new Date()
    });
    
    const updatedSession = await this.findById(id);
    if (!updatedSession) {
      throw new Error('Session not found after update');
    }
    return updatedSession;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async revokeAllUserSessions(userId: string, reason?: string): Promise<void> {
    const where: FindOptionsWhere<UserSession> = {
      userId,
      isRevoked: false
    };

    await this.repository.update(where, {
      isRevoked: true,
      revokedReason: reason || 'User logout',
      updatedAt: new Date()
    });
  }

  async cleanExpiredSessions(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date())
    });
    return result.affected || 0;
  }

  async revokeSession(id: string, reason?: string): Promise<void> {
    await this.update(id, {
      isRevoked: true,
      revokedReason: reason
    });
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.update(id, {
      lastUsedAt: new Date()
    });
  }

  async countActiveSessions(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        isRevoked: false,
        expiresAt: MoreThan(new Date())
      }
    });
  }

  async findExpiredSessions(): Promise<UserSession[]> {
    return this.repository.find({
      where: {
        isRevoked: false,
        expiresAt: LessThan(new Date())
      },
      relations: ['user']
    });
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}