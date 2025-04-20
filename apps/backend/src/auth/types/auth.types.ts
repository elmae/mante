import { Request } from 'express';
import { RoleType } from '../../domain/entities/role.entity';

export interface JwtPayload {
  id: string;
  email: string;
  roles: RoleType[];
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  roles: RoleType[];
}

// Tipos personalizados para requests con usuario autenticado
export type RequestWithUser = Request & {
  user?: AuthUser;
};

export type AuthorizedRequest = Request & {
  user: AuthUser;
};
