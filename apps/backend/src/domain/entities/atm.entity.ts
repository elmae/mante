import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Branch } from './branch.entity';

@Entity('atms')
export class ATM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  serialNumber: string;

  @Column()
  model: string;

  @Column()
  manufacturer: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column()
  country: string;

  @Column({ type: 'jsonb' })
  location: {
    type: 'Point';
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id' })
  branchId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ default: true })
  isOperational: boolean;

  @Column({ type: 'jsonb', nullable: true })
  inventoryStatus: {
    cashLevel: number;
    receiptPaper: number;
    cardStock: number;
    lastRefillDate: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics: {
    uptime: number;
    transactionCount: number;
    errorRate: number;
    lastErrorDate: Date;
    errorTypes: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  softwareUpdates: {
    currentVersion: string;
    lastUpdateDate: Date;
    pendingUpdates: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  lastIncidentReport: {
    date: Date;
    type: string;
    description: string;
    resolved: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
