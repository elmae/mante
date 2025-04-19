import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from '../services/metrics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/auth.types';
import { MetricsFilterDto } from '../dto/metrics-filter.dto';

@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.TECHNICIAN)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('time')
  async getTimeMetrics(@Query() filter: MetricsFilterDto) {
    return this.metricsService.calculateTimeMetrics(filter);
  }

  @Get('tickets')
  async getTicketMetrics(@Query() filter: MetricsFilterDto) {
    return this.metricsService.getTicketMetrics(filter);
  }

  @Get('full')
  async getFullMetrics(@Query() filter: MetricsFilterDto) {
    return this.metricsService.getMetricsSummary(filter);
  }

  @Get('historical')
  async getHistoricalMetrics(@Query() filter: MetricsFilterDto) {
    return this.metricsService.getHistoricalMetrics(filter);
  }

  @Get('technicians')
  async getTechnicianMetrics(@Query() filter: MetricsFilterDto) {
    return this.metricsService.getTechnicianMetrics(filter);
  }

  @Get('atms')
  async getATMMetrics(@Query() filter: MetricsFilterDto) {
    return this.metricsService.getATMMetrics(filter);
  }

  @Get('categories')
  async getCategoryMetrics(@Query() filter: MetricsFilterDto) {
    return this.metricsService.getCategoryMetrics(filter);
  }
}
