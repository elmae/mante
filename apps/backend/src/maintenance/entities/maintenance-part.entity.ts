import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { MaintenanceRecord } from './maintenance-record.entity';

export enum PartStatus {
  REQUESTED = 'requested',
  IN_STOCK = 'in_stock',
  INSTALLED = 'installed',
  DEFECTIVE = 'defective',
  RETURNED = 'returned'
}

@Entity('maintenance_parts')
export class MaintenancePart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  partNumber: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PartStatus,
    default: PartStatus.REQUESTED
  })
  status: PartStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitCost: number;

  @Column({ type: 'json', nullable: true })
  specifications: {
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    warrantyPeriod?: string;
    [key: string]: any;
  };

  @ManyToOne(() => MaintenanceRecord, record => record.parts)
  @JoinColumn({ name: 'maintenanceRecordId' })
  maintenanceRecord: MaintenanceRecord;

  @Column()
  maintenanceRecordId: string;

  @Column({ type: 'timestamp', nullable: true })
  requestedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  receivedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  installedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<MaintenancePart>) {
    Object.assign(this, partial);
  }
}
