import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './controllers/maintenance.controller';
import { MaintenanceService } from './services/maintenance.service';
import { Maintenance } from '../domain/entities/maintenance.entity';
import { MaintenancePart } from '../domain/entities/maintenance-part.entity';
import { MaintenanceTask } from '../domain/entities/maintenance-task.entity';
import { MaintenanceComment } from '../domain/entities/maintenance-comment.entity';
import { MaintenanceAttachment } from '../domain/entities/maintenance-attachment.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AtmsModule } from '../atms/atms.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Maintenance,
      MaintenancePart,
      MaintenanceTask,
      MaintenanceComment,
      MaintenanceAttachment
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AtmsModule),
    forwardRef(() => TicketsModule)
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService]
})
export class MaintenanceModule {}
