import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Módulos de la aplicación
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ClientsModule } from './clients/clients.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { NotificationsModule } from './notifications/notifications.module';

// Configuración
import { configuration } from './config/configuration';
import { validate } from './config/validation';
import { globalInterceptors } from './common/interceptors';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    // Framework modules
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: true,
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging')
      }),
      inject: [ConfigService]
    }),
    EventEmitterModule.forRoot({
      // Configuración global de eventos
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false
    }),
    ScheduleModule.forRoot(),

    // Application modules
    UsersModule,
    AuthModule,
    TicketsModule,
    MaintenanceModule,
    ClientsModule,
    DashboardModule,
    AttachmentsModule,
    NotificationsModule
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    },
    // Global interceptors
    ...globalInterceptors
  ]
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Log application configuration on startup
    const nodeEnv = this.configService.get('NODE_ENV');
    const port = this.configService.get('PORT');
    const dbHost = this.configService.get('database.host');

    console.log('Application Configuration:');
    console.log(`Environment: ${nodeEnv}`);
    console.log(`Port: ${port}`);
    console.log(`Database Host: ${dbHost}`);
  }
}
