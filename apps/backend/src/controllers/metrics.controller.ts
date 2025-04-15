import { Request, Response } from 'express';
import { MetricsService } from '../services/metrics.service';
import { DataSource } from 'typeorm';
import { MetricsQueryOptions } from '../domain/dtos/metrics-filter.dto';
import { TicketType, TicketPriority } from '../domain/entities/ticket.entity';

export class MetricsController {
  private metricsService: MetricsService;

  constructor(private dataSource: DataSource) {
    this.metricsService = new MetricsService(this.dataSource);
  }

  private buildMetricsOptions(req: Request): MetricsQueryOptions {
    const {
      startDate,
      endDate,
      technician_id,
      client_id,
      atm_id,
      atm_model,
      atm_brand,
      atm_location,
      ticket_type,
      priority,
      category,
      subcategory,
      tags,
      sla_compliant,
      has_resolution,
      groupBy,
      includeTechnicianMetrics,
      includeATMMetrics,
      timeUnit,
      raw
    } = req.query;

    const filter: MetricsQueryOptions['filter'] = {
      ...(startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string)
          }
        : {}),
      ...(technician_id && { technician_id: technician_id as string }),
      ...(client_id && { client_id: client_id as string }),
      ...(atm_id && { atm_id: atm_id as string }),
      ...(atm_model && { atm_model: atm_model as string }),
      ...(atm_brand && { atm_brand: atm_brand as string }),
      ...(atm_location && { atm_location: atm_location as string }),
      ...(ticket_type && {
        ticket_type: this.validateTicketType(ticket_type as string)
      }),
      ...(priority && {
        priority: this.validateTicketPriority(priority as string)
      }),
      ...(category && { category: category as string }),
      ...(subcategory && { subcategory: subcategory as string }),
      ...(tags && { tags: (tags as string).split(',') }),
      ...(sla_compliant !== undefined && { sla_compliant: sla_compliant === 'true' }),
      ...(has_resolution !== undefined && { has_resolution: has_resolution === 'true' })
    };

    return {
      filter,
      ...(groupBy && {
        aggregation: {
          timeUnit: this.validateTimeUnit(timeUnit as string),
          includeTimeMetrics: true,
          includeTicketMetrics: true,
          includeSLAMetrics: true,
          includeTechnicianMetrics: includeTechnicianMetrics === 'true',
          includeATMMetrics: includeATMMetrics === 'true',
          rawData: raw === 'true'
        }
      })
    };
  }

  private validateTicketType(type: string): TicketType {
    if (Object.values(TicketType).includes(type as TicketType)) {
      return type as TicketType;
    }
    throw new Error(`Tipo de ticket inválido: ${type}`);
  }

  private validateTicketPriority(priority: string): TicketPriority {
    if (Object.values(TicketPriority).includes(priority as TicketPriority)) {
      return priority as TicketPriority;
    }
    throw new Error(`Prioridad de ticket inválida: ${priority}`);
  }

  private validateTimeUnit(timeUnit: string): 'day' | 'week' | 'month' | 'year' {
    const validUnits = ['day', 'week', 'month', 'year'];
    if (validUnits.includes(timeUnit)) {
      return timeUnit as 'day' | 'week' | 'month' | 'year';
    }
    return 'day'; // valor por defecto
  }

  async getTimeMetrics(req: Request, res: Response): Promise<void> {
    try {
      const options = this.buildMetricsOptions(req);
      const metrics = await this.metricsService.calculateTimeMetrics(options);
      res.json(metrics);
    } catch (error) {
      console.error('Error en getTimeMetrics:', error);
      res.status(500).json({
        error: 'Error al obtener métricas de tiempo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getTicketMetrics(req: Request, res: Response): Promise<void> {
    try {
      const options = this.buildMetricsOptions(req);
      const metrics = await this.metricsService.getTicketMetrics(options);
      res.json(metrics);
    } catch (error) {
      console.error('Error en getTicketMetrics:', error);
      res.status(500).json({
        error: 'Error al obtener métricas de tickets',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getFullMetrics(req: Request, res: Response): Promise<void> {
    try {
      const options = this.buildMetricsOptions(req);
      const metrics = await this.metricsService.getMetricsSummary(options);
      res.json(metrics);
    } catch (error) {
      console.error('Error en getFullMetrics:', error);
      res.status(500).json({
        error: 'Error al obtener métricas completas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getHistoricalMetrics(req: Request, res: Response): Promise<void> {
    try {
      const options = this.buildMetricsOptions(req);
      const metrics = await this.metricsService.getHistoricalMetrics(options);
      res.json(metrics);
    } catch (error) {
      console.error('Error en getHistoricalMetrics:', error);
      res.status(500).json({
        error: 'Error al obtener métricas históricas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getTechnicianMetrics(req: Request, res: Response): Promise<void> {
    try {
      const options = this.buildMetricsOptions(req);
      const metrics = await this.metricsService.getTechnicianMetrics(options);
      res.json(metrics);
    } catch (error) {
      console.error('Error en getTechnicianMetrics:', error);
      res.status(500).json({
        error: 'Error al obtener métricas de técnicos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getATMMetrics(req: Request, res: Response): Promise<void> {
    try {
      const options = this.buildMetricsOptions(req);
      const metrics = await this.metricsService.getATMMetrics(options);
      res.json(metrics);
    } catch (error) {
      console.error('Error en getATMMetrics:', error);
      res.status(500).json({
        error: 'Error al obtener métricas de ATMs',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getCategoryMetrics(req: Request, res: Response): Promise<void> {
    try {
      const options = this.buildMetricsOptions(req);
      const metrics = await this.metricsService.getCategoryMetrics(options);
      res.json(metrics);
    } catch (error) {
      console.error('Error en getCategoryMetrics:', error);
      res.status(500).json({
        error: 'Error al obtener métricas por categoría',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
