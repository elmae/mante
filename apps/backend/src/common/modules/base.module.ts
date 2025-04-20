import { Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IBaseEntity } from '../interfaces';

export interface BaseModuleOptions<
  T extends IBaseEntity,
  Service extends Type<any>,
  Controller extends Type<any>
> {
  entity: Type<T>;
  service: Service;
  controller: Controller;
  imports?: any[];
  providers?: any[];
  exports?: any[];
}

export function createBaseModule<
  T extends IBaseEntity,
  Service extends Type<any>,
  Controller extends Type<any>
>(options: BaseModuleOptions<T, Service, Controller>) {
  const { entity, service, controller, imports = [], providers = [], exports = [] } = options;

  return {
    module: class {},
    imports: [TypeOrmModule.forFeature([entity]), ...imports],
    controllers: [controller],
    providers: [service, ...providers],
    exports: [TypeOrmModule.forFeature([entity]), service, ...exports]
  };
}

/**
 * Example usage:
 *
 * @Module(createBaseModule({
 *   entity: User,
 *   service: UsersService,
 *   controller: UsersController,
 *   imports: [AuthModule],
 *   providers: [UserRepository],
 *   exports: [UserRepository]
 * }))
 * export class UsersModule {}
 */
