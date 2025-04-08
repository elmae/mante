import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard';
import { DataSource } from 'typeorm';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor(private dataSource: DataSource) {
    this.dashboardService = new DashboardService(this.dataSource);
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await this.dashboardService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }

  async getRecentActivity(req: Request, res: Response) {
    try {
      const activity = await this.dashboardService.getRecentActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener actividad reciente' });
    }
  }

  async getTicketDistribution(req: Request, res: Response) {
    try {
      const distribution = await this.dashboardService.getTicketDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener distribución de tickets' });
    }
  }
}
