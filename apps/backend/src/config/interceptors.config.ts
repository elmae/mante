import { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  TransformInterceptor,
  LoggingInterceptor,
  ErrorInterceptor,
  TimeoutInterceptor,
  CacheInterceptor
} from '../common/interceptors';

export interface InterceptorConfig {
  transform: boolean;
  logging: boolean;
  timeout: boolean;
  cache: boolean;
  timeoutValue: number;
  cacheTtl: number;
}

export const DEFAULT_INTERCEPTOR_CONFIG: InterceptorConfig = {
  transform: true,
  logging: true,
  timeout: true,
  cache: false,
  timeoutValue: 30000, // 30 segundos
  cacheTtl: 300 // 5 minutos
};

export function createInterceptorProviders(config: Partial<InterceptorConfig> = {}): Provider[] {
  const finalConfig = { ...DEFAULT_INTERCEPTOR_CONFIG, ...config };
  const providers: Provider[] = [];

  if (finalConfig.transform) {
    providers.push({
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor
    });
  }

  if (finalConfig.logging) {
    providers.push({
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    });
  }

  // El interceptor de errores siempre se incluye
  providers.push({
    provide: APP_INTERCEPTOR,
    useClass: ErrorInterceptor
  });

  if (finalConfig.timeout) {
    providers.push({
      provide: APP_INTERCEPTOR,
      useFactory: () => new TimeoutInterceptor(finalConfig.timeoutValue)
    });
  }

  if (finalConfig.cache) {
    providers.push({
      provide: APP_INTERCEPTOR,
      useFactory: () => new CacheInterceptor(finalConfig.cacheTtl)
    });
  }

  return providers;
}

// Función de utilidad para obtener los interceptores según el entorno
export function getInterceptorConfig(environment: string): Partial<InterceptorConfig> {
  switch (environment) {
    case 'production':
      return {
        transform: true,
        logging: true,
        timeout: true,
        cache: true,
        timeoutValue: 60000, // 1 minuto en producción
        cacheTtl: 600 // 10 minutos en producción
      };

    case 'development':
      return {
        transform: true,
        logging: true,
        timeout: true,
        cache: false,
        timeoutValue: 30000 // 30 segundos en desarrollo
      };

    case 'test':
      return {
        transform: true,
        logging: false,
        timeout: false,
        cache: false
      };

    default:
      return DEFAULT_INTERCEPTOR_CONFIG;
  }
}
