import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { ATM } from '../../atms/entities/atm.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  businessName: string;

  @Column()
  ruc: string;

  @Column()
  address: string;

  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  @Column({ type: 'json', nullable: true })
  contractDetails: {
    startDate: Date;
    endDate: Date;
    serviceLevel: string;
    contractNumber: string;
  };

  @OneToMany(() => ATM, atm => atm.client)
  atms: ATM[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Client>) {
    Object.assign(this, partial);
  }
}
