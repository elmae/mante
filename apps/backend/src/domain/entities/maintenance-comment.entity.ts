import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { MaintenanceRecord } from "./maintenance-record.entity";

@Entity("maintenance_comments")
export class MaintenanceComment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "uuid" })
  maintenance_record_id: string;

  @Column({ type: "boolean", default: false })
  is_technical: boolean;

  @Column({ type: "jsonb", nullable: true })
  technical_details?: {
    parts_used?: string[];
    measurements?: Record<string, number>;
    issues_found?: string[];
    recommendations?: string[];
  };

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  created_by: User;

  @ManyToOne(
    () => MaintenanceRecord,
    (maintenance: MaintenanceRecord) => maintenance.comments
  )
  @JoinColumn({ name: "maintenance_record_id" })
  maintenance_record: MaintenanceRecord;
}