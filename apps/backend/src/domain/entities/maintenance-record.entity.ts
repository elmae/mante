import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { ATM } from './atm.entity';
import { Ticket } from './ticket.entity';
import { MaintenanceComment } from './maintenance-comment.entity';
import { MaintenanceTask } from './maintenance-task.entity';
import { MaintenancePart } from './maintenance-part.entity';
import { Attachment } from './attachment.entity';

export enum MaintenanceType {
  FIRST_LINE = 'first_line',
  SECOND_LINE = 'second_line',
  VISIT = 'visit'
}

@Entity('maintenance_records')
export class MaintenanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ticket_id: string;

  @Column({ type: 'uuid' })
  atm_id: string;

  @Column({ type: 'uuid' })
  technician_id: string;

  @Column({
    type: 'enum',
    enum: MaintenanceType
  })
  type: MaintenanceType;

  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'text' })
  work_performed: string;

  @Column({ type: 'jsonb' })
  parts_used: {
    name: string;
    quantity: number;
    serialNumber?: string;
    notes?: string;
  }[];

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  requires_follow_up: boolean;

  @Column({ type: 'text', nullable: true })
  follow_up_notes: string;

  @Column({ type: 'jsonb', nullable: true })
  technical_measurements: {
    name: string;
    value: number;
    unit: string;
    threshold?: number;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_cost: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relaciones
  @OneToMany(() => MaintenanceComment, comment => comment.maintenance_record)
  comments: MaintenanceComment[];

  @OneToMany(() => Attachment, attachment => attachment.maintenance_record)
  attachments: Attachment[];

  @OneToMany(() => MaintenanceTask, task => task.maintenance_record)
  tasks: MaintenanceTask[];

  @OneToMany(() => MaintenancePart, part => part.maintenance_record)
  parts: MaintenancePart[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updated_by: User;

  @OneToOne(() => Ticket)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @ManyToOne(() => ATM)
  @JoinColumn({ name: 'atm_id' })
  atm: ATM;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'technician_id' })
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
      part =>
        `${part.name} (${part.quantity})${part.serialNumber ? ` - S/N: ${part.serialNumber}` : ''}`
    );
  }

  getTotalCost(): number {
    return this.total_cost;
  }

  getAttachmentCount(): number {
    return this.attachments?.length || 0;
  }

  needsFollowUp(): boolean {
    return this.requires_follow_up;
  }

  getMeasurementsOutOfThreshold(): Array<{
    name: string;
    value: number;
    unit: string;
    threshold: number;
  }> {
    return (this.technical_measurements || []).filter(
      (m): m is typeof m & { threshold: number } =>
        typeof m.threshold === 'number' && m.value > m.threshold
    );
  }

  getIncompleteTaskCount(): number {
    if (!this.tasks) return 0;
    return this.tasks.filter(task => !task.isComplete()).length;
  }
}
