import { NestFactory } from '@nestjs/core';
import { ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as cors from 'cors';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de error handling global
  app.useGlobalFilters(new UnauthorizedException());

  // Configuración global de pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  // Middlewares
  app.use(compression());
  app.use(cors());
  app.use(helmet());

  // Configurar prefijo global de API
  app.setGlobalPrefix('api/v1');

  // Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('Mante API')
    .setDescription('API para el sistema de mantenimiento de ATMs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
}

bootstrap();
