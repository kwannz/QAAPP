import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../cache/cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let databaseService: jest.Mocked<DatabaseService>;
  let cacheService: jest.Mocked<CacheService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockOrder = {
    id: '1',
    userId: 'user1',
    productId: 'prod1',
    quantity: 10,
    price: 100,
    totalAmount: 1000,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: DatabaseService,
          useValue: {
            order: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
              groupBy: jest.fn(),
            },
            product: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback({
              order: {
                create: jest.fn(),
                update: jest.fn(),
              },
              product: {
                update: jest.fn(),
              },
            })),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            invalidate: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            emitAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    databaseService = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
    cacheService = module.get(CacheService) as jest.Mocked<CacheService>;
    eventEmitter = module.get(EventEmitter2) as jest.Mocked<EventEmitter2>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createDto = {
        userId: 'user1',
        productId: 'prod1',
        quantity: 10,
      };

      const mockProduct = {
        id: 'prod1',
        price: 100,
        stock: 50,
        isActive: true,
      };

      const mockUser = {
        id: 'user1',
        isActive: true,
        kycStatus: 'APPROVED',
      };

      databaseService.product.findUnique.mockResolvedValue(mockProduct);
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(createDto);

      expect(result).toEqual(mockOrder);
      expect(eventEmitter.emit).toHaveBeenCalledWith('order.created', mockOrder);
    });

    it('should throw BadRequestException if product not found', async () => {
      const createDto = {
        userId: 'user1',
        productId: 'invalid',
        quantity: 10,
      };

      databaseService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const createDto = {
        userId: 'user1',
        productId: 'prod1',
        quantity: 100,
      };

      const mockProduct = {
        id: 'prod1',
        price: 100,
        stock: 50,
        isActive: true,
      };

      databaseService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should use transaction for order creation', async () => {
      const createDto = {
        userId: 'user1',
        productId: 'prod1',
        quantity: 10,
      };

      const mockProduct = {
        id: 'prod1',
        price: 100,
        stock: 50,
        isActive: true,
      };

      const mockUser = {
        id: 'user1',
        isActive: true,
        kycStatus: 'APPROVED',
      };

      databaseService.product.findUnique.mockResolvedValue(mockProduct);
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      await service.create(createDto);

      expect(databaseService.$transaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [mockOrder];
      databaseService.order.findMany.mockResolvedValue(mockOrders);
      databaseService.order.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        userId: 'user1',
      });

      expect(result).toEqual({
        orders: mockOrders,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters correctly', async () => {
      await service.findAll({
        page: 1,
        limit: 10,
        status: 'COMPLETED',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect(databaseService.order.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'COMPLETED',
          createdAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should use cache when available', async () => {
      const cacheKey = 'orders:page:1:limit:10';
      const cachedData = {
        orders: [mockOrder],
        total: 1,
      };

      cacheService.get.mockResolvedValue(cachedData);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.orders).toEqual(cachedData.orders);
      expect(databaseService.order.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      databaseService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne('1');

      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      databaseService.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update order status', async () => {
      databaseService.order.findUnique.mockResolvedValue(mockOrder);
      databaseService.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
      });

      const result = await service.update('1', { status: 'PROCESSING' });

      expect(result.status).toBe('PROCESSING');
      expect(eventEmitter.emit).toHaveBeenCalledWith('order.updated', expect.any(Object));
    });

    it('should invalidate cache after update', async () => {
      databaseService.order.findUnique.mockResolvedValue(mockOrder);
      databaseService.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
      });

      await service.update('1', { status: 'PROCESSING' });

      expect(cacheService.invalidate).toHaveBeenCalledWith('orders:*');
    });
  });

  describe('cancel', () => {
    it('should cancel a pending order', async () => {
      databaseService.order.findUnique.mockResolvedValue(mockOrder);
      databaseService.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'CANCELLED',
      });

      const result = await service.cancel('1', 'user1');

      expect(result.status).toBe('CANCELLED');
      expect(eventEmitter.emit).toHaveBeenCalledWith('order.cancelled', expect.any(Object));
    });

    it('should throw BadRequestException if order not pending', async () => {
      databaseService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'COMPLETED',
      });

      await expect(service.cancel('1', 'user1')).rejects.toThrow(BadRequestException);
    });

    it('should restore product stock on cancellation', async () => {
      databaseService.order.findUnique.mockResolvedValue(mockOrder);

      await service.cancel('1', 'user1');

      expect(databaseService.$transaction).toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete an order', async () => {
      databaseService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
      });
      databaseService.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'COMPLETED',
      });

      const result = await service.complete('1');

      expect(result.status).toBe('COMPLETED');
      expect(eventEmitter.emit).toHaveBeenCalledWith('order.completed', expect.any(Object));
    });
  });

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      databaseService.order.count.mockImplementation((args) => {
        if (!args) return Promise.resolve(100);
        if (args.where?.status === 'PENDING') return Promise.resolve(10);
        if (args.where?.status === 'PROCESSING') return Promise.resolve(20);
        if (args.where?.status === 'COMPLETED') return Promise.resolve(60);
        if (args.where?.status === 'CANCELLED') return Promise.resolve(10);
        return Promise.resolve(0);
      });

      databaseService.order.aggregate.mockResolvedValue({
        _sum: { totalAmount: 100000 },
        _avg: { totalAmount: 1000 },
        _count: 100,
      });

      const result = await service.getOrderStats();

      expect(result).toEqual({
        total: 100,
        pending: 10,
        processing: 20,
        completed: 60,
        cancelled: 10,
        totalRevenue: 100000,
        averageOrderValue: 1000,
      });
    });
  });

  describe('getUserOrders', () => {
    it('should return orders for a specific user', async () => {
      databaseService.order.findMany.mockResolvedValue([mockOrder]);
      databaseService.order.count.mockResolvedValue(1);

      const result = await service.getUserOrders('user1', {
        page: 1,
        limit: 10,
      });

      expect(result.orders).toEqual([mockOrder]);
      expect(databaseService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should bulk update order status', async () => {
      databaseService.order.update.mockResolvedValue(mockOrder);

      await service.bulkUpdateStatus(['1', '2'], 'PROCESSING');

      expect(databaseService.order.update).toHaveBeenCalledTimes(2);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('exportOrders', () => {
    it('should export orders in CSV format', async () => {
      databaseService.order.findMany.mockResolvedValue([mockOrder]);

      const result = await service.exportOrders('csv', {});

      expect(result).toContain('orderId,userId,productId');
      expect(result).toContain('1,user1,prod1');
    });

    it('should export orders in JSON format', async () => {
      databaseService.order.findMany.mockResolvedValue([mockOrder]);

      const result = await service.exportOrders('json', {});

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('1');
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should return revenue analytics', async () => {
      databaseService.order.groupBy.mockResolvedValue([
        {
          createdAt: new Date('2024-01-01'),
          _sum: { totalAmount: 10000 },
          _count: 10,
        },
        {
          createdAt: new Date('2024-01-02'),
          _sum: { totalAmount: 15000 },
          _count: 15,
        },
      ]);

      const result = await service.getRevenueAnalytics(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toHaveLength(2);
      expect(result[0].revenue).toBe(10000);
    });
  });

  describe('validateOrder', () => {
    it('should validate order successfully', async () => {
      const mockProduct = {
        id: 'prod1',
        price: 100,
        stock: 50,
        isActive: true,
        minOrderQuantity: 1,
        maxOrderQuantity: 100,
      };

      databaseService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.validateOrder('prod1', 10);

      expect(result.isValid).toBe(true);
    });

    it('should return validation errors for invalid quantity', async () => {
      const mockProduct = {
        id: 'prod1',
        price: 100,
        stock: 5,
        isActive: true,
        minOrderQuantity: 1,
        maxOrderQuantity: 100,
      };

      databaseService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.validateOrder('prod1', 10);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Insufficient stock');
    });
  });
});
