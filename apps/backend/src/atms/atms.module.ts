import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ATM, Branch } from '../domain/entities';
import { AtmsService } from './services/atms.service';
import { AtmsController } from './controllers/atms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ATM, Branch])],
  controllers: [AtmsController],
  providers: [AtmsService],
  exports: [AtmsService]
})
export class AtmsModule {}
