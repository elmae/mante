import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - startTime;
          const contentLength = response.get('content-length');
          const logContext = {
            method,
            url,
            query,
            params,
            statusCode: response.statusCode,
            contentLength,
            ip,
            userAgent,
            duration: `${delay}ms`
          };

          // No registrar el cuerpo de la solicitud en rutas de autenticación
          if (!url.includes('auth')) {
            logContext['body'] = this.sanitizeBody(body);
          }

          this.logger.log({
            message: `${method} ${url} ${response.statusCode} ${delay}ms`,
            ...logContext
          });
        },
        error: (error: any) => {
          const delay = Date.now() - startTime;
          this.logger.error({
            message: `${method} ${url} failed after ${delay}ms`,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack
            },
            context: {
              method,
              url,
              query,
              params,
              ip,
              userAgent,
              duration: `${delay}ms`
            }
          });
        }
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }
}
