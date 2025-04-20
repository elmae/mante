import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface RequestMetrics {
  method: string;
  url: string;
  duration: number;
  timestamp: Date;
  statusCode: number;
  userAgent?: string;
  ip?: string;
}

export interface MetricsStorage {
  addMetric(metric: RequestMetrics): void;
  getMetrics(): RequestMetrics[];
  getAverageResponseTime(path?: string): number;
  getRequestCount(path?: string): number;
  clearMetrics(): void;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('MetricsInterceptor');
  private static metrics: RequestMetrics[] = [];
  private static readonly MAX_METRICS = 1000; // Límite de métricas almacenadas

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, headers, ip } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics({
            method,
            url,
            duration: Date.now() - startTime,
            timestamp: new Date(),
            statusCode: response.statusCode,
            userAgent: headers['user-agent'],
            ip
          });
        },
        error: () => {
          this.recordMetrics({
            method,
            url,
            duration: Date.now() - startTime,
            timestamp: new Date(),
            statusCode: response.statusCode || 500,
            userAgent: headers['user-agent'],
            ip
          });
        }
      })
    );
  }

  private recordMetrics(metric: RequestMetrics): void {
    MetricsInterceptor.metrics.push(metric);

    // Mantener solo las últimas MAX_METRICS métricas
    if (MetricsInterceptor.metrics.length > MetricsInterceptor.MAX_METRICS) {
      MetricsInterceptor.metrics.shift();
    }

    // Log de métricas para monitoreo
    this.logger.debug({
      message: `${metric.method} ${metric.url} completed in ${metric.duration}ms`,
      metric
    });
  }

  // Métodos estáticos para acceder a las métricas
  static getMetrics(): RequestMetrics[] {
    return [...this.metrics];
  }

  static getAverageResponseTime(path?: string): number {
    const relevantMetrics = path ? this.metrics.filter(m => m.url.startsWith(path)) : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }

  static getRequestCount(path?: string): number {
    return path ? this.metrics.filter(m => m.url.startsWith(path)).length : this.metrics.length;
  }

  static getErrorRate(path?: string): number {
    const relevantMetrics = path ? this.metrics.filter(m => m.url.startsWith(path)) : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const errorCount = relevantMetrics.filter(m => m.statusCode >= 400).length;
    return (errorCount / relevantMetrics.length) * 100;
  }

  static clearMetrics(): void {
    this.metrics = [];
  }

  static getMetricsByStatusCode(): Record<number, number> {
    return this.metrics.reduce(
      (acc, metric) => {
        acc[metric.statusCode] = (acc[metric.statusCode] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );
  }

  static getSummary(path?: string): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    statusCodes: Record<number, number>;
  } {
    return {
      totalRequests: this.getRequestCount(path),
      averageResponseTime: this.getAverageResponseTime(path),
      errorRate: this.getErrorRate(path),
      statusCodes: this.getMetricsByStatusCode()
    };
  }
}
