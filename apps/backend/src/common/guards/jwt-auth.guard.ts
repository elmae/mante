import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('No autorizado');
    }
    return user;
  }
}
