import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { createMockUser, createMockJwtToken } from '../../../tests/utils/test-helpers';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'Password123!',
      walletAddress: '0x1234567890123456789012345678901234567890',
    };

    it('should register a new user successfully', async () => {
      const response = await request(httpServer)
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(201);

      expect(response.body).toMatchObject({
        user: expect.objectContaining({
          email: validRegistrationData.email,
          walletAddress: validRegistrationData.walletAddress,
        }),
        token: expect.any(String),
      });

      expect(response.body.user.password).toBeUndefined();
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(httpServer)
        .post('/auth/register')
        .send({
          ...validRegistrationData,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(httpServer)
        .post('/auth/register')
        .send({
          ...validRegistrationData,
          password: '123',
        })
        .expect(400);

      expect(response.body.message).toContain('password');
    });

    it('should reject registration with invalid wallet address', async () => {
      const response = await request(httpServer)
        .post('/auth/register')
        .send({
          ...validRegistrationData,
          walletAddress: 'invalid-wallet',
        })
        .expect(400);

      expect(response.body.message).toContain('wallet');
    });

    it('should reject registration with duplicate email', async () => {
      // First registration
      await request(httpServer)
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(201);

      // Duplicate registration
      const response = await request(httpServer)
        .post('/auth/register')
        .send({
          ...validRegistrationData,
          walletAddress: '0x9876543210987654321098765432109876543210',
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /auth/login', () => {
    const userCredentials = {
      email: 'login-test@example.com',
      password: 'Password123!',
      walletAddress: '0x1234567890123456789012345678901234567890',
    };

    beforeEach(async () => {
      // Register user before each login test
      await request(httpServer)
        .post('/auth/register')
        .send(userCredentials);
    });

    it('should login user with valid credentials', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        user: expect.objectContaining({
          email: userCredentials.email,
        }),
        token: expect.any(String),
      });

      expect(response.body.user.password).toBeUndefined();
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userCredentials.password,
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid');
    });

    it('should reject login with missing fields', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: userCredentials.email,
        })
        .expect(400);

      await request(httpServer)
        .post('/auth/login')
        .send({
          password: userCredentials.password,
        })
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    let authToken: string;
    const userCredentials = {
      email: 'profile-test@example.com',
      password: 'Password123!',
      walletAddress: '0x1234567890123456789012345678901234567890',
    };

    beforeEach(async () => {
      // Register and login to get auth token
      await request(httpServer)
        .post('/auth/register')
        .send(userCredentials);

      const loginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        });

      authToken = loginResponse.body.token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(httpServer)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        email: userCredentials.email,
        walletAddress: userCredentials.walletAddress,
      });

      expect(response.body.password).toBeUndefined();
    });

    it('should reject request without token', async () => {
      await request(httpServer)
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(httpServer)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject request with malformed authorization header', async () => {
      await request(httpServer)
        .get('/auth/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });
  });

  describe('PUT /auth/profile', () => {
    let authToken: string;
    const userCredentials = {
      email: 'update-test@example.com',
      password: 'Password123!',
      walletAddress: '0x1234567890123456789012345678901234567890',
    };

    beforeEach(async () => {
      // Register and login to get auth token
      await request(httpServer)
        .post('/auth/register')
        .send(userCredentials);

      const loginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        });

      authToken = loginResponse.body.token;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        walletAddress: '0x9876543210987654321098765432109876543210',
      };

      const response = await request(httpServer)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.walletAddress).toBe(updateData.walletAddress);
    });

    it('should reject profile update without token', async () => {
      await request(httpServer)
        .put('/auth/profile')
        .send({
          walletAddress: '0x9876543210987654321098765432109876543210',
        })
        .expect(401);
    });

    it('should reject profile update with invalid wallet address', async () => {
      const response = await request(httpServer)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          walletAddress: 'invalid-address',
        })
        .expect(400);

      expect(response.body.message).toContain('wallet');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;
    const userCredentials = {
      email: 'refresh-test@example.com',
      password: 'Password123!',
      walletAddress: '0x1234567890123456789012345678901234567890',
    };

    beforeEach(async () => {
      // Register and login to get refresh token
      await request(httpServer)
        .post('/auth/register')
        .send(userCredentials);

      const loginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const response = await request(httpServer)
        .post('/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        token: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('should reject refresh with invalid token', async () => {
      await request(httpServer)
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);
    });

    it('should reject refresh without token', async () => {
      await request(httpServer)
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });
});