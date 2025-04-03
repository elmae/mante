import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'refresh_token' })
  @Index()
  refreshToken!: string;

  @Column({ name: 'expires_at' })
  @Index()
  expiresAt!: Date;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'is_revoked', default: false })
  isRevoked!: boolean;

  @Column({ name: 'revoked_reason', nullable: true })
  revokedReason?: string;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  constructor(partial: Partial<UserSession>) {
    Object.assign(this, partial);
  }

  public isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  public isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }

  public revoke(reason?: string): void {
    this.isRevoked = true;
    this.revokedReason = reason;
    this.updatedAt = new Date();
  }

  public updateLastUsed(): void {
    this.lastUsedAt = new Date();
    this.updatedAt = new Date();
  }
}