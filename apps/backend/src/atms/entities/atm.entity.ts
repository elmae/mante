import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Point } from 'geojson';
import { User } from '../../users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
import { GeographicZone } from './geographic-zone.entity';

export enum ATMStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service'
}

interface TechnicalSpecs {
  cpu: string;
  memory: string;
  os: string;
  cashCapacity: number;
  supportedTransactions: string[];
}

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

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326
  })
  location: Point;

  @Column()
  address: string;

  @Column('jsonb')
  technicalSpecs: TechnicalSpecs;

  @Column({
    type: 'enum',
    enum: ATMStatus,
    default: ATMStatus.INACTIVE
  })
  status: ATMStatus;

  @Column({ nullable: true })
  lastMaintenanceDate: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTechnicianId' })
  assignedTechnician: User;

  @Column({ nullable: true })
  assignedTechnicianId: string;

  @ManyToOne(() => Client, client => client.atms, { nullable: false })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: string;

  @ManyToOne(() => GeographicZone, zone => zone.atms, { nullable: false })
  @JoinColumn({ name: 'geographicZoneId' })
  geographicZone: GeographicZone;

  @Column()
  geographicZoneId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<ATM>) {
    Object.assign(this, partial);
  }
}
