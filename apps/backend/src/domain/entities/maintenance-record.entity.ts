import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { ATM } from "./atm.entity";
import { Ticket } from "./ticket.entity";

export enum MaintenanceType {
  FIRST_LINE = "first_line",
  SECOND_LINE = "second_line",
  VISIT = "visit",
}

@Entity("maintenance_records")
export class MaintenanceRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  ticket_id: string;

  @Column({ type: "uuid" })
  atm_id: string;

  @Column({ type: "uuid" })
  technician_id: string;

  @Column({
    type: "enum",
    enum: MaintenanceType,
  })
  type: MaintenanceType;

  @Column({ type: "text" })
  diagnosis: string;

  @Column({ type: "text" })
  work_performed: string;

  @Column({ type: "jsonb" })
  parts_used: {
    name: string;
    quantity: number;
    serialNumber?: string;
    notes?: string;
  }[];

  @Column({ type: "timestamp" })
  start_time: Date;

  @Column({ type: "timestamp", nullable: true })
  end_time: Date;

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
  @OneToOne(() => Ticket)
  @JoinColumn({ name: "ticket_id" })
  ticket: Ticket;

  @ManyToOne(() => ATM)
  @JoinColumn({ name: "atm_id" })
  atm: ATM;

  @ManyToOne(() => User)
  @JoinColumn({ name: "technician_id" })
  technician: User;

  // Métodos de utilidad
  getDuration(): number | null {
    if (!this.end_time) return null;
    return this.end_time.getTime() - this.start_time.getTime();
  }

  isComplete(): boolean {
    return !!this.end_time;
  }

  getTotalPartsUsed(): number {
    return this.parts_used.reduce((total, part) => total + part.quantity, 0);
  }

  getPartsList(): string[] {
    return this.parts_used.map(
      (part) =>
        `${part.name} (${part.quantity})${
          part.serialNumber ? ` - S/N: ${part.serialNumber}` : ""
        }`
    );
  }
}
