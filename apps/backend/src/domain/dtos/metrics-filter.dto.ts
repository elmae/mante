import { TicketType, TicketPriority } from '../entities/ticket.entity';

export interface MetricsFilterDTO {
  // Filtros de período
  startDate?: Date;
  endDate?: Date;

  // Filtros de entidades principales
  technician_id?: string;
  client_id?: string;
  atm_id?: string;

  // Filtros de clasificación de tickets
  ticket_type?: TicketType;
  priority?: TicketPriority;

  // Filtros de ATM
  atm_model?: string;
  atm_brand?: string;
  atm_location?: string;

  // Filtros de estado
  sla_compliant?: boolean;
  has_resolution?: boolean;

  // Filtros de categorización
  category?: string;
  subcategory?: string;
  tags?: string[];

  // Filtros de agrupación
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

export interface MetricsAggregationOptions {
  // Opciones de agregación temporal
  timeUnit: 'day' | 'week' | 'month' | 'year';

  // Campos a incluir en la agregación
  includeTimeMetrics: boolean;
  includeTicketMetrics: boolean;
  includeSLAMetrics: boolean;
  includeATMMetrics?: boolean;
  includeTechnicianMetrics?: boolean;

  // Opciones de formato
  rawData?: boolean;
}

export interface MetricsQueryOptions {
  filter: MetricsFilterDTO;
  aggregation?: MetricsAggregationOptions;
}

// DTOs específicos para las diferentes vistas de métricas
export interface TechnicianMetrics {
  technician_id: string;
  technician_name: string;
  assigned_tickets: number;
  completed_tickets: number;
  average_resolution_time: number;
  sla_compliance_rate: number;
}

export interface ATMMetrics {
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

export interface CategoryMetrics {
  category: string;
  subcategory?: string;
  ticket_count: number;
  average_resolution_time: number;
  sla_compliance_rate: number;
  trending: boolean;
}

export interface MetricsSummary {
  timeMetrics: {
    averageResponseTime: number;
    averageResolutionTime: number;
    slaComplianceRate: number;
  };
  ticketMetrics: {
    total: number;
    openTickets: number;
    closedTickets: number;
    inProgressTickets: number;
  };
  technicianMetrics?: TechnicianMetrics[];
  atmMetrics?: ATMMetrics[];
  categoryMetrics?: CategoryMetrics[];
}
