import { ATM } from "../../../../domain/entities/atm.entity";
import { IAtmInputPort } from "../../ports/input/atm.port";
import { IAtmRepositoryPort } from "../../ports/output/atm-repository.port";
import { Point } from "geojson";

export class AtmService implements IAtmInputPort {
  constructor(private readonly atmRepository: IAtmRepositoryPort) {}

  async findById(id: string): Promise<ATM | null> {
    return this.atmRepository.findById(id);
  }

  async findBySerialNumber(serialNumber: string): Promise<ATM | null> {
    return this.atmRepository.findBySerialNumber(serialNumber);
  }

  async create(atmData: Partial<ATM>): Promise<ATM> {
    // Validar que el número de serie no exista
    const existingAtm = await this.findBySerialNumber(atmData.serial_number!);
    if (existingAtm) {
      throw new Error("ATM with this serial number already exists");
    }

    return this.atmRepository.create(atmData);
  }

  async update(id: string, atmData: Partial<ATM>): Promise<ATM> {
    // Validar que el ATM existe
    const existingAtm = await this.findById(id);
    if (!existingAtm) {
      throw new Error("ATM not found");
    }

    // Si se está actualizando el número de serie, verificar que no exista
    if (
      atmData.serial_number &&
      atmData.serial_number !== existingAtm.serial_number
    ) {
      const atmWithSerial = await this.findBySerialNumber(
        atmData.serial_number
      );
      if (atmWithSerial) {
        throw new Error("Serial number already in use");
      }
    }

    return this.atmRepository.update(id, atmData);
  }

  async delete(id: string): Promise<void> {
    // Validar que el ATM existe
    const existingAtm = await this.findById(id);
    if (!existingAtm) {
      throw new Error("ATM not found");
    }

    await this.atmRepository.delete(id);
  }

  async list(
    page?: number,
    limit?: number
  ): Promise<{ atms: ATM[]; total: number }> {
    return this.atmRepository.list(page, limit);
  }

  async findByLocation(point: Point, radius: number): Promise<ATM[]> {
    return this.atmRepository.findByLocation(point, radius);
  }

  async findByClient(clientId: string): Promise<ATM[]> {
    return this.atmRepository.findByClient(clientId);
  }

  async findByZone(zoneId: string): Promise<ATM[]> {
    return this.atmRepository.findByZone(zoneId);
  }

  async getStatus(
    id: string
  ): Promise<"operational" | "maintenance" | "out_of_service"> {
    const [activeTickets, uptimeData] = await Promise.all([
      this.atmRepository.getActiveTickets(id),
      this.atmRepository.getUptimeData(id),
    ]);

    // Lógica para determinar el estado del ATM
    if (activeTickets > 0) {
      return "maintenance";
    }

    if (
      uptimeData.lastDowntime &&
      new Date().getTime() - uptimeData.lastDowntime.getTime() <
        24 * 60 * 60 * 1000
    ) {
      return "out_of_service";
    }

    return "operational";
  }

  async getLastMaintenance(id: string): Promise<Date | null> {
    return this.atmRepository.getLastMaintenanceDate(id);
  }

  async getUptime(id: string): Promise<number> {
    const uptimeData = await this.atmRepository.getUptimeData(id);
    return uptimeData.totalUptime;
  }

  async checkMaintenance(id: string): Promise<boolean> {
    const [lastMaintenance, activeTickets] = await Promise.all([
      this.getLastMaintenance(id),
      this.atmRepository.getActiveTickets(id),
    ]);

    // Necesita mantenimiento si:
    // 1. Nunca ha tenido mantenimiento
    // 2. El último mantenimiento fue hace más de 30 días
    // 3. Tiene tickets activos
    if (!lastMaintenance) {
      return true;
    }

    const daysSinceLastMaintenance =
      (new Date().getTime() - lastMaintenance.getTime()) /
      (1000 * 60 * 60 * 24);

    return daysSinceLastMaintenance > 30 || activeTickets > 0;
  }
}
