import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CacheConfig {
  ttl: number; // Tiempo de vida en segundos
  key?: string; // Clave personalizada
  condition?: boolean; // Condición para activar el caché
}

export interface CacheEntry<T> {
  data: T;
  expiry: number;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private static cache: Map<string, CacheEntry<any>> = new Map();
  private readonly logger = new Logger('CacheInterceptor');

  constructor(private readonly defaultTtl: number = 300) {} // 5 minutos por defecto

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (this.shouldSkipCache(context)) {
      return next.handle();
    }

    const cacheKey = this.getCacheKey(context);
    const cachedResponse = CacheInterceptor.cache.get(cacheKey);

    if (cachedResponse && !this.isExpired(cachedResponse)) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return of(cachedResponse.data);
    }

    return next.handle().pipe(
      tap(response => {
        const config = this.getCacheConfig(context);
        if (response && config.condition !== false) {
          this.setCacheEntry(cacheKey, response, config.ttl || this.defaultTtl);
        }
      })
    );
  }

  private getCacheKey(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const config = this.getCacheConfig(context);

    if (config.key) {
      return config.key;
    }

    // Generar clave basada en la URL y parámetros
    const url = request.url;
    const query = JSON.stringify(request.query);
    const params = JSON.stringify(request.params);

    return `${url}|${query}|${params}`;
  }

  private getCacheConfig(context: ExecutionContext): CacheConfig {
    const handler = context.getHandler();
    return Reflect.getMetadata('cache-config', handler) || { ttl: this.defaultTtl };
  }

  private shouldSkipCache(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const config = this.getCacheConfig(context);

    // No cachear métodos no-GET por defecto
    if (request.method !== 'GET') {
      return true;
    }

    return config.condition === false;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiry;
  }

  private setCacheEntry(key: string, data: any, ttl: number): void {
    const entry: CacheEntry<any> = {
      data,
      expiry: Date.now() + ttl * 1000
    };

    CacheInterceptor.cache.set(key, entry);
    this.logger.debug(`Cache set for key: ${key}`);
  }

  // Métodos estáticos para gestionar el caché
  static clearCache(): void {
    this.cache.clear();
  }

  static removeFromCache(key: string): void {
    this.cache.delete(key);
  }

  static getCacheSize(): number {
    return this.cache.size;
  }

  static getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Realizar limpieza periódica del caché
  static cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Decorador para configurar el caché por ruta
export function UseCache(config: CacheConfig = { ttl: 300 }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('cache-config', config, descriptor.value);
    return descriptor;
  };
}

// Decorador para deshabilitar el caché
export const NoCache = () => UseCache({ ttl: 0, condition: false });
