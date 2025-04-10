import { UserService } from '../../../user/adapters/input/user.service';
import { JwtService } from './jwt.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { LoginDto, LoginResponseDto, TokenPayload } from '../../dtos/login.dto';
import { UnauthorizedException } from '../../../../common/exceptions/unauthorized.exception';
import { BadRequestException } from '../../../../common/exceptions/bad-request.exception';
import { User } from '../../../../domain/entities/user.entity';

export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    console.log('🔍 Usuario encontrado (completo):', JSON.stringify(user, null, 2));
    console.log('🔍 Relación role cargada?:', user?.role !== undefined);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isValid = await this.userService.validateCredentials(loginDto.email, loginDto.password);

    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.role) {
      throw new BadRequestException('El usuario no tiene un rol asignado');
    }

    const payload: TokenPayload = {
      sub: user.id,
      role: user.role.name
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.createRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: this.mapUserToDto(user)
    };
  }

  async validateToken(token: string): Promise<LoginResponseDto['user']> {
    try {
      const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token invalidado');
      }

      const payload = this.jwtService.verify(token);
      const user = await this.userService.findById(payload.sub);

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Usuario inactivo o no encontrado');
      }

      return this.mapUserToDto(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findById(payload.sub);

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Usuario inactivo o no encontrado');
      }

      const accessToken = this.jwtService.sign({ sub: user.id, role: user.role.name });
      return { access_token: accessToken };
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token);
      if (!payload || !payload.exp) {
        throw new BadRequestException('Token inválido');
      }

      const now = Math.floor(Date.now() / 1000);
      const timeToExpire = payload.exp - now;

      if (timeToExpire > 0) {
        await this.tokenBlacklistService.addToBlacklist(token, timeToExpire);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Error al cerrar sesión');
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.tokenBlacklistService.isBlacklisted(token);
  }

  private mapUserToDto(user: User): LoginResponseDto['user'] {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role.name,
      permissions: user.role.permissions.map(p => p.name),
      is_active: user.is_active
    };
  }
}
