import { DataSource, Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../domain/entities/ticket.entity';
import { MetricsService } from './metrics.service';

interface DashboardStats {
  pendingJobs: number;
  averageResponseTime: string;
  pendingIssues: number;
  completedOrders: number;
}

interface DashboardTrends {
  value: number;
  isPositive: boolean;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  status: string;
}

interface TicketDistribution {
  name: string;
  count: number;
  color: string;
}

function getStatusColor(status: TicketStatus): string {
  switch (status) {
    case TicketStatus.OPEN:
      return '#FF6384';
    case TicketStatus.IN_PROGRESS:
      return '#36A2EB';
    case TicketStatus.CLOSED:
      return '#4BC0C0';
    default:
      return '#FFCE56';
  }
}

export class DashboardService {
  private ticketRepository: Repository<Ticket>;
  private metricsService: MetricsService;

  constructor(private dataSource: DataSource) {
    this.ticketRepository = this.dataSource.getRepository(Ticket);
    this.metricsService = new MetricsService(dataSource);
  }

  async getStats(): Promise<{
    stats: DashboardStats;
    trends: Record<keyof DashboardStats, DashboardTrends>;
  }> {
    // Obtener métricas actuales
    const currentOptions = {
      filter: {}
    };

    const [timeMetrics, ticketMetrics] = await Promise.all([
      this.metricsService.calculateTimeMetrics(currentOptions),
      this.metricsService.getTicketMetrics(currentOptions)
    ]);

    // Obtener métricas del período anterior (últimos 7 días)
    const previousPeriod = {
      filter: {
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 días atrás
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días atrás
      }
    };

    const [previousTimeMetrics, previousTicketMetrics] = await Promise.all([
      this.metricsService.calculateTimeMetrics(previousPeriod),
      this.metricsService.getTicketMetrics(previousPeriod)
    ]);

    // Formatear tiempo de respuesta para la interfaz
    const formattedResponseTime = this.formatTime(timeMetrics.averageResponseTime);

    return {
      stats: {
        pendingJobs: ticketMetrics.openTickets + ticketMetrics.inProgressTickets,
        averageResponseTime: formattedResponseTime,
        pendingIssues: ticketMetrics.openTickets,
        completedOrders: ticketMetrics.closedTickets
      },
      trends: {
        pendingJobs: this.calculateTrend(
          ticketMetrics.openTickets + ticketMetrics.inProgressTickets,
          previousTicketMetrics.openTickets + previousTicketMetrics.inProgressTickets
        ),
        averageResponseTime: this.calculateTrend(
          timeMetrics.averageResponseTime,
          previousTimeMetrics.averageResponseTime
        ),
        pendingIssues: this.calculateTrend(
          ticketMetrics.openTickets,
          previousTicketMetrics.openTickets
        ),
        completedOrders: this.calculateTrend(
          ticketMetrics.closedTickets,
          previousTicketMetrics.closedTickets
        )
      }
    };
  }

  async getRecentActivity(): Promise<Activity[]> {
    const recentTickets = await this.ticketRepository.find({
      order: { updated_at: 'DESC' },
      take: 5
    });

    return recentTickets.map(ticket => ({
      id: ticket.id,
      title: ticket.title,
      description: `Ticket ${ticket.id} updated`,
      timestamp: ticket.updated_at,
      status: ticket.status
    }));
  }

  async getTicketDistribution(): Promise<{
    data: TicketDistribution[];
    total: number;
  }> {
    const results = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(ticket.id)', 'count')
      .groupBy('ticket.status')
      .getRawMany();

    const data = results.map((r: { status: string; count: string }) => ({
      name: r.status,
      count: parseInt(r.count),
      color: getStatusColor(r.status as TicketStatus)
    }));

    return {
      data,
      total: data.reduce((sum, r) => sum + r.count, 0)
    };
  }

  private formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  private calculateTrend(current: number, previous: number): DashboardTrends {
    if (previous === 0) {
      return { value: 0, isPositive: false };
    }
    const percentageChange = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(percentageChange)),
      isPositive: percentageChange >= 0
    };
  }
}
