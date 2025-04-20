import { ExecutionContext } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer'
}

export interface JwtPayload {
  id: string;
  email: string;
  roles: Role[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

// Tipos personalizados para requests con usuario autenticado
export type RequestWithUser = ExpressRequest & {
  user?: JwtPayload;
};

export type AuthorizedRequest = ExpressRequest & {
  user: JwtPayload;
};

export type RequestContext = ExecutionContext;
