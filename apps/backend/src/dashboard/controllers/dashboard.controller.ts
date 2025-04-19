import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardService } from '../services/dashboard.service';
import { Activity, DashboardStatsResponse, TicketDistributionResponse } from '../dto/dashboard.dto';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles('ADMIN', 'MANAGER', 'VIEWER')
  async getStats(): Promise<DashboardStatsResponse> {
    return this.dashboardService.getStats();
  }

  @Get('activity')
  @Roles('ADMIN', 'MANAGER', 'VIEWER')
  async getRecentActivity(): Promise<Activity[]> {
    return this.dashboardService.getRecentActivity();
  }

  @Get('tickets/distribution')
  @Roles('ADMIN', 'MANAGER', 'VIEWER')
  async getTicketDistribution(): Promise<TicketDistributionResponse> {
    return this.dashboardService.getTicketDistribution();
  }
}
