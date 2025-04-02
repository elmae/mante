import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";
import { Role } from "./role.entity";

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  name: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}

// Enumeración de permisos disponibles
export enum PermissionEnum {
  // Permisos de usuarios
  CREATE_USER = "create:user",
  READ_USER = "read:user",
  UPDATE_USER = "update:user",
  DELETE_USER = "delete:user",

  // Permisos de ATMs
  CREATE_ATM = "create:atm",
  READ_ATM = "read:atm",
  UPDATE_ATM = "update:atm",
  DELETE_ATM = "delete:atm",

  // Permisos de tickets
  CREATE_TICKET = "create:ticket",
  READ_TICKET = "read:ticket",
  UPDATE_TICKET = "update:ticket",
  DELETE_TICKET = "delete:ticket",
  ASSIGN_TICKET = "assign:ticket",
  CLOSE_TICKET = "close:ticket",

  // Permisos de mantenimiento
  CREATE_MAINTENANCE = "create:maintenance",
  READ_MAINTENANCE = "read:maintenance",
  UPDATE_MAINTENANCE = "update:maintenance",
  START_MAINTENANCE = "start:maintenance",
  COMPLETE_MAINTENANCE = "complete:maintenance",

  // Permisos de SLA
  CREATE_SLA = "create:sla",
  READ_SLA = "read:sla",
  UPDATE_SLA = "update:sla",
  DELETE_SLA = "delete:sla",

  // Permisos de reportes
  VIEW_REPORTS = "view:reports",
  EXPORT_REPORTS = "export:reports",

  // Permisos de sistema
  MANAGE_ROLES = "manage:roles",
  MANAGE_SETTINGS = "manage:settings",
  VIEW_AUDIT_LOGS = "view:audit_logs",
}
