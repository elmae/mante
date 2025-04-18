import { SetMetadata } from '@nestjs/common';

// Definir los roles disponibles como constantes para evitar errores de tipeo
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  VIEWER: 'viewer'
} as const;

// Tipo para los roles disponibles
export type Role = (typeof ROLES)[keyof typeof ROLES];

// Decorador de roles que acepta un array de roles válidos
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// Validador de roles
export const isValidRole = (role: string): role is Role => {
  return Object.values(ROLES).includes(role as Role);
};
