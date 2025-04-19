import {
  IsOptional,
  IsISO8601,
  IsUUID,
  IsIn,
  IsBoolean,
  IsString,
  IsInt,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketType, TicketPriority } from '../../domain/entities/ticket.entity';

type TimeUnit = 'day' | 'week' | 'month' | 'year';
const TIME_UNITS: TimeUnit[] = ['day', 'week', 'month', 'year'];

export class MetricsFilterDto {
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  technician_id?: string;

  @IsOptional()
  @IsUUID()
  client_id?: string;

  @IsOptional()
  @IsUUID()
  atm_id?: string;

  @IsOptional()
  @IsString()
  atm_model?: string;

  @IsOptional()
  @IsString()
  atm_brand?: string;

  @IsOptional()
  @IsString()
  atm_location?: string;

  @IsOptional()
  @IsIn(Object.values(TicketType) as string[])
  ticket_type?: TicketType;

  @IsOptional()
  @IsIn(Object.values(TicketPriority) as string[])
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  sla_compliant?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  has_resolution?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(TIME_UNITS)
  timeUnit?: TimeUnit = 'day';

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeTechnicianMetrics?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeATMMetrics?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  raw?: boolean;
}

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
  subcategory: string;
  ticket_count: number;
  average_resolution_time: number;
  sla_compliance_rate: number;
  trending: boolean;
}

export interface MetricsSummary {
  timeMetrics: TimeMetrics;
  ticketMetrics: TicketMetrics;
  technicianMetrics?: TechnicianMetrics[];
  atmMetrics?: ATMMetrics[];
  categoryMetrics: CategoryMetrics[];
}

export interface HistoricalMetrics {
  date: Date;
  metrics: {
    timeMetrics: TimeMetrics;
    ticketMetrics: TicketMetrics;
  };
}
