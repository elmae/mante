import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const CURRENT_USER_KEY = 'user';

/**
 * Parameter decorator that extracts the current user from the request
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

/**
 * Parameter decorator that extracts specific user property
 * @param property The property to extract from the user object
 * @example
 * ```typescript
 * @Get('role')
 * getUserRole(@UserProperty('role') role: string) {
 *   return role;
 * }
 * ```
 */
export const UserProperty = createParamDecorator((property: string, ctx: ExecutionContext): any => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return property ? user?.[property] : user;
});
