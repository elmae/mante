import { describe, it, expect, beforeEach } from "@jest/globals";
import { UserController } from "../../../src/controllers/user.controller";
import { UserService } from "../../../src/services/user/adapters/input/user.service";
import { createMockUserRepository } from "../../utils/user-test.utils";
import { testUsers, testRoles } from "../../utils/user-test-data";
import {
  MockRequest,
  MockResponse,
  createMockNext,
  expectSuccessResponse,
  expectErrorResponse,
  createTestContext,
} from "../../utils/express-test.utils";

describe("UserController", () => {
  let userController: UserController;
  let mockUserService: UserService;
  let mockRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockRepository = createMockUserRepository();
    mockUserService = new UserService(mockRepository);
    userController = new UserController(mockUserService);
  });

  describe("list", () => {
    it("should return paginated list of users", async () => {
      const mockUsers = [testUsers.admin, testUsers.technician];
      mockRepository.list.mockResolvedValue({
        users: mockUsers,
        total: mockUsers.length,
      });

      const { req, res, next } = createTestContext();
      req.query = { page: "1", limit: "10" };

      await userController.list(req as any, res as any, next);

      expectSuccessResponse(res);
      expect(res.body.users).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(mockRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        })
      );
    });

    it("should apply filters correctly", async () => {
      const { req, res, next } = createTestContext();
      req.query = {
        page: "1",
        limit: "10",
        role: "TECHNICIAN",
        isActive: "true",
        search: "test",
      };

      await userController.list(req as any, res as any, next);

      expect(mockRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "TECHNICIAN",
          isActive: true,
          search: "test",
        })
      );
    });
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      const mockUser = testUsers.technician;
      mockRepository.findById.mockResolvedValue(mockUser);

      const { req, res, next } = createTestContext();
      req.params = { id: mockUser.id };

      await userController.findById(req as any, res as any, next);

      expectSuccessResponse(res);
      expect(res.body.id).toBe(mockUser.id);
      expect(mockRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it("should return 404 when user not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const { req, res, next } = createTestContext();
      req.params = { id: "non-existent" };

      await userController.findById(req as any, res as any, next);

      expectErrorResponse(res, 404, "User not found");
    });
  });

  describe("create", () => {
    it("should create new user successfully", async () => {
      const createUserDto = {
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        role_id: testRoles.technician.id,
        full_name: "New User",
      };

      const mockUser = testUsers.technician;
      mockRepository.create.mockResolvedValue(mockUser);

      const { req, res, next } = createTestContext();
      req.body = createUserDto;

      await userController.create(req as any, res as any, next);

      expectSuccessResponse(res, 201);
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      const updateUserDto = {
        email: "updated@example.com",
        full_name: "Updated Name",
      };

      const mockUser = {
        ...testUsers.technician,
        ...updateUserDto,
      };
      mockRepository.update.mockResolvedValue(mockUser);

      const { req, res, next } = createTestContext();
      req.params = { id: mockUser.id };
      req.body = updateUserDto;

      await userController.update(req as any, res as any, next);

      expectSuccessResponse(res);
      expect(res.body.email).toBe(updateUserDto.email);
      expect(res.body.full_name).toBe(updateUserDto.full_name);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto
      );
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      const mockUser = testUsers.technician;
      mockRepository.findById.mockResolvedValue(mockUser);

      const { req, res, next } = createTestContext();
      req.params = { id: mockUser.id };

      await userController.delete(req as any, res as any, next);

      expect(res.statusCode).toBe(204);
      expect(mockRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it("should handle non-existent user", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const { req, res, next } = createTestContext();
      req.params = { id: "non-existent" };

      await userController.delete(req as any, res as any, next);

      expectErrorResponse(res, 404, "User not found");
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
