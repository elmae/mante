export interface DashboardStats {
  pendingJobs: number;
  averageResponseTime: string;
  pendingIssues: number;
  completedOrders: number;
}

export interface DashboardTrends {
  value: number;
  isPositive: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  status: string;
}

export interface TicketDistribution {
  name: string;
  count: number;
  color: string;
}

export interface DashboardStatsResponse {
  stats: DashboardStats;
  trends: Record<keyof DashboardStats, DashboardTrends>;
}

export interface TicketDistributionResponse {
  data: TicketDistribution[];
  total: number;
}
