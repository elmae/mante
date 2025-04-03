import { ATM } from "../../../../domain/entities/atm.entity";
import { Point } from "geojson";

export interface IAtmInputPort {
  findById(id: string): Promise<ATM | null>;
  findBySerialNumber(serialNumber: string): Promise<ATM | null>;
  create(atmData: Partial<ATM>): Promise<ATM>;
  update(id: string, atmData: Partial<ATM>): Promise<ATM>;
  delete(id: string): Promise<void>;
  list(page?: number, limit?: number): Promise<{ atms: ATM[]; total: number }>;
  findByLocation(point: Point, radius: number): Promise<ATM[]>;
  getStatus(
    id: string
  ): Promise<"operational" | "maintenance" | "out_of_service">;
  getLastMaintenance(id: string): Promise<Date | null>;
  getUptime(id: string): Promise<number>;
  checkMaintenance(id: string): Promise<boolean>;
  findByClient(clientId: string): Promise<ATM[]>;
  findByZone(zoneId: string): Promise<ATM[]>;
}
