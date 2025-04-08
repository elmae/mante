import { DataSource, Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../domain/entities/ticket.entity';

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

function getStatusColor(status: string): string {
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

  constructor(private dataSource: DataSource) {
    this.ticketRepository = this.dataSource.getRepository(Ticket);
  }

  async getStats(): Promise<{
    stats: DashboardStats;
    trends: Record<keyof DashboardStats, DashboardTrends>;
  }> {
    const [pending, completed] = await Promise.all([
      this.ticketRepository.count({ where: { status: TicketStatus.OPEN } }),
      this.ticketRepository.count({ where: { status: TicketStatus.CLOSED } })
    ]);

    return {
      stats: {
        pendingJobs: pending,
        averageResponseTime: '2h',
        pendingIssues: 0,
        completedOrders: completed
      },
      trends: {
        pendingJobs: { value: 0, isPositive: false },
        averageResponseTime: { value: 0, isPositive: false },
        pendingIssues: { value: 0, isPositive: false },
        completedOrders: { value: 0, isPositive: false }
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
      color: getStatusColor(r.status)
    }));

    return {
      data,
      total: data.reduce((sum, r) => sum + r.count, 0)
    };
  }
}
