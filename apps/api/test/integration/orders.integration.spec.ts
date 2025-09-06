import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Orders Integration Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let authToken: string;
  let adminToken: string;
  let userId: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();

    // Create regular user
    const userCredentials = {
      email: 'investor@example.com',
      password: 'Password123!',
      walletAddress: '0x1234567890123456789012345678901234567890',
    };

    const userRegResponse = await request(httpServer)
      .post('/auth/register')
      .send(userCredentials);

    userId = userRegResponse.body.user.id;

    const userLoginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        email: userCredentials.email,
        password: userCredentials.password,
      });

    authToken = userLoginResponse.body.token;

    // Create admin user
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

    // Create a test product
    const productData = {
      name: 'Investment Product for Orders',
      description: 'Test product for order testing',
      type: 'FIXED_INCOME',
      expectedReturn: 8.5,
      minInvestment: 1000,
      maxInvestment: 100000,
      duration: 365,
      totalSupply: 1000000,
      availableSupply: 800000,
    };

    const productResponse = await request(httpServer)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productData);

    productId = productResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    const validOrderData = {
      productId: '',
      amount: 5000,
      quantity: 5,
    };

    beforeEach(() => {
      validOrderData.productId = productId;
    });

    it('should create a new investment order', async () => {
      const response = await request(httpServer)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validOrderData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId: userId,
        productId: productId,
        amount: 5000,
        quantity: 5,
        status: 'PENDING',
        createdAt: expect.any(String),
      });
    });

    it('should reject order creation without authentication', async () => {
      await request(httpServer)
        .post('/orders')
        .send(validOrderData)
        .expect(401);
    });

    it('should validate order amount against product constraints', async () => {
      const invalidOrder = {
        ...validOrderData,
        amount: 500, // Below minimum investment
      };

      const response = await request(httpServer)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrder)
        .expect(400);

      expect(response.body.message).toContain('minimum investment');
    });

    it('should validate order amount does not exceed maximum', async () => {
      const invalidOrder = {
        ...validOrderData,
        amount: 200000, // Above maximum investment
      };

      const response = await request(httpServer)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrder)
        .expect(400);

      expect(response.body.message).toContain('maximum investment');
    });

    it('should reject order for non-existent product', async () => {
      const invalidOrder = {
        ...validOrderData,
        productId: 'non-existent-product-id',
      };

      const response = await request(httpServer)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrder)
        .expect(404);

      expect(response.body.message).toContain('Product not found');
    });

    it('should validate required fields', async () => {
      const incompleteOrder = {
        amount: 5000,
      };

      const response = await request(httpServer)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteOrder)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });

    it('should validate positive amounts and quantities', async () => {
      const invalidOrder = {
        ...validOrderData,
        amount: -1000,
        quantity: -5,
      };

      const response = await request(httpServer)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrder)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });
  });

  describe('GET /orders', () => {
    let orderIds: string[] = [];

    beforeEach(async () => {
      // Create multiple test orders
      const orders = [
        { productId, amount: 2000, quantity: 2 },
        { productId, amount: 3000, quantity: 3 },
        { productId, amount: 4000, quantity: 4 },
      ];

      orderIds = [];
      for (const order of orders) {
        const response = await request(httpServer)
          .post('/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(order);
        
        orderIds.push(response.body.id);
      }
    });

    it('should return user orders', async () => {
      const response = await request(httpServer)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      response.body.forEach(order => {
        expect(order).toMatchObject({
          id: expect.any(String),
          userId: userId,
          productId: expect.any(String),
          amount: expect.any(Number),
          quantity: expect.any(Number),
          status: expect.any(String),
        });
      });
    });

    it('should filter orders by status', async () => {
      const response = await request(httpServer)
        .get('/orders?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      if (response.body.length > 0) {
        response.body.forEach(order => {
          expect(order.status).toBe('PENDING');
        });
      }
    });

    it('should paginate orders', async () => {
      const response = await request(httpServer)
        .get('/orders?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        pagination: expect.objectContaining({
          page: 1,
          limit: 2,
          total: expect.any(Number),
          totalPages: expect.any(Number),
        }),
      });

      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should require authentication', async () => {
      await request(httpServer)
        .get('/orders')
        .expect(401);
    });
  });

  describe('GET /orders/:id', () => {
    let orderId: string;

    beforeEach(async () => {
      const orderData = {
        productId,
        amount: 7500,
        quantity: 7,
      };

      const response = await request(httpServer)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      orderId = response.body.id;
    });

    it('should return order details for owner', async () => {
      const response = await request(httpServer)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: orderId,
        userId: userId,
        productId: productId,
        amount: 7500,
        quantity: 7,
      });
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(httpServer)
        .get('/orders/non-existent-order-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should reject access to other user orders', async () => {
      // Create another user
      const otherUserCredentials = {
        email: 'other@example.com',
        password: 'Password123!',
        walletAddress: '0x5555555555555555555555555555555555555555',
      };

      await request(httpServer)
        .post('/auth/register')
        .send(otherUserCredentials);

      const otherUserLoginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: otherUserCredentials.email,
          password: otherUserCredentials.password,
        });

      const otherUserToken = otherUserLoginResponse.body.token;

      const response = await request(httpServer)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should allow admin to access any order', async () => {
      const response = await request(httpServer)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(orderId);
    });
  });

  describe('PUT /orders/:id/status', () => {
    let orderId: string;

    beforeEach(async () => {
      const orderData = {
        productId,
        amount: 6000,
        quantity: 6,
      };

      const response = await request(httpServer)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      orderId = response.body.id;
    });

    it('should update order status by admin', async () => {
      const statusUpdate = {
        status: 'CONFIRMED',
        transactionHash: '0xabcdef123456789abcdef123456789abcdef123456',
      };

      const response = await request(httpServer)
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusUpdate)
        .expect(200);

      expect(response.body).toMatchObject({
        id: orderId,
        status: 'CONFIRMED',
        transactionHash: '0xabcdef123456789abcdef123456789abcdef123456',
        updatedAt: expect.any(String),
      });
    });

    it('should reject status update by non-admin', async () => {
      const statusUpdate = {
        status: 'CONFIRMED',
      };

      const response = await request(httpServer)
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusUpdate)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should validate status values', async () => {
      const invalidStatusUpdate = {
        status: 'INVALID_STATUS',
      };

      const response = await request(httpServer)
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidStatusUpdate)
        .expect(400);

      expect(response.body.message).toContain('status');
    });

    it('should return 404 for non-existent order', async () => {
      const statusUpdate = {
        status: 'CONFIRMED',
      };

      const response = await request(httpServer)
        .put('/orders/non-existent-order/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusUpdate)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /orders/:id', () => {
    let orderId: string;

    beforeEach(async () => {
      const orderData = {
        productId,
        amount: 3500,
        quantity: 3,
      };

      const response = await request(httpServer)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      orderId = response.body.id;
    });

    it('should allow user to cancel their own pending order', async () => {
      await request(httpServer)
        .delete(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify order is marked as cancelled
      const response = await request(httpServer)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('CANCELLED');
    });

    it('should reject cancellation by other users', async () => {
      // Create another user
      const otherUserCredentials = {
        email: 'other2@example.com',
        password: 'Password123!',
        walletAddress: '0x6666666666666666666666666666666666666666',
      };

      await request(httpServer)
        .post('/auth/register')
        .send(otherUserCredentials);

      const otherUserLoginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: otherUserCredentials.email,
          password: otherUserCredentials.password,
        });

      const otherUserToken = otherUserLoginResponse.body.token;

      const response = await request(httpServer)
        .delete(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should allow admin to cancel any order', async () => {
      await request(httpServer)
        .delete(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should reject cancellation of confirmed orders', async () => {
      // First confirm the order as admin
      await request(httpServer)
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });

      // Then try to cancel it
      const response = await request(httpServer)
        .delete(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toContain('cannot be cancelled');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(httpServer)
        .delete('/orders/non-existent-order')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /orders/stats', () => {
    beforeEach(async () => {
      // Create orders with different statuses
      const orders = [
        { productId, amount: 1000, quantity: 1, status: 'PENDING' },
        { productId, amount: 2000, quantity: 2, status: 'CONFIRMED' },
        { productId, amount: 3000, quantity: 3, status: 'COMPLETED' },
      ];

      for (const order of orders) {
        const response = await request(httpServer)
          .post('/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(order);

        if (order.status !== 'PENDING') {
          await request(httpServer)
            .put(`/orders/${response.body.id}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: order.status });
        }
      }
    });

    it('should return order statistics for admin', async () => {
      const response = await request(httpServer)
        .get('/orders/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        totalOrders: expect.any(Number),
        totalValue: expect.any(Number),
        statusBreakdown: expect.any(Object),
        averageOrderValue: expect.any(Number),
        monthlyGrowth: expect.any(Number),
      });
    });

    it('should reject order stats access for regular users', async () => {
      const response = await request(httpServer)
        .get('/orders/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });
  });
});