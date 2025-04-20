import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types';

export type Response<T> = ApiResponse<T> | StreamableFile;

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // No transformar si se debe omitir la transformación
    if (shouldSkipTransform(context)) {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => {
        // No transformar si es un StreamableFile
        if (data instanceof StreamableFile) {
          return data;
        }

        // Calcular tiempo de ejecución
        const duration = Date.now() - startTime;
        response.header('X-Response-Time', `${duration}ms`);

        // Si la respuesta ya está en el formato correcto, devolverla tal cual
        if (this.isApiResponse(data)) {
          return data;
        }

        // Formatear la respuesta
        return {
          statusCode: response.statusCode,
          data,
          path: request.url,
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`
        } as ApiResponse<T>;
      })
    );
  }

  private isApiResponse(data: any): data is ApiResponse<T> {
    return data && typeof data === 'object' && 'statusCode' in data && 'data' in data;
  }
}

/**
 * Decorador para excluir rutas de la transformación
 */
export const SkipResponseTransform = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('skipResponseTransform', true, descriptor.value);
    return descriptor;
  };
};

/**
 * Helper para verificar si una ruta debe omitir la transformación
 */
export function shouldSkipTransform(context: ExecutionContext): boolean {
  const handler = context.getHandler();
  const skipTransform = Reflect.getMetadata('skipResponseTransform', handler);

  // También omitir transformación para rutas de archivos
  const response = context.switchToHttp().getResponse();
  const isFileResponse = response.get('Content-Type')?.includes('application/octet-stream');

  return skipTransform === true || isFileResponse;
}
