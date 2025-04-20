import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Configuración global
  app.enableCors({
    origin: configService.get<string>('ALLOWED_ORIGINS', '*').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    exposedHeaders: ['Content-Disposition']
  });

  // Middlewares
  app.use(compression());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: environment === 'production'
    })
  );

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      validateCustomDecorators: true
    })
  );

  // Configuración de Swagger
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ATM Maintenance API')
      .setDescription('API para sistema de mantenimiento de ATMs')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Endpoints de autenticación')
      .addTag('users', 'Gestión de usuarios')
      .addTag('atms', 'Gestión de ATMs')
      .addTag('maintenance', 'Gestión de mantenimientos')
      .addTag('tickets', 'Gestión de tickets')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha'
      }
    });
  }

  // Prefix global
  app.setGlobalPrefix('api/v1');

  // Manejo de errores no capturados
  process.on('unhandledRejection', (reason, promise) => {
    Logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'Bootstrap');
  });

  process.on('uncaughtException', error => {
    Logger.error(`Uncaught Exception: ${error.message}`, error.stack, 'Bootstrap');
    process.exit(1);
  });

  // Iniciar servidor
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`, 'Bootstrap');

  if (environment !== 'production') {
    Logger.log(
      `📚 Swagger documentation is available at: http://localhost:${port}/api/docs`,
      'Bootstrap'
    );
  }
}

bootstrap().catch(error => {
  Logger.error(`❌ Error starting application: ${error.message}`, error.stack);
  process.exit(1);
});
