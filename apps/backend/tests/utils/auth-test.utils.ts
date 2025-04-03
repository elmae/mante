import { jest, expect } from "@jest/globals";
import { JwtService } from "../../src/services/auth/adapters/input/jwt.service";
import { AuthService } from "../../src/services/auth/adapters/input/auth.service";
import { UserService } from "../../src/services/user/adapters/input/user.service";
import { User } from "../../src/domain/entities/user.entity";
import {
  LoginDto,
  LoginResponseDto,
} from "../../src/services/auth/dtos/login.dto";
import {
  createMockUserRepository,
  UserRepositoryMock,
} from "./user-test.utils";
import { testUsers } from "./user-test-data";

export type MockJwtService = jest.Mocked<JwtService>;

export const createMockJwtService = (): MockJwtService => {
  const mockSign = jest.fn().mockReturnValue("mock.jwt.token");
  const mockVerify = jest
    .fn()
    .mockReturnValue({ sub: testUsers.technician.id });
  const mockValidate = jest.fn().mockReturnValue(true);

  return {
    secret: "test-secret",
    expiresIn: "1h",
    refreshExpiresIn: "7d",
    sign: mockSign,
    verify: mockVerify,
    createRefreshToken: jest.fn().mockReturnValue("mock.refresh.token"),
    validateToken: mockValidate,
    decodeToken: jest.fn().mockReturnValue({ sub: testUsers.technician.id }),
    isTokenExpired: jest.fn().mockReturnValue(false),
    getExpirationTime: jest.fn().mockReturnValue(Date.now() + 3600000), // 1 hour from now
  } as MockJwtService;
};

export const createAuthTestContext = () => {
  const mockUserRepository = createMockUserRepository();
  const mockJwtService = createMockJwtService();

  return {
    mockUserRepository,
    mockJwtService,
    createAuthService: () => {
      const userService = new UserService(mockUserRepository);
      return new AuthService(userService, mockJwtService);
    },
  };
};

export const mockLoginResponse = (
  user: User = testUsers.technician
): LoginResponseDto => ({
  access_token: "mock.jwt.token",
  refresh_token: "mock.refresh.token",
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role.name,
    is_active: user.is_active,
    permissions: user.role.permissions.map((p) => p.name),
  },
});

export const mockLoginDto = (override: Partial<LoginDto> = {}): LoginDto => ({
  username: testUsers.technician.username,
  password: testUsers.technician.password,
  ...override,
});

export const mockAuthHeader = (token: string = "mock.jwt.token") => ({
  Authorization: `Bearer ${token}`,
});

export const expectUnauthorizedResponse = (response: any) => {
  expect(response.statusCode).toBe(401);
  expect(response.error).toBe("Unauthorized");
  expect(response.message).toBeDefined();
};

export const expectAuthenticatedResponse = (response: LoginResponseDto) => {
  expect(response.access_token).toBeDefined();
  expect(response.refresh_token).toBeDefined();
  expect(response.user).toBeDefined();
  expect(response.user.id).toBeDefined();
  expect(response.user.username).toBeDefined();
  expect(response.user.email).toBeDefined();
  expect(response.user.role).toBeDefined();
  expect(response.user.permissions).toBeDefined();
  expect(Array.isArray(response.user.permissions)).toBe(true);
};

export class MockRequest {
  user?: any;
  headers: Record<string, string> = {};
  body: any = {};

  constructor(
    options: {
      user?: any;
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ) {
    this.user = options.user;
    this.headers = options.headers || {};
    this.body = options.body || {};
  }
}

export class MockResponse {
  statusCode?: number;
  body: any;
  headers: Record<string, string> = {};

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(data: any) {
    this.body = data;
    return this;
  }

  setHeader(name: string, value: string) {
    this.headers[name] = value;
    return this;
  }
}

// Helper to create a mocked Express next function
export type MockNext = jest.Mock<void, [any?]>;
export const createMockNext = (): MockNext => jest.fn();
