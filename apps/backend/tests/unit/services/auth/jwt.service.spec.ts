import { describe, it, expect, beforeEach } from "@jest/globals";
import { JwtService } from "../../../../src/services/auth/adapters/input/jwt.service";
import { UnauthorizedException } from "../../../../src/common/exceptions/unauthorized.exception";

describe("JwtService", () => {
  let jwtService: JwtService;
  const testSecret = "test-secret";
  const testUserId = "123";

  beforeEach(() => {
    jwtService = new JwtService({
      secret: testSecret,
      expiresIn: "1h",
      refreshExpiresIn: "7d",
    });
  });

  describe("sign", () => {
    it("should create a valid JWT token", () => {
      const token = jwtService.sign({ sub: testUserId });
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should create a token with custom expiration", () => {
      const token = jwtService.sign({ sub: testUserId }, { expiresIn: "2h" });
      const decoded = jwtService.decodeToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.exp).toBeDefined();
      expect(decoded?.exp! > Date.now() / 1000).toBe(true);
    });

    it("should throw error on invalid payload", () => {
      expect(() => jwtService.sign(undefined as any)).toThrow();
    });
  });

  describe("verify", () => {
    it("should verify a valid token", () => {
      const token = jwtService.sign({ sub: testUserId });
      const decoded = jwtService.verify(token);
      expect(decoded.sub).toBe(testUserId);
    });

    it("should throw on expired token", () => {
      const token = jwtService.sign({ sub: testUserId }, { expiresIn: "-1h" });
      expect(() => jwtService.verify(token)).toThrow(UnauthorizedException);
    });

    it("should throw on invalid token", () => {
      expect(() => jwtService.verify("invalid.token")).toThrow(
        UnauthorizedException
      );
    });

    it("should throw on missing subject", () => {
      const token = jwtService.sign({ foo: "bar" });
      expect(() => jwtService.verify(token)).toThrow(UnauthorizedException);
    });
  });

  describe("createRefreshToken", () => {
    it("should create a valid refresh token", () => {
      const token = jwtService.createRefreshToken(testUserId);
      const decoded = jwtService.verify(token);
      expect(decoded.sub).toBe(testUserId);
    });

    it("should have longer expiration than access token", () => {
      const accessToken = jwtService.sign({ sub: testUserId });
      const refreshToken = jwtService.createRefreshToken(testUserId);

      const accessExp = jwtService.getExpirationTime(accessToken);
      const refreshExp = jwtService.getExpirationTime(refreshToken);

      expect(refreshExp).toBeGreaterThan(accessExp!);
    });
  });

  describe("validateToken", () => {
    it("should return true for valid token", () => {
      const token = jwtService.sign({ sub: testUserId });
      expect(jwtService.validateToken(token)).toBe(true);
    });

    it("should return false for invalid token", () => {
      expect(jwtService.validateToken("invalid.token")).toBe(false);
    });

    it("should return false for expired token", () => {
      const token = jwtService.sign({ sub: testUserId }, { expiresIn: "-1h" });
      expect(jwtService.validateToken(token)).toBe(false);
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for valid token", () => {
      const token = jwtService.sign({ sub: testUserId });
      expect(jwtService.isTokenExpired(token)).toBe(false);
    });

    it("should return true for expired token", () => {
      const token = jwtService.sign({ sub: testUserId }, { expiresIn: "-1h" });
      expect(jwtService.isTokenExpired(token)).toBe(true);
    });

    it("should return true for invalid token", () => {
      expect(jwtService.isTokenExpired("invalid.token")).toBe(true);
    });
  });

  describe("getConfig", () => {
    it("should return configured values", () => {
      const config = jwtService.getConfig();
      expect(config.secret).toBe(testSecret);
      expect(config.expiresIn).toBe("1h");
      expect(config.refreshExpiresIn).toBe("7d");
    });

    it("should not allow modifying config", () => {
      const config = jwtService.getConfig();
      config.secret = "modified";
      expect(jwtService.getConfig().secret).toBe(testSecret);
    });
  });
});
