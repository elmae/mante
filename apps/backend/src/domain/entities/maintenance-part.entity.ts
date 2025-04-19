import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { MaintenanceRecord } from './maintenance-record.entity';
import { User } from './user.entity';

@Entity('maintenance_parts')
export class MaintenancePart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  maintenance_record_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  serial_number: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unit_cost: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by_id: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by_id: string;

  // Relaciones
  @ManyToOne(() => MaintenanceRecord, maintenance => maintenance.parts_used)
  @JoinColumn({ name: 'maintenance_record_id' })
  maintenance_record: MaintenanceRecord;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updated_by: User;

  // Métodos de utilidad
  getTotalCost(): number {
    return this.quantity * this.unit_cost;
  }
}
