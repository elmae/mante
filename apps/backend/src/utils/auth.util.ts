import * as bcrypt from "bcrypt";
import {
  sign,
  verify,
  Secret,
  SignOptions,
  JwtPayload as BaseJwtPayload,
} from "jsonwebtoken";
import { User } from "../domain/entities/user.entity";
import config from "../config/config";

type StringOrNumber = string | number;

interface CustomJwtPayload extends BaseJwtPayload {
  sub: string;
  email: string;
  role: "admin" | "operator" | "technician" | "client";
}

interface JwtSignOptions extends Omit<SignOptions, "expiresIn"> {
  expiresIn: StringOrNumber;
}

export class AuthUtil {
  private static readonly JWT_SECRET: Secret = config.jwt.secret;
  private static readonly DEFAULT_EXPIRES_IN = "1d";

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePasswords(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(user: User): string {
    const payload: Omit<CustomJwtPayload, "iat" | "exp"> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtOptions: JwtSignOptions = {
      expiresIn: config.jwt.expiresIn || this.DEFAULT_EXPIRES_IN,
    };

    try {
      return sign(payload, this.JWT_SECRET, jwtOptions as SignOptions);
    } catch (error) {
      throw new Error("Error generating JWT token");
    }
  }

  static verifyToken(token: string): CustomJwtPayload {
    try {
      return verify(token, this.JWT_SECRET) as CustomJwtPayload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
