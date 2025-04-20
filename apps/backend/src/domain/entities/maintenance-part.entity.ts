import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './user.entity';
import { Maintenance } from './maintenance.entity';

@Entity('maintenance_parts')
export class MaintenancePart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  part_number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit_type: string;

  @ManyToOne(() => Maintenance)
  @JoinColumn({ name: 'maintenance_id' })
  maintenance: Maintenance;

  @Column({ name: 'maintenance_id' })
  maintenance_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by' })
  added_by: User;

  @Column({ name: 'added_by' })
  added_by_id: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @Column({ name: 'is_critical', default: false })
  is_critical: boolean;

  @Column({ name: 'warranty_period', type: 'interval', nullable: true })
  warranty_period: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
