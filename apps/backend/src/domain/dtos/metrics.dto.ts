export interface TimeMetrics {
  averageResponseTime: number;
  averageResolutionTime: number;
  slaComplianceRate: number;
}

export interface TicketMetrics {
  total: number;
  openTickets: number;
  closedTickets: number;
  inProgressTickets: number;
}

export interface HistoricalMetrics {
  date: Date;
  metrics: {
    timeMetrics: TimeMetrics;
    ticketMetrics: TicketMetrics;
  };
}
