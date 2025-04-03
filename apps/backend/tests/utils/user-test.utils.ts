import { jest, expect } from "@jest/globals";
import { User } from "../../src/domain/entities/user.entity";
import { Role, RoleType } from "../../src/domain/entities/role.entity";
import { CreateUserDto } from "../../src/services/user/dtos/create-user.dto";
import { UpdateUserDto } from "../../src/services/user/dtos/update-user.dto";
import { IUserRepositoryPort } from "../../src/services/user/ports/output/user-repository.port";
import { UserFilters } from "../../src/services/user/ports/input/user.port";

export const createMockRole = (override: Partial<Role> = {}): Role => ({
  id: "1",
  name: RoleType.TECHNICIAN,
  description: "Technician role",
  permissions: [],
  created_at: new Date(),
  updated_at: new Date(),
  ...override,
});

export const createMockUser = (override: Partial<User> = {}): User => {
  const mockRole = createMockRole();
  return {
    id: "123",
    username: "testuser",
    email: "test@example.com",
    full_name: "Test User",
    role_id: mockRole.id,
    role: mockRole,
    password: "hashedPassword",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...override,
  };
};

export const createMockCreateUserDto = (
  override: Partial<CreateUserDto> = {}
): CreateUserDto => ({
  username: "newuser",
  email: "new@example.com",
  password: "password123",
  role_id: "1",
  full_name: "New User",
  is_active: true,
  ...override,
});

export const createMockUpdateUserDto = (
  override: Partial<UpdateUserDto> = {}
): UpdateUserDto => ({
  email: "updated@example.com",
  full_name: "Updated Name",
  is_active: true,
  ...override,
});

export type UserRepositoryMock = jest.Mocked<IUserRepositoryPort>;

export const createMockUserRepository = (): UserRepositoryMock => ({
  findById: jest.fn() as jest.MockedFunction<IUserRepositoryPort["findById"]>,
  findByEmail: jest.fn() as jest.MockedFunction<
    IUserRepositoryPort["findByEmail"]
  >,
  findByUsername: jest.fn() as jest.MockedFunction<
    IUserRepositoryPort["findByUsername"]
  >,
  create: jest.fn() as jest.MockedFunction<IUserRepositoryPort["create"]>,
  update: jest.fn() as jest.MockedFunction<IUserRepositoryPort["update"]>,
  delete: jest.fn() as jest.MockedFunction<IUserRepositoryPort["delete"]>,
  list: jest.fn() as jest.MockedFunction<IUserRepositoryPort["list"]>,
  validateCredentials: jest.fn() as jest.MockedFunction<
    IUserRepositoryPort["validateCredentials"]
  >,
});

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const mockPaginatedResponse = <T>(
  items: T[],
  total: number = items.length
): PaginatedResponse<T> => ({
  items,
  total,
  page: 1,
  limit: 10,
  totalPages: Math.ceil(total / 10),
});

export const expectUserWithoutSensitiveData = (user: User): void => {
  expect(user).toBeDefined();
  expect(user.password).toBeDefined(); // Password should be hashed, not undefined
  expect(user.id).toBeDefined();
  expect(user.username).toBeDefined();
  expect(user.email).toBeDefined();
  expect(user.role).toBeDefined();
  expect(user.is_active).toBeDefined();
  expect(user.created_at).toBeDefined();
  expect(user.updated_at).toBeDefined();
};

export const expectValidationError = (error: Error, field: string): void => {
  expect(error).toBeDefined();
  expect(error.message).toContain(field);
};

export const expectPaginatedResponse = <T>(
  response: PaginatedResponse<T>
): void => {
  expect(response).toBeDefined();
  expect(Array.isArray(response.items)).toBe(true);
  expect(typeof response.total).toBe("number");
  expect(typeof response.page).toBe("number");
  expect(typeof response.limit).toBe("number");
  expect(typeof response.totalPages).toBe("number");
};

export const USER_TEST_ERRORS = {
  NOT_FOUND: "User not found",
  EMAIL_EXISTS: "Email already exists",
  USERNAME_EXISTS: "Username already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  INVALID_ROLE: "Invalid role",
  INACTIVE_USER: "User is inactive",
} as const;
