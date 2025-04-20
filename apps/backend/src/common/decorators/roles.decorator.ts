import { SetMetadata } from '@nestjs/common';
import { Role, RoleDefinitions } from '../types/roles.types';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Decoradores de conveniencia para roles comunes
export const AdminOnly = () => Roles(Role.ADMIN);
export const ManagerOnly = () => Roles(Role.MANAGER);
export const SupervisorOnly = () => Roles(Role.SUPERVISOR);
export const TechnicianOnly = () => Roles(Role.TECHNICIAN);
export const ViewerOnly = () => Roles(Role.VIEWER);

// Combinaciones comunes de roles
export const AdminAndManager = () => Roles(Role.ADMIN, Role.MANAGER);
export const TechnicalStaff = () =>
  Roles(Role.ADMIN, Role.MANAGER, Role.SUPERVISOR, Role.TECHNICIAN);
export const ReadOnlyAccess = () =>
  Roles(Role.ADMIN, Role.MANAGER, Role.SUPERVISOR, Role.TECHNICIAN, Role.VIEWER);

// Utilidades para verificación de roles
export function hasRole(userRoles: Role[], requiredRole: Role): boolean {
  const userMaxLevel = Math.max(...userRoles.map(role => RoleDefinitions[role].level));
  return userMaxLevel >= RoleDefinitions[requiredRole].level;
}

export function hasAnyRole(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.some(role => hasRole(userRoles, role));
}

export function hasAllRoles(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.every(role => hasRole(userRoles, role));
}
