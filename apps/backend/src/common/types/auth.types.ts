import { Request } from 'express';

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

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export type AuthorizedRequest = Request & { user: JwtPayload };