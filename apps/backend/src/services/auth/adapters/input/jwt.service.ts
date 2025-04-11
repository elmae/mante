import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import ms from 'ms';
import { TokenPayload } from '../../dtos/login.dto';
import { UnauthorizedException } from '../../../../common/exceptions/unauthorized.exception';

// Type representing the string values that the ms library can parse
type StringValue = `${number}${'s' | 'm' | 'h' | 'd' | 'y'}`;

export interface JwtConfig {
  secret?: string;
  expiresIn?: number | StringValue;
  refreshExpiresIn?: number | StringValue;
}

export class JwtService {
  protected readonly config: Required<JwtConfig>;

  constructor(config: JwtConfig = {}) {
    this.config = {
      secret: config.secret || process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: config.expiresIn || '1h',
      refreshExpiresIn: config.refreshExpiresIn || '7d'
    };
  }

  getConfig(): Required<JwtConfig> {
    return { ...this.config };
  }

  private normalizeExpiration(exp?: number | StringValue): number | undefined {
    if (typeof exp === 'number') return exp;
    if (typeof exp === 'string') return ms(exp) / 1000; // Convert ms to seconds
    return undefined;
  }

  sign(payload: Record<string, any>, options: SignOptions = {}): string {
    try {
      const signOptions: SignOptions = {
        ...options,
        expiresIn:
          this.normalizeExpiration(options.expiresIn as StringValue) ??
          this.normalizeExpiration(this.config.expiresIn)
      };

      return jwt.sign(payload, this.config.secret, signOptions);
    } catch (error) {
      throw new Error('Error signing token');
    }
  }

  verify(token: string): TokenPayload {
    try {
      console.log(
        'Verificando token con clave secreta:',
        this.config.secret.substring(0, 3) + '...'
      );
      console.log('Longitud clave secreta:', this.config.secret.length);

      const decoded = jwt.verify(token, this.config.secret) as JwtPayload & TokenPayload;

      if (!decoded || !decoded.sub) {
        console.error('Token decodificado inválido:', decoded);
        throw new UnauthorizedException('Invalid token payload');
      }

      console.log('Token verificado correctamente. Payload:', {
        sub: decoded.sub,
        iat: decoded.iat,
        exp: decoded.exp
      });

      return {
        sub: decoded.sub,
        role: decoded.role,
        iat: decoded.iat,
        exp: decoded.exp
      };
    } catch (error: unknown) {
      console.error('Error al verificar token:');
      console.error('Token:', token.substring(0, 20) + '...');

      if (error instanceof jwt.TokenExpiredError) {
        console.error('Token expirado:', error.expiredAt);
        throw new UnauthorizedException(`Token expired at ${error.expiredAt}`);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('Error JWT:', error.message);
        throw new UnauthorizedException(`JWT Error: ${error.message}`);
      }

      console.error('Error desconocido:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }

  createRefreshToken(userId: string): string {
    return this.sign(
      { sub: userId },
      { expiresIn: this.normalizeExpiration(this.config.refreshExpiresIn) }
    );
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload & TokenPayload;
      if (!decoded || !decoded.sub) {
        return null;
      }
      return {
        sub: decoded.sub,
        role: decoded.role,
        iat: decoded.iat,
        exp: decoded.exp
      };
    } catch {
      return null;
    }
  }

  validateToken(token: string): boolean {
    try {
      this.verify(token);
      return true;
    } catch {
      return false;
    }
  }

  getExpirationTime(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded?.exp || null;
  }

  isTokenExpired(token: string): boolean {
    const expTime = this.getExpirationTime(token);
    if (!expTime) return true;

    return Date.now() >= expTime * 1000;
  }
}
