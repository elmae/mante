import { ATM } from "../../../../domain/entities/atm.entity";
import { Point } from "geojson";

export interface IAtmRepositoryPort {
  findById(id: string): Promise<ATM | null>;
  findBySerialNumber(serialNumber: string): Promise<ATM | null>;
  create(atmData: Partial<ATM>): Promise<ATM>;
  update(id: string, atmData: Partial<ATM>): Promise<ATM>;
  delete(id: string): Promise<void>;
  list(page?: number, limit?: number): Promise<{ atms: ATM[]; total: number }>;
  findByLocation(point: Point, radius: number): Promise<ATM[]>;
  findByClient(clientId: string): Promise<ATM[]>;
  findByZone(zoneId: string): Promise<ATM[]>;

  // Métodos específicos para mantenimiento y estado
  getLastMaintenanceDate(id: string): Promise<Date | null>;
  getUptimeData(
    id: string
  ): Promise<{ lastDowntime: Date | null; totalUptime: number }>;
  getActiveTickets(id: string): Promise<number>;
}
