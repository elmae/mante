import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

export enum RoleType {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  TECHNICIAN = 'technician',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    unique: true
  })
  name: RoleType;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isAdmin(): boolean {
    return this.name === RoleType.ADMIN;
  }

  isManager(): boolean {
    return this.name === RoleType.MANAGER;
  }

  isSupervisor(): boolean {
    return this.name === RoleType.SUPERVISOR;
  }

  isTechnician(): boolean {
    return this.name === RoleType.TECHNICIAN;
  }

  isOperator(): boolean {
    return this.name === RoleType.OPERATOR;
  }

  isViewer(): boolean {
    return this.name === RoleType.VIEWER;
  }
}
