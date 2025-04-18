import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ATM } from '../domain/entities/atm.entity';
import { AtmService } from '../services/atm/atm.service';
import { AtmController } from '../controllers/atm.controller';
import { AtmRepository } from '../services/atm/adapters/output/atm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ATM])],
  providers: [
    AtmService,
    {
      provide: 'IAtmRepositoryPort',
      useClass: AtmRepository
    }
  ],
  controllers: [AtmController],
  exports: [AtmService]
})
export class AtmModule {}
