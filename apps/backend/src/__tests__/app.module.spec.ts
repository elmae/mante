import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Type } from '@nestjs/common';
import { AppModule } from '../app.module';
import { TransformInterceptor, LoggingInterceptor, ErrorInterceptor } from '../common/interceptors';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';

interface ModuleProvider {
  provide: symbol | string;
  useClass: Type<any>;
}

describe('AppModule', () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  describe('Global Providers', () => {
    let providers: ModuleProvider[];

    beforeAll(() => {
      providers = Reflect.getMetadata('providers', AppModule) as ModuleProvider[];
    });

    it('should register AllExceptionsFilter', () => {
      const filterProvider = providers.find(provider => provider.provide === APP_FILTER);
      expect(filterProvider?.useClass).toBe(AllExceptionsFilter);
    });

    it('should register all global interceptors', () => {
      const interceptors = providers.filter(provider => provider.provide === APP_INTERCEPTOR);

      expect(interceptors).toHaveLength(3);

      const interceptorClasses = interceptors.map(i => i.useClass);
      expect(interceptorClasses).toContain(TransformInterceptor);
      expect(interceptorClasses).toContain(LoggingInterceptor);
      expect(interceptorClasses).toContain(ErrorInterceptor);
    });
  });

  describe('Configuration', () => {
    it('should load environment variables', () => {
      expect(configService.get<string>('NODE_ENV')).toBeDefined();
      expect(configService.get<number>('PORT')).toBeDefined();
      expect(configService.get<string>('database.host')).toBeDefined();
    });

    it('should configure database properly', () => {
      expect(configService.get<string>('database.host')).toBeTruthy();
      expect(configService.get<number>('database.port')).toBeTruthy();
      expect(configService.get<string>('database.username')).toBeTruthy();
      expect(configService.get<string>('database.name')).toBeTruthy();
    });
  });

  describe('Required Modules', () => {
    interface ModuleMetadata {
      name: string;
      [key: string]: any;
    }

    const requiredModules = [
      'ConfigModule',
      'TypeOrmModule',
      'EventEmitterModule',
      'ScheduleModule',
      'UsersModule',
      'AuthModule'
    ] as const;

    it.each(requiredModules)('should include %s', (moduleName: string) => {
      const modules = Reflect.getMetadata('imports', AppModule) as ModuleMetadata[];
      const moduleNames = modules.map(m => m.name);
      expect(moduleNames).toContain(moduleName);
    });
  });
});
