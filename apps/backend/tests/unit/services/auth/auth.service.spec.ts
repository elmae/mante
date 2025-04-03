import { describe, it, expect, beforeEach } from "@jest/globals";
import { AuthService } from "../../../../src/services/auth/adapters/input/auth.service";
import { UserService } from "../../../../src/services/user/adapters/input/user.service";
import { JwtService } from "../../../../src/services/auth/adapters/input/jwt.service";
import { testUsers } from "../../../utils/user-test-data";
import { createMockUserRepository } from "../../../utils/user-test.utils";
import { LoginDto } from "../../../../src/services/auth/dtos/login.dto";
import { UnauthorizedException } from "../../../../src/common/exceptions/unauthorized.exception";

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    userService = new UserService(mockUserRepository);
    jwtService = new JwtService();
    authService = new AuthService(userService, jwtService);
  });

  describe("login", () => {
    const validLoginDto: LoginDto = {
      username: testUsers.technician.username,
      password: testUsers.technician.password,
    };

    it("should authenticate user with valid credentials", async () => {
      const mockUser = testUsers.technician;
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);
      mockUserRepository.validateCredentials.mockResolvedValue(true);

      const result = await authService.login(validLoginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        full_name: mockUser.full_name,
        role: mockUser.role.name,
        is_active: mockUser.is_active,
      });
      expect(mockUserRepository.validateCredentials).toHaveBeenCalledWith(
        validLoginDto.username,
        validLoginDto.password
      );
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      mockUserRepository.findByUsername.mockResolvedValue(testUsers.technician);
      mockUserRepository.validateCredentials.mockResolvedValue(false);

      await expect(authService.login(validLoginDto)).rejects.toThrow(
        UnauthorizedException
      );

      expect(mockUserRepository.validateCredentials).toHaveBeenCalledWith(
        validLoginDto.username,
        validLoginDto.password
      );
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      await expect(
        authService.login({
          username: "nonexistent",
          password: "password123",
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      const inactiveUser = { ...testUsers.technician, is_active: false };
      mockUserRepository.findByUsername.mockResolvedValue(inactiveUser);
      mockUserRepository.validateCredentials.mockResolvedValue(true);

      await expect(authService.login(validLoginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("validateToken", () => {
    it("should return user data for valid token", async () => {
      const mockUser = testUsers.technician;
      const token = await jwtService.sign({ sub: mockUser.id });
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.validateToken(token);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe(mockUser.username);
      expect(result.role).toBe(mockUser.role.name);
    });

    it("should throw UnauthorizedException for invalid token", async () => {
      await expect(authService.validateToken("invalid-token")).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException when user not found", async () => {
      const token = await jwtService.sign({ sub: "nonexistent-id" });
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.validateToken(token)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      const inactiveUser = { ...testUsers.technician, is_active: false };
      const token = await jwtService.sign({ sub: inactiveUser.id });
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      await expect(authService.validateToken(token)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("refreshToken", () => {
    it("should generate new token for valid refresh token", async () => {
      const mockUser = testUsers.technician;
      const refreshToken = await jwtService.sign(
        { sub: mockUser.id },
        { expiresIn: "7d" }
      );
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.access_token).not.toBe(refreshToken);
    });

    it("should throw UnauthorizedException for invalid refresh token", async () => {
      await expect(authService.refreshToken("invalid-token")).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException when user not found", async () => {
      const token = await jwtService.sign({ sub: "nonexistent-id" });
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.refreshToken(token)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      const inactiveUser = { ...testUsers.technician, is_active: false };
      const token = await jwtService.sign({ sub: inactiveUser.id });
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      await expect(authService.refreshToken(token)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
