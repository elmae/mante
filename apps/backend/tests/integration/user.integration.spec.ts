import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from "@jest/globals";
import request from "supertest";
import { DataSource } from "typeorm";
import { app } from "../../src/app";
import { createTestDatabase } from "../utils/database-test.utils";
import { testUsers, testRoles } from "../utils/user-test-data";
import { UserRepository } from "../../src/services/user/adapters/output/user.repository";
import { Role } from "../../src/domain/entities/role.entity";
import { User } from "../../src/domain/entities/user.entity";

describe("User Routes Integration Tests", () => {
  let connection: DataSource;
  let userRepository: UserRepository;
  let adminUser: User;
  let techUser: User;
  let adminToken: string;
  let techToken: string;

  beforeAll(async () => {
    // Setup test database
    connection = await createTestDatabase();
    userRepository = new UserRepository(connection.getRepository(User));

    // Create test roles and users
    const roleRepo = connection.getRepository(Role);
    const adminRole = await roleRepo.save(testRoles.admin);
    const techRole = await roleRepo.save(testRoles.technician);

    adminUser = await userRepository.create({
      ...testUsers.admin,
      role_id: adminRole.id,
    });

    techUser = await userRepository.create({
      ...testUsers.technician,
      role_id: techRole.id,
    });

    // Get auth tokens
    const adminLogin = await request(app).post("/auth/login").send({
      username: testUsers.admin.username,
      password: testUsers.admin.password,
    });
    adminToken = adminLogin.body.access_token;

    const techLogin = await request(app).post("/auth/login").send({
      username: testUsers.technician.username,
      password: testUsers.technician.password,
    });
    techToken = techLogin.body.access_token;
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("GET /users", () => {
    it("should return list of users for admin", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it("should deny access to non-admin users", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${techToken}`);

      expect(response.status).toBe(403);
    });

    it("should support pagination and filtering", async () => {
      const response = await request(app)
        .get("/users")
        .query({
          page: 1,
          limit: 10,
          role: "TECHNICIAN",
          isActive: true,
        })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users.length).toBeGreaterThanOrEqual(1);
      expect(response.body.users[0].role.name).toBe("TECHNICIAN");
    });
  });

  describe("GET /users/:id", () => {
    it("should return user details for valid ID", async () => {
      const response = await request(app)
        .get(`/users/${techUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(techUser.id);
      expect(response.body.username).toBe(techUser.username);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .get("/users/non-existent-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /users", () => {
    it("should create new user as admin", async () => {
      const newUser = {
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        role_id: testRoles.technician.id,
        full_name: "New User",
      };

      const response = await request(app)
        .post("/users")
        .send(newUser)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
      expect(response.body.username).toBe(newUser.username);
      expect(response.body.email).toBe(newUser.email);
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/users")
        .send({})
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update user details", async () => {
      const updateData = {
        full_name: "Updated Name",
        email: "updated@example.com",
      };

      const response = await request(app)
        .patch(`/users/${techUser.id}`)
        .send(updateData)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.full_name).toBe(updateData.full_name);
      expect(response.body.email).toBe(updateData.email);
    });

    it("should prevent email duplication", async () => {
      const response = await request(app)
        .patch(`/users/${techUser.id}`)
        .send({ email: adminUser.email })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("email");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete user as admin", async () => {
      // Create a user to delete
      const userToDelete = await userRepository.create({
        ...testUsers.operator,
        role_id: testRoles.operator.id,
      });

      const response = await request(app)
        .delete(`/users/${userToDelete.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      // Verify user was deleted
      const deletedUser = await userRepository.findById(userToDelete.id);
      expect(deletedUser).toBeNull();
    });

    it("should prevent deleting own account", async () => {
      const response = await request(app)
        .delete(`/users/${adminUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("own account");
    });
  });
});
