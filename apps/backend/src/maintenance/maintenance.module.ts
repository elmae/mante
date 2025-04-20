import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Maintenance,
  MaintenancePart,
  MaintenanceTask,
  MaintenanceComment,
  MaintenanceAttachment
} from '../domain/entities';
import { MaintenanceService } from './services/maintenance.service';
import { MaintenanceTasksService } from './services/maintenance-tasks.service';
import { MaintenanceController } from './controllers/maintenance.controller';
import { MaintenanceTasksController } from './controllers/maintenance-tasks.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Maintenance,
      MaintenancePart,
      MaintenanceTask,
      MaintenanceComment,
      MaintenanceAttachment
    ]),
    UsersModule
  ],
  controllers: [MaintenanceController, MaintenanceTasksController],
  providers: [MaintenanceService, MaintenanceTasksService],
  exports: [MaintenanceService, MaintenanceTasksService]
})
export class MaintenanceModule {}
