import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Point } from 'geojson';
import { Client } from './client.entity';
import { User } from './user.entity';
import { GeographicZone } from './geographic-zone.entity';
import { MaintenanceRecord } from './maintenance-record.entity';
import { Ticket } from './ticket.entity';

@Entity('atms')
export class ATM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serial_number: string;

  @Column()
  model: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  address: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326
  })
  location: Point;

  @Column({ type: 'jsonb', nullable: true })
  technical_details: {
    manufacturer: string;
    installation_date: Date;
    last_maintenance_date: Date;
    software_version: string;
    hardware_version: string;
    network_config: {
      ip_address: string;
      subnet_mask: string;
      gateway: string;
    };
    capabilities: string[];
  };

  @Column({ type: 'enum', enum: ['active', 'inactive', 'maintenance', 'error'], default: 'active' })
  status: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid' })
  zone_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @Column({ type: 'uuid' })
  updated_by_id: string;

  // Relaciones
  @ManyToOne(() => Client, client => client.atms)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => GeographicZone, zone => zone.atms)
  @JoinColumn({ name: 'zone_id' })
  zone: GeographicZone;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by_id' })
  updated_by: User;

  @OneToMany(() => MaintenanceRecord, record => record.atm)
  maintenance_records: MaintenanceRecord[];

  @OneToMany(() => Ticket, ticket => ticket.atm)
  tickets: Ticket[];
}
