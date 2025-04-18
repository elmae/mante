import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtmsModule } from './atms/atms.module';
import { ATM } from './domain/entities/atm.entity';
import { Client } from './domain/entities/client.entity';
import { User } from './domain/entities/user.entity';
import { GeographicZone } from './domain/entities/geographic-zone.entity';
import { MaintenanceRecord } from './domain/entities/maintenance-record.entity';
import { Ticket } from './domain/entities/ticket.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [ATM, Client, User, GeographicZone, MaintenanceRecord, Ticket],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
        ssl: configService.get('NODE_ENV') === 'production'
      }),
      inject: [ConfigService]
    }),
    AtmsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
