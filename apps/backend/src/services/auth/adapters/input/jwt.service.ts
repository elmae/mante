import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import ms from "ms";
import { TokenPayload } from "../../dtos/login.dto";
import { UnauthorizedException } from "../../../../common/exceptions/unauthorized.exception";

// Type representing the string values that the ms library can parse
type StringValue = `${number}${"s" | "m" | "h" | "d" | "y"}`;

export interface JwtConfig {
  secret?: string;
  expiresIn?: number | StringValue;
  refreshExpiresIn?: number | StringValue;
}

export class JwtService {
  protected readonly config: Required<JwtConfig>;

  constructor(config: JwtConfig = {}) {
    this.config = {
      secret: config.secret || process.env.JWT_SECRET || "your-secret-key",
      expiresIn: config.expiresIn || "1h",
      refreshExpiresIn: config.refreshExpiresIn || "7d",
    };
  }

  getConfig(): Required<JwtConfig> {
    return { ...this.config };
  }

  private normalizeExpiration(exp?: number | StringValue): number | undefined {
    if (typeof exp === "number") return exp;
    if (typeof exp === "string") return ms(exp) / 1000; // Convert ms to seconds
    return undefined;
  }

  sign(payload: Record<string, any>, options: SignOptions = {}): string {
    try {
      const signOptions: SignOptions = {
        ...options,
        expiresIn:
          this.normalizeExpiration(options.expiresIn as StringValue) ??
          this.normalizeExpiration(this.config.expiresIn),
      };

      return jwt.sign(payload, this.config.secret, signOptions);
    } catch (error) {
      throw new Error("Error signing token");
    }
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.config.secret) as JwtPayload &
        TokenPayload;

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException("Invalid token payload");
      }

      return {
        sub: decoded.sub,
        iat: decoded.iat,
        exp: decoded.exp,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException("Token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException("Invalid token");
      }
      throw new UnauthorizedException("Token validation failed");
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
        iat: decoded.iat,
        exp: decoded.exp,
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
