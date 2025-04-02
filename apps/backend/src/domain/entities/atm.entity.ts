import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Ticket } from "./ticket.entity";
import { Point } from "geojson";

@Entity("atms")
export class ATM {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  serial_number: string;

  @Column({ type: "varchar" })
  model: string;

  @Column({ type: "varchar" })
  brand: string;

  @Column({
    type: "geometry",
    spatialFeatureType: "Point",
    srid: 4326,
  })
  location: Point;

  @Column({ type: "text" })
  address: string;

  @Column({ type: "jsonb" })
  technical_specs: {
    cpu: string;
    memory: string;
    os: string;
    cash_capacity: number;
    supported_transactions: string[];
    [key: string]: any;
  };

  @Column({ type: "uuid" })
  client_id: string;

  @Column({ type: "uuid" })
  zone_id: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

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
  @OneToMany(() => Ticket, (ticket) => ticket.atm)
  tickets: Ticket[];

  @ManyToOne(() => User)
  @JoinColumn({ name: "client_id" })
  client: User;

  // Campos calculados
  getStatus(): "operational" | "maintenance" | "out_of_service" {
    // La lógica se implementará en el servicio
    return "operational";
  }

  getLastMaintenance(): Date | null {
    // La lógica se implementará en el servicio
    return null;
  }

  getUptime(): number {
    // La lógica se implementará en el servicio
    return 0;
  }

  // Métodos de validación
  isInServiceArea(point: Point): boolean {
    // La lógica se implementará en el servicio
    return true;
  }

  needsMaintenance(): boolean {
    // La lógica se implementará en el servicio
    return false;
  }

  // Método para transformar las coordenadas a un formato más amigable
  getCoordinates(): { latitude: number; longitude: number } {
    return {
      latitude: this.location.coordinates[1],
      longitude: this.location.coordinates[0],
    };
  }
}
