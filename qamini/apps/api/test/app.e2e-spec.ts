import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    databaseService = app.get<DatabaseService>(DatabaseService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });
  });

  describe('Authentication', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'Test123!@#',
      name: 'Test User',
    };

    it('/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          authToken = res.body.access_token;
        });
    });

    it('/auth/register (POST) - duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('/auth/login (POST) - invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('/auth/profile (GET)', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', testUser.email);
        });
    });

    it('/auth/profile (GET) - unauthorized', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('/auth/logout (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Users', () => {
    it('/users (GET)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.users)).toBe(true);
        });
    });

    it('/users (GET) - with pagination', () => {
      return request(app.getHttpServer())
        .get('/users?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('page', 1);
          expect(res.body).toHaveProperty('limit', 10);
        });
    });

    it('/users (GET) - with filters', () => {
      return request(app.getHttpServer())
        .get('/users?role=USER&isActive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Products', () => {
    let productId: string;

    it('/products (POST)', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 100,
          category: 'TEST',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Test Product');
          productId = res.body.id;
        });
    });

    it('/products (GET)', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('products');
          expect(Array.isArray(res.body.products)).toBe(true);
        });
    });

    it('/products/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', productId);
        });
    });

    it('/products/:id (PATCH)', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 149.99,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('price', 149.99);
        });
    });

    it('/products/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Orders', () => {
    let orderId: string;

    it('/orders (POST)', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'test-product-id',
          quantity: 2,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('status', 'PENDING');
          orderId = res.body.id;
        });
    });

    it('/orders (GET)', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('orders');
          expect(Array.isArray(res.body.orders)).toBe(true);
        });
    });

    it('/orders/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', orderId);
        });
    });

    it('/orders/:id/cancel (POST)', () => {
      return request(app.getHttpServer())
        .post(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'CANCELLED');
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', () => {
      return request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404);
    });

    it('should handle validation errors', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('error');
        });
    });

    it('should handle unauthorized access', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 99.99,
        })
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      const requests = Array(101).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/health')
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(res => res.status === 429);
      
      expect(rateLimited).toBe(true);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });

  describe('API Versioning', () => {
    it('should support v1 endpoints', () => {
      return request(app.getHttpServer())
        .get('/v1/health')
        .expect(200);
    });

    it('should support v2 endpoints', () => {
      return request(app.getHttpServer())
        .get('/v2/health')
        .expect(200);
    });
  });
});
