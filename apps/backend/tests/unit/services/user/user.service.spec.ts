import { describe, it, expect, beforeEach } from "@jest/globals";
import { UserService } from "../../../../src/services/user/adapters/input/user.service";
import { RoleType } from "../../../../src/domain/entities/role.entity";
import {
  createMockUser,
  createMockCreateUserDto,
  createMockUpdateUserDto,
  createMockUserRepository,
  UserRepositoryMock,
  USER_TEST_ERRORS,
  expectUserWithoutSensitiveData,
} from "../../../utils/user-test.utils";
import {
  testUsers,
  testRoles,
  createUserDtoSamples,
  updateUserDtoSamples,
  mockUserResponses,
  mockUserFilters,
} from "../../../utils/user-test-data";

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: UserRepositoryMock;

  beforeEach(() => {
    mockRepository = createMockUserRepository();
    userService = new UserService(mockRepository);
  });

  describe("findById", () => {
    it("should return a user when found", async () => {
      const mockUser = createMockUser(testUsers.technician);
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById(mockUser.id);

      expect(result).toBeDefined();
      expect(result).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it("should return null when user is not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await userService.findById("non-existent-id");

      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith("non-existent-id");
    });
  });

  describe("create", () => {
    it("should create a new user successfully with valid data", async () => {
      const createUserDto = createUserDtoSamples.valid;
      const mockUser = createMockUser({
        ...testUsers.technician,
        ...createUserDto,
      });

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByUsername.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockUser);

      const result = await userService.create(createUserDto);

      expect(result).toBeDefined();
      expectUserWithoutSensitiveData(result);
      expect(result.email).toBe(createUserDto.email);
      expect(result.username).toBe(createUserDto.username);
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
    });

    it("should create a user with minimal data", async () => {
      const createUserDto = createUserDtoSamples.minimal;
      const mockUser = createMockUser({
        ...testUsers.technician,
        ...createUserDto,
      });

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByUsername.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockUser);

      const result = await userService.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.full_name).toBeUndefined();
      expect(result.is_active).toBe(true); // Should default to true
    });

    it("should throw error when email already exists", async () => {
      const existingUser = createMockUser(testUsers.technician);
      mockRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        userService.create(createUserDtoSamples.valid)
      ).rejects.toThrow(USER_TEST_ERRORS.EMAIL_EXISTS);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when username already exists", async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByUsername.mockResolvedValue(
        createMockUser(testUsers.technician)
      );

      await expect(
        userService.create(createUserDtoSamples.valid)
      ).rejects.toThrow(USER_TEST_ERRORS.USERNAME_EXISTS);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const updateUserDto = updateUserDtoSamples.fullUpdate;

    it("should update user successfully with full data", async () => {
      const mockUser = createMockUser(testUsers.technician);
      const updatedUser = createMockUser({
        ...mockUser,
        ...updateUserDto,
      });

      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.update(mockUser.id, updateUserDto);

      expect(result).toBeDefined();
      expectUserWithoutSensitiveData(result);
      expect(result.email).toBe(updateUserDto.email);
      expect(result.full_name).toBe(updateUserDto.full_name);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto
      );
    });

    it("should update user with partial data", async () => {
      const mockUser = createMockUser(testUsers.technician);
      const partialUpdate = updateUserDtoSamples.emailOnly;
      const updatedUser = createMockUser({
        ...mockUser,
        ...partialUpdate,
      });

      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.update(mockUser.id, partialUpdate);

      expect(result).toBeDefined();
      expect(result.email).toBe(partialUpdate.email);
      expect(result.full_name).toBe(mockUser.full_name);
    });

    it("should throw error when user not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        userService.update("non-existent-id", updateUserDto)
      ).rejects.toThrow(USER_TEST_ERRORS.NOT_FOUND);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when updating to existing email", async () => {
      const existingUser = createMockUser(testUsers.operator);
      mockRepository.findById.mockResolvedValue(
        createMockUser(testUsers.technician)
      );
      mockRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        userService.update("some-id", updateUserDto)
      ).rejects.toThrow(USER_TEST_ERRORS.EMAIL_EXISTS);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("should return all users with default filters", async () => {
      mockRepository.list.mockResolvedValue(mockUserResponses.listResponse);

      const result = await userService.list(mockUserFilters.default);

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(mockRepository.list).toHaveBeenCalledWith(mockUserFilters.default);
    });

    it("should filter users by role", async () => {
      mockRepository.list.mockResolvedValue(
        mockUserResponses.paginatedResponse
      );

      const result = await userService.list(mockUserFilters.withRole);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].role_id).toBe(testRoles.technician.id);
      expect(mockRepository.list).toHaveBeenCalledWith(
        mockUserFilters.withRole
      );
    });

    it("should return empty list when no users match filters", async () => {
      mockRepository.list.mockResolvedValue(
        mockUserResponses.emptyListResponse
      );

      const result = await userService.list(mockUserFilters.complete);

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      const mockUser = createMockUser(testUsers.technician);
      mockRepository.findById.mockResolvedValue(mockUser);

      await userService.delete(mockUser.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it("should throw error when user not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(userService.delete("non-existent-id")).rejects.toThrow(
        USER_TEST_ERRORS.NOT_FOUND
      );

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("validateCredentials", () => {
    const { username, password } = testUsers.technician;

    it("should return true for valid credentials", async () => {
      mockRepository.validateCredentials.mockResolvedValue(true);

      const result = await userService.validateCredentials(username, password);

      expect(result).toBe(true);
      expect(mockRepository.validateCredentials).toHaveBeenCalledWith(
        username,
        password
      );
    });

    it("should return false for invalid credentials", async () => {
      mockRepository.validateCredentials.mockResolvedValue(false);

      const result = await userService.validateCredentials(
        username,
        "wrongpassword"
      );

      expect(result).toBe(false);
      expect(mockRepository.validateCredentials).toHaveBeenCalledWith(
        username,
        "wrongpassword"
      );
    });
  });
});
