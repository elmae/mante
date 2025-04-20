export enum Role {
  // Roles administrativos
  ADMIN = 'admin',
  MANAGER = 'manager',

  // Roles operativos
  SUPERVISOR = 'supervisor',
  TECHNICIAN = 'technician',
  OPERATOR = 'operator',

  // Roles de acceso
  VIEWER = 'viewer',
  USER = 'user'
}

export type RoleValue = `${Role}`;

export interface RoleDefinition {
  name: Role;
  displayName: string;
  description: string;
  level: number;
}

export const RoleDefinitions: Record<Role, RoleDefinition> = {
  [Role.ADMIN]: {
    name: Role.ADMIN,
    displayName: 'Administrador',
    description: 'Acceso total al sistema',
    level: 100
  },
  [Role.MANAGER]: {
    name: Role.MANAGER,
    displayName: 'Gerente',
    description: 'Gestión general del sistema',
    level: 80
  },
  [Role.SUPERVISOR]: {
    name: Role.SUPERVISOR,
    displayName: 'Supervisor',
    description: 'Supervisión de operaciones',
    level: 60
  },
  [Role.TECHNICIAN]: {
    name: Role.TECHNICIAN,
    displayName: 'Técnico',
    description: 'Ejecución de mantenimientos',
    level: 40
  },
  [Role.OPERATOR]: {
    name: Role.OPERATOR,
    displayName: 'Operador',
    description: 'Operaciones básicas',
    level: 30
  },
  [Role.VIEWER]: {
    name: Role.VIEWER,
    displayName: 'Visualizador',
    description: 'Solo lectura',
    level: 20
  },
  [Role.USER]: {
    name: Role.USER,
    displayName: 'Usuario',
    description: 'Acceso básico',
    level: 10
  }
};
