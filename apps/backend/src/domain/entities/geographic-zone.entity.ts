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
import { ATM } from "./atm.entity";
import { SLAConfig } from "./sla-config.entity";
import { Polygon } from "geojson";

@Entity("geographic_zones")
export class GeographicZone {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({
    type: "geometry",
    spatialFeatureType: "Polygon",
    srid: 4326,
  })
  area: Polygon;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "uuid", nullable: true })
  created_by_id: string;

  @Column({ type: "uuid", nullable: true })
  updated_by_id: string;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by_id" })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updated_by_id" })
  updated_by: User;

  @OneToMany(() => ATM, (atm) => atm.zone_id)
  atms: ATM[];

  @OneToMany(() => SLAConfig, (slaConfig) => slaConfig.zone)
  slaConfigs: SLAConfig[];

  // Métodos de utilidad
  getCenter(): { latitude: number; longitude: number } {
    // La lógica para calcular el centro del polígono se implementará en el servicio
    return {
      latitude: 0,
      longitude: 0,
    };
  }

  getBounds(): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    // La lógica para calcular los límites del polígono se implementará en el servicio
    return {
      north: 0,
      south: 0,
      east: 0,
      west: 0,
    };
  }

  containsPoint(latitude: number, longitude: number): boolean {
    // La lógica para verificar si un punto está dentro del polígono se implementará en el servicio
    return false;
  }

  getArea(): number {
    // La lógica para calcular el área en metros cuadrados se implementará en el servicio
    return 0;
  }

  getPerimeter(): number {
    // La lógica para calcular el perímetro en metros se implementará en el servicio
    return 0;
  }
}
