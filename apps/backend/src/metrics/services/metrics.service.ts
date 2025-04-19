import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In, Not, IsNull } from 'typeorm';
import { Ticket, TicketStatus } from '../../domain/entities/ticket.entity';
import {
  MetricsFilterDto,
  TimeMetrics,
  TicketMetrics,
  TechnicianMetrics,
  ATMMetrics,
  CategoryMetrics,
  MetricsSummary,
  HistoricalMetrics
} from '../dto/metrics-filter.dto';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>
  ) {}

  private buildWhereClause(filter?: MetricsFilterDto): FindOptionsWhere<Ticket> {
    if (!filter) return {};

    const whereClause: any = {};

    if (filter.startDate && filter.endDate) {
      whereClause.created_at = Between(new Date(filter.startDate), new Date(filter.endDate));
    }

    if (filter.technician_id) {
      whereClause['assigned_to.id'] = filter.technician_id;
    }

    if (filter.client_id) {
      whereClause['atm.client.id'] = filter.client_id;
    }

    if (filter.atm_id) {
      whereClause['atm.id'] = filter.atm_id;
    }

    if (filter.atm_model) {
      whereClause['atm.model'] = filter.atm_model;
    }

    if (filter.atm_brand) {
      whereClause['atm.brand'] = filter.atm_brand;
    }

    if (filter.atm_location) {
      whereClause['atm.location'] = filter.atm_location;
    }

    if (filter.ticket_type) {
      whereClause.type = filter.ticket_type;
    }

    if (filter.priority) {
      whereClause.priority = filter.priority;
    }

    if (filter.category) {
      whereClause.category = filter.category;
    }

    if (filter.subcategory) {
      whereClause.subcategory = filter.subcategory;
    }

    if (filter.sla_compliant !== undefined) {
      whereClause.met_sla = filter.sla_compliant;
    }

    if (filter.has_resolution !== undefined) {
      if (filter.has_resolution) {
        whereClause.completion_date = Not(IsNull());
      } else {
        whereClause.completion_date = IsNull();
      }
    }

    return whereClause;
  }

  async getMetricsSummary(filter?: MetricsFilterDto): Promise<MetricsSummary> {
    const [timeMetrics, ticketMetrics] = await Promise.all([
      this.calculateTimeMetrics(filter),
      this.getTicketMetrics(filter)
    ]);

    let additionalMetrics = {};

    if (filter?.includeTechnicianMetrics) {
      const technicianMetrics = await this.getTechnicianMetrics(filter);
      additionalMetrics = { ...additionalMetrics, technicianMetrics };
    }

    if (filter?.includeATMMetrics) {
      const atmMetrics = await this.getATMMetrics(filter);
      additionalMetrics = { ...additionalMetrics, atmMetrics };
    }

    const categoryMetrics = await this.getCategoryMetrics(filter);

    return {
      timeMetrics,
      ticketMetrics,
      ...additionalMetrics,
      categoryMetrics
    };
  }

  async calculateTimeMetrics(filter?: MetricsFilterDto): Promise<TimeMetrics> {
    const whereClause = this.buildWhereClause(filter);

    const tickets = await this.ticketRepository.find({
      where: whereClause,
      relations: ['atm', 'atm.client', 'assigned_to']
    });

    if (!tickets.length) {
      return {
        averageResponseTime: 0,
        averageResolutionTime: 0,
        slaComplianceRate: 0
      };
    }

    let totalResolutionTime = 0;
    let ticketsWithinSla = 0;
    let completedTickets = 0;

    tickets.forEach(ticket => {
      if (ticket.completion_date) {
        const resolutionTime = this.calculateMinutesDifference(
          ticket.created_at,
          ticket.completion_date
        );
        totalResolutionTime += resolutionTime;
        completedTickets++;

        if (ticket.met_sla) {
          ticketsWithinSla++;
        }
      }
    });

    const avgResolutionTime = completedTickets
      ? Math.round(totalResolutionTime / completedTickets)
      : 0;

    const slaComplianceRate = completedTickets
      ? Math.round((ticketsWithinSla / completedTickets) * 100)
      : 0;

    const avgResponseTime = await this.calculateAverageResponseTime(whereClause);

    return {
      averageResponseTime: avgResponseTime,
      averageResolutionTime: avgResolutionTime,
      slaComplianceRate
    };
  }

  async getTicketMetrics(filter?: MetricsFilterDto): Promise<TicketMetrics> {
    const whereClause = this.buildWhereClause(filter);

    const [total, openTickets, closedTickets, inProgressTickets] = await Promise.all([
      this.ticketRepository.count({ where: whereClause }),
      this.ticketRepository.count({
        where: { ...whereClause, status: TicketStatus.OPEN }
      }),
      this.ticketRepository.count({
        where: { ...whereClause, status: TicketStatus.CLOSED }
      }),
      this.ticketRepository.count({
        where: { ...whereClause, status: TicketStatus.IN_PROGRESS }
      })
    ]);

    return {
      total,
      openTickets,
      closedTickets,
      inProgressTickets
    };
  }

  async getHistoricalMetrics(filter?: MetricsFilterDto): Promise<HistoricalMetrics[]> {
    const timeUnit = filter?.timeUnit ?? 'day';

    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .select(`DATE_TRUNC('${timeUnit}', ticket.created_at)`, 'date')
      .addSelect('COUNT(ticket.id)', 'total')
      .addSelect('SUM(CASE WHEN ticket.status = :open THEN 1 ELSE 0 END)', 'openTickets')
      .addSelect('SUM(CASE WHEN ticket.status = :closed THEN 1 ELSE 0 END)', 'closedTickets')
      .addSelect(
        'SUM(CASE WHEN ticket.status = :inProgress THEN 1 ELSE 0 END)',
        'inProgressTickets'
      )
      .addSelect(
        'AVG(CASE WHEN ticket.completion_date IS NOT NULL THEN EXTRACT(EPOCH FROM ticket.completion_date - ticket.created_at)/60 END)',
        'avgResolutionTime'
      )
      .addSelect(
        'AVG(CASE WHEN ticket.first_response_at IS NOT NULL THEN EXTRACT(EPOCH FROM ticket.first_response_at - ticket.created_at)/60 END)',
        'avgResponseTime'
      )
      .addSelect(
        'AVG(CASE WHEN ticket.met_sla = true THEN 1 ELSE 0 END) * 100',
        'slaComplianceRate'
      )
      .where(this.buildWhereClause(filter))
      .setParameters({
        open: TicketStatus.OPEN,
        closed: TicketStatus.CLOSED,
        inProgress: TicketStatus.IN_PROGRESS
      });

    query.groupBy('date').orderBy('date', 'ASC');

    const results = await query.getRawMany();

    return results.map(result => ({
      date: new Date(result.date),
      metrics: {
        timeMetrics: {
          averageResponseTime: Math.round(result.avgResponseTime || 0),
          averageResolutionTime: Math.round(result.avgResolutionTime || 0),
          slaComplianceRate: Math.round(result.slaComplianceRate || 0)
        },
        ticketMetrics: {
          total: parseInt(result.total),
          openTickets: parseInt(result.openTickets || 0),
          closedTickets: parseInt(result.closedTickets || 0),
          inProgressTickets: parseInt(result.inProgressTickets || 0)
        }
      }
    }));
  }

  async getTechnicianMetrics(filter?: MetricsFilterDto): Promise<TechnicianMetrics[]> {
    const whereClause = this.buildWhereClause(filter);

    const technicians = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.assigned_to', 'technician')
      .select([
        'technician.id as technician_id',
        'technician.first_name as first_name',
        'technician.last_name as last_name',
        'COUNT(ticket.id) as assigned_tickets',
        'COUNT(CASE WHEN ticket.status = :closed THEN 1 END) as completed_tickets',
        'AVG(CASE WHEN ticket.completion_date IS NOT NULL THEN EXTRACT(EPOCH FROM ticket.completion_date - ticket.created_at)/60 END) as average_resolution_time',
        'AVG(CASE WHEN ticket.met_sla = true THEN 1 ELSE 0 END) * 100 as sla_compliance_rate'
      ])
      .where(whereClause)
      .setParameter('closed', TicketStatus.CLOSED)
      .groupBy('technician.id, technician.first_name, technician.last_name')
      .getRawMany();

    return technicians.map(t => ({
      technician_id: t.technician_id,
      technician_name: `${t.first_name} ${t.last_name}`.trim(),
      assigned_tickets: parseInt(t.assigned_tickets),
      completed_tickets: parseInt(t.completed_tickets),
      average_resolution_time: Math.round(t.average_resolution_time || 0),
      sla_compliance_rate: Math.round(t.sla_compliance_rate || 0)
    }));
  }

  async getATMMetrics(filter?: MetricsFilterDto): Promise<ATMMetrics[]> {
    const whereClause = this.buildWhereClause(filter);

    const atms = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.atm', 'atm')
      .select([
        'atm.id as atm_id',
        'atm.model as model',
        'atm.brand as brand',
        'atm.location as location',
        'COUNT(ticket.id) as incidents_count',
        'AVG(CASE WHEN ticket.completion_date IS NOT NULL THEN EXTRACT(EPOCH FROM ticket.completion_date - ticket.created_at)/60 END) as average_resolution_time'
      ])
      .where(whereClause)
      .groupBy('atm.id, atm.model, atm.brand, atm.location')
      .getRawMany();

    const results: ATMMetrics[] = [];

    for (const atm of atms) {
      const commonIssues = await this.ticketRepository
        .createQueryBuilder('ticket')
        .select('ticket.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('ticket.atm_id = :atmId', { atmId: atm.atm_id })
        .groupBy('ticket.category')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany();

      results.push({
        atm_id: atm.atm_id,
        model: atm.model,
        brand: atm.brand,
        location: atm.location,
        incidents_count: parseInt(atm.incidents_count),
        uptime_percentage: 100 - parseInt(atm.incidents_count) * 0.1,
        average_resolution_time: Math.round(atm.average_resolution_time || 0),
        most_common_issues: commonIssues.map(issue => ({
          category: issue.category,
          count: parseInt(issue.count)
        }))
      });
    }

    return results;
  }

  async getCategoryMetrics(filter?: MetricsFilterDto): Promise<CategoryMetrics[]> {
    const whereClause = this.buildWhereClause(filter);

    return await this.ticketRepository
      .createQueryBuilder('ticket')
      .select([
        'ticket.category',
        'ticket.subcategory',
        'COUNT(ticket.id) as ticket_count',
        'AVG(CASE WHEN ticket.completion_date IS NOT NULL THEN EXTRACT(EPOCH FROM ticket.completion_date - ticket.created_at)/60 END) as average_resolution_time',
        'AVG(CASE WHEN ticket.met_sla = true THEN 1 ELSE 0 END) * 100 as sla_compliance_rate'
      ])
      .where(whereClause)
      .groupBy('ticket.category, ticket.subcategory')
      .getRawMany()
      .then(categories =>
        categories.map(cat => ({
          category: cat.category,
          subcategory: cat.subcategory,
          ticket_count: parseInt(cat.ticket_count),
          average_resolution_time: Math.round(cat.average_resolution_time || 0),
          sla_compliance_rate: Math.round(cat.sla_compliance_rate || 0),
          trending: parseInt(cat.ticket_count) > 10
        }))
      );
  }

  private async calculateAverageResponseTime(
    whereClause: FindOptionsWhere<Ticket>
  ): Promise<number> {
    const tickets = await this.ticketRepository.find({
      where: whereClause,
      select: ['created_at', 'first_response_at']
    });

    if (!tickets.length) return 0;

    const ticketsWithResponse = tickets.filter(ticket => ticket.first_response_at);
    if (!ticketsWithResponse.length) return 0;

    const totalResponseTime = ticketsWithResponse.reduce((sum, ticket) => {
      return sum + this.calculateMinutesDifference(ticket.created_at, ticket.first_response_at!);
    }, 0);

    return Math.round(totalResponseTime / ticketsWithResponse.length);
  }

  private calculateMinutesDifference(startDate: Date, endDate: Date): number {
    const diffMilliseconds = endDate.getTime() - startDate.getTime();
    return Math.round(diffMilliseconds / (1000 * 60));
  }
}
