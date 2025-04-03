import { Repository, DataSource } from "typeorm";
import { ATM } from "../../../../domain/entities/atm.entity";
import { IAtmRepositoryPort } from "../../ports/output/atm-repository.port";
import { Point } from "geojson";

export class AtmRepository implements IAtmRepositoryPort {
  private repository: Repository<ATM>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(ATM);
  }

  async findById(id: string): Promise<ATM | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["client", "created_by", "updated_by"],
    });
  }

  async findBySerialNumber(serialNumber: string): Promise<ATM | null> {
    return this.repository.findOne({
      where: { serial_number: serialNumber },
    });
  }

  async create(atmData: Partial<ATM>): Promise<ATM> {
    const atm = this.repository.create(atmData);
    return this.repository.save(atm);
  }

  async update(id: string, atmData: Partial<ATM>): Promise<ATM> {
    await this.repository.update(id, atmData);
    const updatedAtm = await this.findById(id);
    if (!updatedAtm) {
      throw new Error("ATM not found after update");
    }
    return updatedAtm;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async list(
    page: number = 1,
    limit: number = 10
  ): Promise<{ atms: ATM[]; total: number }> {
    const [atms, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ["client"],
      order: {
        created_at: "DESC",
      },
    });

    return { atms, total };
  }

  async findByLocation(point: Point, radius: number): Promise<ATM[]> {
    // Usando ST_DWithin para búsqueda por radio en metros
    const atms = await this.repository
      .createQueryBuilder("atm")
      .where(
        "ST_DWithin(atm.location::geography, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radius)",
        {
          latitude: point.coordinates[1],
          longitude: point.coordinates[0],
          radius,
        }
      )
      .getMany();

    return atms;
  }

  async findByClient(clientId: string): Promise<ATM[]> {
    return this.repository.find({
      where: { client_id: clientId },
      relations: ["client"],
    });
  }

  async findByZone(zoneId: string): Promise<ATM[]> {
    return this.repository.find({
      where: { zone_id: zoneId },
    });
  }

  async getLastMaintenanceDate(id: string): Promise<Date | null> {
    // Consulta a la tabla de mantenimiento para obtener la última fecha
    const result = await this.repository.query(
      `
      SELECT completed_at 
      FROM maintenance_records 
      WHERE atm_id = $1 
      AND status = 'completed' 
      ORDER BY completed_at DESC 
      LIMIT 1
    `,
      [id]
    );

    return result.length > 0 ? result[0].completed_at : null;
  }

  async getUptimeData(
    id: string
  ): Promise<{ lastDowntime: Date | null; totalUptime: number }> {
    // Consulta para obtener datos de tiempo de actividad
    const result = await this.repository.query(
      `
      SELECT 
        MAX(CASE WHEN status = 'out_of_service' THEN created_at END) as last_downtime,
        COUNT(CASE WHEN status = 'operational' THEN 1 END) * 100.0 / COUNT(*) as uptime_percentage
      FROM atm_status_log
      WHERE atm_id = $1
      AND created_at >= NOW() - INTERVAL '30 days'
    `,
      [id]
    );

    return {
      lastDowntime: result[0].last_downtime,
      totalUptime: result[0].uptime_percentage || 100,
    };
  }

  async getActiveTickets(id: string): Promise<number> {
    // Consulta para obtener el número de tickets activos
    const result = await this.repository.query(
      `
      SELECT COUNT(*) as active_tickets
      FROM tickets
      WHERE atm_id = $1
      AND status IN ('open', 'in_progress')
    `,
      [id]
    );

    return parseInt(result[0].active_tickets);
  }
}
