import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { ATM } from "./atm.entity";
import { MaintenanceRecord } from "./maintenance-record.entity";
import { Attachment } from "./attachment.entity";
import { Comment } from "./comment.entity";

export enum TicketType {
  PREVENTIVE = "preventive",
  CORRECTIVE = "corrective",
  VISIT = "visit",
}

export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum TicketStatus {
  OPEN = "open",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

@Entity("tickets")
export class Ticket {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  atm_id: string;

  @Column({ type: "uuid", nullable: true })
  assigned_to: string;

  @Column({
    type: "enum",
    enum: TicketType,
    default: TicketType.CORRECTIVE,
  })
  type: TicketType;

  @Column({
    type: "enum",
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({
    type: "enum",
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "timestamp", nullable: true })
  due_date: Date;

  @Column({ type: "timestamp", nullable: true })
  completion_date: Date;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "created_by" })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "updated_by" })
  updated_by: User;

  // Relaciones
  @ManyToOne(() => ATM)
  @JoinColumn({ name: "atm_id" })
  atm: ATM;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_to" })
  assignedTo: User;

  @OneToOne(
    () => MaintenanceRecord,
    (maintenance: MaintenanceRecord) => maintenance.ticket
  )
  maintenanceRecord: MaintenanceRecord;

  @OneToMany(() => Attachment, (attachment: Attachment) => attachment.ticket)
  attachments: Attachment[];

  @OneToMany(() => Comment, (comment: Comment) => comment.ticket)
  comments: Comment[];

  @Column({ type: "boolean", default: false })
  met_sla: boolean;

  @Column({ type: "timestamp", nullable: true })
  sla_due_date: Date;

  checkSLA(): boolean {
    if (!this.sla_due_date) return true;
    if (this.status === TicketStatus.CLOSED) {
      return this.completion_date! <= this.sla_due_date;
    }
    return new Date() <= this.sla_due_date;
  }

  // Métodos de utilidad
  isOverdue(): boolean {
    if (!this.due_date) return false;
    return new Date() > this.due_date;
  }

  canBeAssigned(): boolean {
    return this.status === TicketStatus.OPEN;
  }

  canBeStarted(): boolean {
    return this.status === TicketStatus.ASSIGNED;
  }

  canBeClosed(): boolean {
    return this.status === TicketStatus.RESOLVED;
  }

  getTimeToResolution(): number | null {
    if (!this.completion_date) return null;
    return this.completion_date.getTime() - this.created_at.getTime();
  }

  // Método para cambios de estado con validación
  updateStatus(newStatus: TicketStatus): boolean {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.ASSIGNED],
      [TicketStatus.ASSIGNED]: [TicketStatus.IN_PROGRESS],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
      [TicketStatus.CLOSED]: [],
    };

    if (validTransitions[this.status]?.includes(newStatus)) {
      this.status = newStatus;
      if (newStatus === TicketStatus.CLOSED) {
        this.completion_date = new Date();
      }
      return true;
    }
    return false;
  }
}
