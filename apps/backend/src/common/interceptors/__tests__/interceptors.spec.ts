import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { TransformInterceptor } from '../transform.interceptor';
import { LoggingInterceptor } from '../logging.interceptor';
import { ErrorInterceptor } from '../error.interceptor';
import { TimeoutInterceptor } from '../timeout.interceptor';
import { CacheInterceptor } from '../cache.interceptor';
import { InterceptorResponse } from '../index';

describe('Interceptors', () => {
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          url: '/test',
          method: 'GET',
          headers: {},
          query: {},
          params: {}
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
          getHeader: jest.fn(),
          setHeader: jest.fn()
        })
      })
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: 'test' }))
    };
  });

  describe('TransformInterceptor', () => {
    let interceptor: TransformInterceptor<any>;

    beforeEach(() => {
      interceptor = new TransformInterceptor();
    });

    it('should transform the response to standard format', done => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: InterceptorResponse) => {
          expect(response).toEqual({
            statusCode: 200,
            data: { data: 'test' },
            timestamp: expect.any(String)
          });
          done();
        }
      });
    });
  });

  describe('LoggingInterceptor', () => {
    let interceptor: LoggingInterceptor;
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
      interceptor = new LoggingInterceptor();
      logSpy = jest.spyOn(interceptor['logger'], 'log').mockImplementation();
    });

    it('should log request and response', done => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(logSpy).toHaveBeenCalled();
          const logArgs = logSpy.mock.calls[0][0];
          expect(logArgs).toMatchObject({
            method: 'GET',
            url: '/test'
          });
          done();
        }
      });
    });
  });

  describe('ErrorInterceptor', () => {
    let interceptor: ErrorInterceptor;

    beforeEach(() => {
      interceptor = new ErrorInterceptor();
    });

    it('should handle errors properly', done => {
      const error = new Error('Test error');
      const errorHandler: CallHandler = {
        handle: () => new Observable(subscriber => subscriber.error(error))
      };

      interceptor.intercept(mockExecutionContext, errorHandler).subscribe({
        error: err => {
          expect(err).toBeDefined();
          expect(err.message).toContain('Test error');
          done();
        }
      });
    });
  });

  describe('TimeoutInterceptor', () => {
    let interceptor: TimeoutInterceptor;

    beforeEach(() => {
      interceptor = new TimeoutInterceptor(1000);
    });

    it('should not timeout for quick responses', done => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: response => {
          expect(response).toEqual({ data: 'test' });
          done();
        }
      });
    });
  });

  describe('CacheInterceptor', () => {
    let interceptor: CacheInterceptor;
    let handler: CallHandler;

    beforeEach(() => {
      interceptor = new CacheInterceptor();
      handler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' }))
      };
    });

    it('should cache responses', done => {
      // Primera llamada
      interceptor.intercept(mockExecutionContext, handler).subscribe({
        next: response => {
          expect(response).toEqual({ data: 'test' });
          expect(handler.handle).toHaveBeenCalledTimes(1);

          // Segunda llamada - debería usar el caché
          interceptor
            .intercept(mockExecutionContext, {
              handle: jest.fn() // Este no debería ser llamado
            })
            .subscribe({
              next: cachedResponse => {
                expect(cachedResponse).toEqual({ data: 'test' });
                expect(handler.handle).toHaveBeenCalledTimes(1);
                done();
              }
            });
        }
      });
    });
  });
});
