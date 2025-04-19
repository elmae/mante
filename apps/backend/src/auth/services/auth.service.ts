import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import { compare } from 'bcrypt';
import { JwtPayload } from '../../common/types/auth.types';
import { EntityManager } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly entityManager: EntityManager
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.entityManager.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!user || user.length === 0) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await compare(password, user[0].password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...result } = user[0];
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions || []
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions || []
      }
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<boolean> {
    const user = await this.entityManager.query('SELECT * FROM users WHERE id = $1', [payload.id]);

    return user && user.length > 0;
  }
}
