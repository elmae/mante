import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Role } from './role.entity';

export interface NotificationPreferences {
  email_notifications: boolean;
  in_app_notifications: boolean;
  push_notifications: boolean;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ name: 'password_hash' })
  password_hash!: string;

  @Column({ name: 'first_name' })
  first_name!: string;

  @Column({ name: 'last_name' })
  last_name!: string;

  @Column({ nullable: true })
  phone?: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ name: 'is_active', default: true })
  is_active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @Column({ name: 'created_by', nullable: true })
  created_by?: string;

  @Column({ name: 'updated_by', nullable: true })
  updated_by?: string;

  @Column({
    type: 'jsonb',
    name: 'notification_preferences',
    nullable: true,
    default: () =>
      '\'{"email_notifications": true, "in_app_notifications": true, "push_notifications": false}\''
  })
  notification_preferences?: NotificationPreferences;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
