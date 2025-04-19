import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../domain/entities/ticket.entity';
import { MetricsService } from '../services/metrics.service';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [DashboardController],
  providers: [DashboardService, MetricsService],
  exports: [DashboardService]
})
export class DashboardModule {}
