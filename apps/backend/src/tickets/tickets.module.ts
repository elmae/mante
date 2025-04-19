import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../domain/entities/ticket.entity';
import { Comment } from '../domain/entities/comment.entity';
import { Attachment } from '../domain/entities/attachment.entity';
import { TicketsController } from './controllers/tickets.controller';
import { TicketsService } from './services/tickets.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Comment, Attachment]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/tickets',
        filename: (
          _req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void
        ) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        }
      })
    })
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService]
})
export class TicketsModule {}
