import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../cache/cache.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let databaseService: jest.Mocked<DatabaseService>;
  let cacheService: jest.Mocked<CacheService>;

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 50,
    category: 'TEST',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: DatabaseService,
          useValue: {
            product: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
              groupBy: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback({
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
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    databaseService = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
    cacheService = module.get(CacheService) as jest.Mocked<CacheService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto = {
        name: 'New Product',
        description: 'New Description',
        price: 150,
        stock: 100,
        category: 'NEW',
      };

      databaseService.product.findUnique.mockResolvedValue(null);
      databaseService.product.create.mockResolvedValue({
        id: '2',
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', '2');
      expect(result.name).toBe('New Product');
      expect(cacheService.invalidate).toHaveBeenCalledWith('products:*');
    });

    it('should throw BadRequestException if product name exists', async () => {
      const createDto = {
        name: 'Existing Product',
        description: 'Description',
        price: 100,
        stock: 50,
        category: 'TEST',
      };

      databaseService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should validate price and stock', async () => {
      const createDto = {
        name: 'Product',
        description: 'Description',
        price: -10,
        stock: -5,
        category: 'TEST',
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      databaseService.product.findMany.mockResolvedValue([mockProduct]);
      databaseService.product.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by category', async () => {
      await service.findAll({
        page: 1,
        limit: 10,
        category: 'TEST',
      });

      expect(databaseService.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          category: 'TEST',
        }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by price range', async () => {
      await service.findAll({
        page: 1,
        limit: 10,
        minPrice: 50,
        maxPrice: 200,
      });

      expect(databaseService.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          price: {
            gte: 50,
            lte: 200,
          },
        }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should search by name', async () => {
      await service.findAll({
        page: 1,
        limit: 10,
        search: 'test',
      });

      expect(databaseService.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should use cache for frequently accessed pages', async () => {
      const cachedData = {
        products: [mockProduct],
        total: 1,
      };

      cacheService.get.mockResolvedValue(cachedData);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.products).toEqual(cachedData.products);
      expect(databaseService.product.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      databaseService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should use cache for frequently accessed products', async () => {
      cacheService.get.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(databaseService.product.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);
      databaseService.product.update.mockResolvedValue({
        ...mockProduct,
        price: 200,
      });

      const result = await service.update('1', { price: 200 });

      expect(result.price).toBe(200);
      expect(cacheService.invalidate).toHaveBeenCalledWith('products:*');
    });

    it('should validate price update', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.update('1', { price: -100 })
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate stock update', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.update('1', { stock: -10 })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete product', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);
      databaseService.product.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
        deletedAt: new Date(),
      });

      await service.remove('1');

      expect(databaseService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(Date),
        }),
      });
    });

    it('should invalidate cache after deletion', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);
      databaseService.product.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      await service.remove('1');

      expect(cacheService.invalidate).toHaveBeenCalledWith('products:*');
    });
  });

  describe('updateStock', () => {
    it('should increase stock', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);
      databaseService.product.update.mockResolvedValue({
        ...mockProduct,
        stock: 60,
      });

      const result = await service.updateStock('1', 10, 'increase');

      expect(result.stock).toBe(60);
    });

    it('should decrease stock', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);
      databaseService.product.update.mockResolvedValue({
        ...mockProduct,
        stock: 40,
      });

      const result = await service.updateStock('1', 10, 'decrease');

      expect(result.stock).toBe(40);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.updateStock('1', 100, 'decrease')
      ).rejects.toThrow(BadRequestException);
    });

    it('should use transaction for stock update', async () => {
      databaseService.product.findUnique.mockResolvedValue(mockProduct);

      await service.updateStock('1', 10, 'decrease');

      expect(databaseService.$transaction).toHaveBeenCalled();
    });
  });

  describe('bulkUpdatePrices', () => {
    it('should bulk update product prices', async () => {
      const updates = [
        { id: '1', price: 150 },
        { id: '2', price: 200 },
      ];

      databaseService.product.update.mockResolvedValue(mockProduct);

      await service.bulkUpdatePrices(updates);

      expect(databaseService.product.update).toHaveBeenCalledTimes(2);
      expect(cacheService.invalidate).toHaveBeenCalledWith('products:*');
    });
  });

  describe('getProductStats', () => {
    it('should return product statistics', async () => {
      databaseService.product.count.mockResolvedValue(100);
      databaseService.product.aggregate.mockResolvedValue({
        _avg: { price: 150 },
        _sum: { stock: 5000 },
        _min: { price: 10 },
        _max: { price: 1000 },
      });
      databaseService.product.groupBy.mockResolvedValue([
        { category: 'CATEGORY1', _count: { category: 40 } },
        { category: 'CATEGORY2', _count: { category: 60 } },
      ]);

      const result = await service.getProductStats();

      expect(result).toEqual({
        totalProducts: 100,
        averagePrice: 150,
        totalStock: 5000,
        minPrice: 10,
        maxPrice: 1000,
        categoryDistribution: {
          CATEGORY1: 40,
          CATEGORY2: 60,
        },
      });
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      databaseService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.searchProducts('test');

      expect(databaseService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
            { category: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        take: 20,
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getPopularProducts', () => {
    it('should return popular products', async () => {
      const popularProducts = [
        { ...mockProduct, orderCount: 100 },
      ];

      databaseService.product.findMany.mockResolvedValue(popularProducts);

      const result = await service.getPopularProducts(5);

      expect(databaseService.product.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { orderCount: 'desc' },
        take: 5,
      });
      expect(result).toEqual(popularProducts);
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with low stock', async () => {
      const lowStockProducts = [
        { ...mockProduct, stock: 5 },
      ];

      databaseService.product.findMany.mockResolvedValue(lowStockProducts);

      const result = await service.getLowStockProducts(10);

      expect(databaseService.product.findMany).toHaveBeenCalledWith({
        where: {
          stock: { lte: 10 },
          isActive: true,
        },
        orderBy: { stock: 'asc' },
      });
      expect(result).toEqual(lowStockProducts);
    });
  });

  describe('importProducts', () => {
    it('should import products from CSV', async () => {
      const csvData = `name,description,price,stock,category
Product1,Description1,100,50,CATEGORY1
Product2,Description2,200,100,CATEGORY2`;

      databaseService.product.findUnique.mockResolvedValue(null);
      databaseService.product.create.mockResolvedValue(mockProduct);

      const result = await service.importProducts(csvData, 'csv');

      expect(result).toEqual({
        imported: 2,
        failed: 0,
        errors: [],
      });
    });

    it('should handle import errors', async () => {
      const csvData = `name,description,price,stock,category
Product1,Description1,-100,50,CATEGORY1`;

      const result = await service.importProducts(csvData, 'csv');

      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('exportProducts', () => {
    it('should export products in CSV format', async () => {
      databaseService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.exportProducts('csv');

      expect(result).toContain('name,description,price,stock,category');
      expect(result).toContain('Test Product');
    });

    it('should export products in JSON format', async () => {
      databaseService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.exportProducts('json');

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Test Product');
    });
  });
});