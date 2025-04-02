import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { GeographicZone } from "./geographic-zone.entity";

export enum MaintenanceType {
  FIRST_LINE = "first_line",
  SECOND_LINE = "second_line",
  VISIT = "visit",
}

@Entity("sla_configs")
export class SLAConfig {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  zone_id: string;

  @Column({ type: "uuid", nullable: true })
  client_id: string;

  @Column({
    type: "enum",
    enum: MaintenanceType,
  })
  maintenance_type: MaintenanceType;

  @Column({ type: "interval" })
  response_time: string;

  @Column({ type: "interval" })
  resolution_time: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "uuid", nullable: true })
  created_by_id: string;

  @Column({ type: "uuid", nullable: true })
  updated_by_id: string;

  // Relaciones
  @ManyToOne(() => GeographicZone)
  @JoinColumn({ name: "zone_id" })
  zone: GeographicZone;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "client_id" })
  client: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by_id" })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updated_by_id" })
  updated_by: User;

  // Métodos de utilidad
  getResponseTimeInMinutes(): number {
    // La lógica para convertir el intervalo a minutos se implementará en el servicio
    return 0;
  }

  getResolutionTimeInMinutes(): number {
    // La lógica para convertir el intervalo a minutos se implementará en el servicio
    return 0;
  }

  isWithinResponseTime(startTime: Date, responseTime: Date): boolean {
    // La lógica para verificar el cumplimiento del tiempo de respuesta se implementará en el servicio
    return false;
  }

  isWithinResolutionTime(startTime: Date, resolutionTime: Date): boolean {
    // La lógica para verificar el cumplimiento del tiempo de resolución se implementará en el servicio
    return false;
  }

  calculateCompliance(tickets: any[]): {
    responseTimeCompliance: number;
    resolutionTimeCompliance: number;
  } {
    // La lógica para calcular el cumplimiento se implementará en el servicio
    return {
      responseTimeCompliance: 0,
      resolutionTimeCompliance: 0,
    };
  }
}
