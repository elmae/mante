import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException
} from '@nestjs/common';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export const DEFAULT_TIMEOUT = 30000; // 30 segundos

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutValue: number = DEFAULT_TIMEOUT) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutValue),
      catchError(err => {
        if (err instanceof TimeoutError) {
          const request = context.switchToHttp().getRequest();
          const { method, url } = request;

          return throwError(
            () =>
              new RequestTimeoutException(
                `Request ${method} ${url} timed out after ${this.timeoutValue}ms`
              )
          );
        }
        return throwError(() => err);
      })
    );
  }
}

// Decorador para personalizar el timeout por ruta
export function SetTimeout(timeoutValue: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('timeout', timeoutValue, descriptor.value);
    return descriptor;
  };
}

// Helper para obtener el timeout configurado
export function getTimeoutValue(context: ExecutionContext): number {
  const handler = context.getHandler();
  return Reflect.getMetadata('timeout', handler) || DEFAULT_TIMEOUT;
}

// Decorador para rutas sin timeout
export const NoTimeout = () => SetTimeout(0);

// Factory para crear interceptores con timeout personalizado
export function createTimeoutInterceptor(timeoutValue: number = DEFAULT_TIMEOUT) {
  return new TimeoutInterceptor(timeoutValue);
}
