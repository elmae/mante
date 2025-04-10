import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../src/app';
import { setupTestDB, teardownTestDB } from '../utils/test-setup';
import { DataSource } from 'typeorm';
import { AuthTestHelper } from '../utils/auth-test.helper';
import { User } from '../../src/domain/entities/user.entity';

describe('Auth Integration Tests', () => {
  let app: Application;
  let dataSource: DataSource;
  let authHelper: AuthTestHelper;
  let testUser: User;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    dataSource = await setupTestDB();
    app = await createApp();
    authHelper = new AuthTestHelper(dataSource);

    // Crear datos de prueba
    testUser = await authHelper.createTestUser('test123');
  });

  afterAll(async () => {
    await authHelper.cleanup(testUser.id);
    await teardownTestDB();
  });

  describe('POST /api/v1/auth/login', () => {
    it('debería autenticar usuario exitosamente', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'test123'
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('permissions');

      accessToken = response.body.data.token;
      refreshToken = response.body.data.refreshToken;
    });

    it('debería rechazar credenciales inválidas', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/auth/validate', () => {
    it('debería validar token válido', async () => {
      const response = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('debería rechazar token inválido', async () => {
      const response = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('debería cerrar sesión exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificar que el token ha sido invalidado
      const validateResponse = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(validateResponse.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('debería renovar token exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');

      // Verificar que el nuevo token es válido
      const validateResponse = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', `Bearer ${response.body.data.token}`);

      expect(validateResponse.status).toBe(200);
    });

    it('debería rechazar refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: 'invalid_refresh_token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
