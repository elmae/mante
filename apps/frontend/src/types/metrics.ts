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

export interface CategoryMetric {
  category: string;
  subcategory?: string;
  ticket_count: number;
  average_resolution_time: number;
  sla_compliance_rate: number;
  trending: boolean;
}

export interface TechnicianMetric {
  technician_id: string;
  technician_name: string;
  assigned_tickets: number;
  completed_tickets: number;
  average_resolution_time: number;
  sla_compliance_rate: number;
}

export interface ATMMetric {
  atm_id: string;
  model: string;
  brand: string;
  location: string;
  incidents_count: number;
  uptime_percentage: number;
  average_resolution_time: number;
  most_common_issues: Array<{
    category: string;
    count: number;
  }>;
}

export interface MetricsSummary {
  timeMetrics: TimeMetrics;
  ticketMetrics: TicketMetrics;
  categoryMetrics?: CategoryMetric[];
  technicianMetrics?: TechnicianMetric[];
  atmMetrics?: ATMMetric[];
}

export interface HistoricalDataPoint {
  date: string;
  metrics: {
    timeMetrics: TimeMetrics;
    ticketMetrics: TicketMetrics;
  };
}

export interface Period {
  startDate: Date;
  endDate: Date;
}
