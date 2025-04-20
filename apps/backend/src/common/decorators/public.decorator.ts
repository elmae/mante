import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca una ruta como pública (no requiere autenticación)
 * @example
 * ```typescript
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Tipo utilitario para verificar si una ruta es pública
 */
export type PublicEndpoint = {
  [IS_PUBLIC_KEY]?: boolean;
};

/**
 * Helper para verificar si un endpoint es público
 * @param endpoint El endpoint a verificar
 * @returns true si el endpoint es público
 */
export function isPublicEndpoint(endpoint: unknown): endpoint is PublicEndpoint {
  return (
    typeof endpoint === 'object' &&
    endpoint !== null &&
    IS_PUBLIC_KEY in endpoint &&
    (endpoint as PublicEndpoint)[IS_PUBLIC_KEY] === true
  );
}

/**
 * Helper para verificar si un controlador o método es público
 * @param metadataKey La clave de metadata
 * @param target El controlador o método
 * @returns true si es público
 */
export function checkIfPublic(metadataKey: string, target: any): boolean {
  const metadata = Reflect.getMetadata(metadataKey, target);
  return metadata ? isPublicEndpoint(metadata) : false;
}
