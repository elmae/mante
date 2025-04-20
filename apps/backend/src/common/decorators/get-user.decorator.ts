import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../domain/entities';

/**
 * Obtiene el usuario autenticado de la request
 * @param data Campo opcional del usuario a retornar
 * @returns El usuario completo o el campo especificado
 *
 * @example
 * ```typescript
 * // Obtener el usuario completo
 * @Get('profile')
 * getProfile(@GetUser() user: User) {
 *   return user;
 * }
 *
 * // Obtener solo el ID del usuario
 * @Get('my-id')
 * getMyId(@GetUser('id') userId: string) {
 *   return userId;
 * }
 * ```
 */
export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    return data ? user?.[data] : user;
  }
);

/**
 * Helper para obtener el usuario de la request
 * @param request Request de Express
 * @returns El usuario autenticado o undefined
 */
export function getUserFromRequest(request: any): User | undefined {
  return request.user;
}

/**
 * Helper para obtener el ID del usuario de la request
 * @param request Request de Express
 * @returns El ID del usuario o undefined
 */
export function getUserIdFromRequest(request: any): string | undefined {
  return request.user?.id;
}

/**
 * Helper para verificar si hay un usuario autenticado en la request
 * @param request Request de Express
 * @returns true si hay un usuario autenticado
 */
export function isAuthenticated(request: any): boolean {
  return !!request.user;
}

/**
 * Helper para verificar si el usuario tiene un rol específico
 * @param request Request de Express
 * @param role Rol a verificar
 * @returns true si el usuario tiene el rol
 */
export function hasRole(request: any, role: string): boolean {
  return request.user?.roles?.includes(role) ?? false;
}

/**
 * Helper para verificar si el usuario tiene alguno de los roles especificados
 * @param request Request de Express
 * @param roles Roles a verificar
 * @returns true si el usuario tiene alguno de los roles
 */
export function hasAnyRole(request: any, roles: string[]): boolean {
  return request.user?.roles?.some((role: string) => roles.includes(role)) ?? false;
}
