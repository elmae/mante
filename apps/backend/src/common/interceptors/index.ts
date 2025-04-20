import { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

// Import interceptors
import { TransformInterceptor } from './transform.interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { ErrorInterceptor } from './error.interceptor';
import { TimeoutInterceptor } from './timeout.interceptor';
import { CacheInterceptor } from './cache.interceptor';

// Export interceptors
export { TransformInterceptor } from './transform.interceptor';
export { LoggingInterceptor } from './logging.interceptor';
export { ErrorInterceptor } from './error.interceptor';
export { TimeoutInterceptor } from './timeout.interceptor';
export { CacheInterceptor } from './cache.interceptor';

// Types
export type InterceptorResponse<T = any> = {
  statusCode: number;
  data: T;
  message?: string;
  timestamp?: string;
  path?: string;
  duration?: string;
};

// Providers array for global interceptors
export const globalInterceptors: Provider[] = [
  {
    provide: APP_INTERCEPTOR,
    useClass: TransformInterceptor
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ErrorInterceptor
  }
];

// Options interface
export interface InterceptorOptions {
  transform?: boolean;
  logging?: boolean;
  timeout?: boolean;
  cache?: boolean;
  timeoutValue?: number;
  cacheTtl?: number;
}

// Constants
export const INTERCEPTOR_METADATA = {
  TRANSFORM: 'transform:options',
  TIMEOUT: 'timeout:value',
  CACHE: 'cache:config'
} as const;

// Default configuration
export const DEFAULT_INTERCEPTOR_CONFIG: InterceptorOptions = {
  transform: true,
  logging: true,
  timeout: true,
  cache: false,
  timeoutValue: 30000, // 30 segundos
  cacheTtl: 300 // 5 minutos
};

// Utility decorator
export function WithInterceptors(options?: Partial<InterceptorOptions>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const finalOptions = { ...DEFAULT_INTERCEPTOR_CONFIG, ...options };

    // Transform interceptor
    if (finalOptions.transform) {
      Reflect.defineMetadata(INTERCEPTOR_METADATA.TRANSFORM, true, descriptor.value);
    }

    // Timeout interceptor
    if (finalOptions.timeout) {
      Reflect.defineMetadata(
        INTERCEPTOR_METADATA.TIMEOUT,
        finalOptions.timeoutValue,
        descriptor.value
      );
    }

    // Cache interceptor
    if (finalOptions.cache) {
      Reflect.defineMetadata(
        INTERCEPTOR_METADATA.CACHE,
        { ttl: finalOptions.cacheTtl },
        descriptor.value
      );
    }

    return descriptor;
  };
}
