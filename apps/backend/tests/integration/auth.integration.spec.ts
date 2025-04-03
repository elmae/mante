import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { DataSource } from "typeorm";
import { app } from "../../src/app";
import { createTestDatabase } from "../utils/database-test.utils";
import { testUsers, testRoles } from "../utils/user-test-data";
import { UserRepository } from "../../src/services/user/adapters/output/user.repository";
import { Role } from "../../src/domain/entities/role.entity";
import { User } from "../../src/domain/entities/user.entity";

describe("Auth Integration Tests", () => {
  let connection: DataSource;
  let userRepository: UserRepository;
  let testUser: User;
  let testRole: Role;

  beforeAll(async () => {
    // Setup test database
    connection = await createTestDatabase();
    userRepository = new UserRepository(connection.getRepository(User));

    // Create test role and user
    testRole = await connection.getRepository(Role).save(testRoles.technician);
    testUser = await userRepository.create({
      ...testUsers.technician,
      role_id: testRole.id,
    });
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("POST /auth/login", () => {
    it("should authenticate user with valid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        username: testUsers.technician.username,
        password: testUsers.technician.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.username).toBe(testUser.username);
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        username: testUsers.technician.username,
        password: "wrong-password",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should reject inactive users", async () => {
      // Make user inactive
      await userRepository.update(testUser.id, { is_active: false });

      const response = await request(app).post("/auth/login").send({
        username: testUsers.technician.username,
        password: testUsers.technician.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("inactive");

      // Restore user active status
      await userRepository.update(testUser.id, { is_active: true });
    });
  });

  describe("POST /auth/refresh", () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Get a valid refresh token
      const loginResponse = await request(app).post("/auth/login").send({
        username: testUsers.technician.username,
        password: testUsers.technician.password,
      });

      refreshToken = loginResponse.body.refresh_token;
    });

    it("should issue new access token with valid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refresh_token: refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBeDefined();
    });

    it("should reject invalid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refresh_token: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });
  });

  describe("GET /auth/validate", () => {
    let accessToken: string;

    beforeAll(async () => {
      // Get a valid access token
      const loginResponse = await request(app).post("/auth/login").send({
        username: testUsers.technician.username,
        password: testUsers.technician.password,
      });

      accessToken = loginResponse.body.access_token;
    });

    it("should validate valid token", async () => {
      const response = await request(app)
        .get("/auth/validate")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testUser.id);
      expect(response.body.username).toBe(testUser.username);
    });

    it("should reject invalid token", async () => {
      const response = await request(app)
        .get("/auth/validate")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should reject missing token", async () => {
      const response = await request(app).get("/auth/validate");

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("No token provided");
    });
  });

  describe("POST /auth/logout", () => {
    let accessToken: string;

    beforeAll(async () => {
      // Get a valid access token
      const loginResponse = await request(app).post("/auth/login").send({
        username: testUsers.technician.username,
        password: testUsers.technician.password,
      });

      accessToken = loginResponse.body.access_token;
    });

    it("should successfully logout with valid token", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("Logged out successfully");
    });

    it("should reject invalid token", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });
  });
});
