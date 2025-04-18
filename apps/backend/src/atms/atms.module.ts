import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ATM } from '../domain/entities/atm.entity';
import { AtmsController } from './controllers/atms.controller';
import { AtmsService } from './services/atms.service';

@Module({
  imports: [TypeOrmModule.forFeature([ATM])],
  controllers: [AtmsController],
  providers: [AtmsService],
  exports: [AtmsService]
})
export class AtmsModule {}
