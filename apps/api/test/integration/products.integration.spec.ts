import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { createMockProduct, createMockJwtToken } from '../../../tests/utils/test-helpers';

describe('Products Integration Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();

    // Create regular user token
    const userCredentials = {
      email: 'user@example.com',
      password: 'Password123!',
      walletAddress: '0x1234567890123456789012345678901234567890',
    };

    await request(httpServer)
      .post('/auth/register')
      .send(userCredentials);

    const userLoginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        email: userCredentials.email,
        password: userCredentials.password,
      });

    authToken = userLoginResponse.body.token;

    // Create admin user token
    const adminCredentials = {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      walletAddress: '0x9876543210987654321098765432109876543210',
      role: 'ADMIN',
    };

    await request(httpServer)
      .post('/auth/register')
      .send(adminCredentials);

    const adminLoginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        email: adminCredentials.email,
        password: adminCredentials.password,
      });

    adminToken = adminLoginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('should return list of available products without authentication', async () => {
      const response = await request(httpServer)
        .get('/products')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          type: expect.any(String),
          expectedReturn: expect.any(Number),
          minInvestment: expect.any(Number),
          isActive: expect.any(Boolean),
        });
      }
    });

    it('should filter products by type', async () => {
      const response = await request(httpServer)
        .get('/products?type=FIXED_INCOME')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      if (response.body.length > 0) {
        response.body.forEach(product => {
          expect(product.type).toBe('FIXED_INCOME');
        });
      }
    });

    it('should filter active products only', async () => {
      const response = await request(httpServer)
        .get('/products?active=true')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      if (response.body.length > 0) {
        response.body.forEach(product => {
          expect(product.isActive).toBe(true);
        });
      }
    });

    it('should paginate products correctly', async () => {
      const response = await request(httpServer)
        .get('/products?page=1&limit=5')
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        pagination: expect.objectContaining({
          page: 1,
          limit: 5,
          total: expect.any(Number),
          totalPages: expect.any(Number),
        }),
      });

      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      // Create a test product
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        type: 'FIXED_INCOME',
        expectedReturn: 8.5,
        minInvestment: 1000,
        maxInvestment: 100000,
        duration: 365,
      };

      const createResponse = await request(httpServer)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);

      productId = createResponse.body.id;
    });

    it('should return product details for valid ID', async () => {
      const response = await request(httpServer)
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: productId,
        name: 'Test Product',
        type: 'FIXED_INCOME',
        expectedReturn: 8.5,
        minInvestment: 1000,
      });
    });

    it('should return 404 for non-existent product ID', async () => {
      const response = await request(httpServer)
        .get('/products/non-existent-id')
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid product ID format', async () => {
      await request(httpServer)
        .get('/products/invalid-id-format')
        .expect(400);
    });
  });

  describe('POST /products', () => {
    const validProductData = {
      name: 'New Investment Product',
      description: 'A new investment opportunity',
      type: 'FIXED_INCOME',
      expectedReturn: 7.5,
      minInvestment: 5000,
      maxInvestment: 50000,
      duration: 180,
      totalSupply: 1000000,
    };

    it('should create new product with admin privileges', async () => {
      const response = await request(httpServer)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData)
        .expect(201);

      expect(response.body).toMatchObject({
        ...validProductData,
        id: expect.any(String),
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should reject product creation without admin privileges', async () => {
      const response = await request(httpServer)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validProductData)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should reject product creation without authentication', async () => {
      await request(httpServer)
        .post('/products')
        .send(validProductData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const incompleteProduct = {
        name: 'Incomplete Product',
      };

      const response = await request(httpServer)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteProduct)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });

    it('should validate field types and constraints', async () => {
      const invalidProduct = {
        ...validProductData,
        expectedReturn: -5, // Invalid negative return
        minInvestment: 'invalid', // Invalid type
      };

      const response = await request(httpServer)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });

    it('should reject duplicate product names', async () => {
      // Create first product
      await request(httpServer)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData);

      // Try to create duplicate
      const response = await request(httpServer)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData)
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('PUT /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const productData = {
        name: 'Product to Update',
        description: 'Original Description',
        type: 'FIXED_INCOME',
        expectedReturn: 6.0,
        minInvestment: 2000,
        maxInvestment: 20000,
        duration: 270,
      };

      const createResponse = await request(httpServer)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);

      productId = createResponse.body.id;
    });

    it('should update product with admin privileges', async () => {
      const updateData = {
        name: 'Updated Product Name',
        expectedReturn: 7.0,
        description: 'Updated description',
      };

      const response = await request(httpServer)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: productId,
        ...updateData,
        updatedAt: expect.any(String),
      });
    });

    it('should reject product update without admin privileges', async () => {
      const updateData = {
        name: 'Unauthorized Update',
      };

      const response = await request(httpServer)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should return 404 for non-existent product', async () => {
      const updateData = {
        name: 'Update Non-existent',
      };

      const response = await request(httpServer)
        .put('/products/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        expectedReturn: 'invalid-type',
      };

      const response = await request(httpServer)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });
  });

  describe('DELETE /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const productData = {
        name: 'Product to Delete',
        description: 'This product will be deleted',
        type: 'BONDS',
        expectedReturn: 5.5,
        minInvestment: 1500,
        maxInvestment: 15000,
        duration: 365,
      };

      const createResponse = await request(httpServer)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);

      productId = createResponse.body.id;
    });

    it('should delete product with admin privileges', async () => {
      await request(httpServer)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify product is deleted
      await request(httpServer)
        .get(`/products/${productId}`)
        .expect(404);
    });

    it('should reject product deletion without admin privileges', async () => {
      const response = await request(httpServer)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(httpServer)
        .delete('/products/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /products/stats', () => {
    beforeEach(async () => {
      // Create some test products for stats
      const products = [
        {
          name: 'Active Product 1',
          type: 'FIXED_INCOME',
          expectedReturn: 8.0,
          minInvestment: 1000,
          maxInvestment: 10000,
          duration: 365,
          isActive: true,
        },
        {
          name: 'Inactive Product 1',
          type: 'BONDS',
          expectedReturn: 6.0,
          minInvestment: 2000,
          maxInvestment: 20000,
          duration: 180,
          isActive: false,
        },
      ];

      for (const product of products) {
        await request(httpServer)
          .post('/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(product);
      }
    });

    it('should return product statistics', async () => {
      const response = await request(httpServer)
        .get('/products/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        totalProducts: expect.any(Number),
        activeProducts: expect.any(Number),
        inactiveProducts: expect.any(Number),
        averageReturn: expect.any(Number),
        totalSupply: expect.any(Number),
        typeBreakdown: expect.any(Object),
      });
    });

    it('should require admin privileges for stats', async () => {
      const response = await request(httpServer)
        .get('/products/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });
  });
});