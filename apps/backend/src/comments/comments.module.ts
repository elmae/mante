import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { Comment } from '../domain/entities/comment.entity';
import { MaintenanceComment } from '../domain/entities/maintenance-comment.entity';
import { TicketsModule } from '../tickets/tickets.module';
import { MaintenanceModule } from '../maintenance/maintenance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, MaintenanceComment]),
    forwardRef(() => TicketsModule),
    forwardRef(() => MaintenanceModule)
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService]
})
export class CommentsModule {}
