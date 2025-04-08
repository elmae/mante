import { UserService } from '../../../user/adapters/input/user.service';
import { JwtService } from './jwt.service';
import { LoginDto, LoginResponseDto } from '../../dtos/login.dto';
import { UnauthorizedException } from '../../../../common/exceptions/unauthorized.exception';

export interface AuthConfig {
  jwtExpiresIn?: string;
  jwtRefreshExpiresIn?: string;
}

export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User is inactive');
    }

    const isValid = await this.userService.validateCredentials(
      loginDto.username,
      loginDto.password
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({ sub: user.id });
    const refreshToken = this.jwtService.createRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        permissions: [] // Ya no tenemos permisos en la BD actual
      }
    };
  }

  async validateToken(token: string): Promise<LoginResponseDto['user']> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findById(payload.sub);

      if (!user || !user.is_active) {
        throw new UnauthorizedException();
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        permissions: [] // Ya no tenemos permisos en la BD actual
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findById(payload.sub);

      if (!user || !user.is_active) {
        throw new UnauthorizedException();
      }

      const accessToken = this.jwtService.sign({ sub: user.id });
      return { access_token: accessToken };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async validateAndExtractPayload(token: string): Promise<{ userId: string }> {
    try {
      const payload = this.jwtService.verify(token);
      return { userId: payload.sub };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async logout(token: string): Promise<void> {
    // In a real application, you might want to blacklist the token
    // or implement a token revocation mechanism
    if (!this.jwtService.validateToken(token)) {
      throw new UnauthorizedException();
    }
  }

  isTokenValid(token: string): boolean {
    return this.jwtService.validateToken(token);
  }

  isTokenExpired(token: string): boolean {
    return this.jwtService.isTokenExpired(token);
  }

  decodeToken(token: string) {
    return this.jwtService.decodeToken(token);
  }
}
