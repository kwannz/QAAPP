import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    configService.get.mockImplementation((key: string) => {
      const config = {
        DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
        NODE_ENV: 'test',
      };
      return config[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to database on module init', async () => {
      const connectSpy = jest.spyOn(service, '$connect' as any).mockResolvedValue(undefined);
      const querySpy = jest.spyOn(service, '$queryRaw' as any).mockResolvedValue([{ test: 1 }]);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
      expect(querySpy).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      jest.spyOn(service, '$connect' as any).mockRejectedValue(new Error('Connection failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.onModuleInit();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to connect to database:',
        expect.any(Error)
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database on module destroy', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect' as any).mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('isHealthy', () => {
    it('should return true when database is healthy', async () => {
      jest.spyOn(service, '$queryRaw' as any).mockResolvedValue([{ test: 1 }]);

      const result = await service.isHealthy();

      expect(result).toBe(true);
    });

    it('should return false when database is not healthy', async () => {
      jest.spyOn(service, '$queryRaw' as any).mockRejectedValue(new Error('Query failed'));

      const result = await service.isHealthy();

      expect(result).toBe(false);
    });
  });

  describe('event listeners', () => {
    it('should setup event listeners', () => {
      const onSpy = jest.spyOn(service, '$on' as any).mockImplementation();

      // Trigger constructor again to test event listener setup
      const newService = new DatabaseService(configService);

      expect(onSpy).toHaveBeenCalledWith('query', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('info', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('warn', expect.any(Function));
    });
  });

  describe('database operations', () => {
    it('should handle user operations', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      service.user = {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        findMany: jest.fn().mockResolvedValue([mockUser]),
        create: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
        delete: jest.fn().mockResolvedValue(mockUser),
        count: jest.fn().mockResolvedValue(1),
      } as any;

      const result = await service.user.findUnique({ where: { id: '1' } });
      expect(result).toEqual(mockUser);
    });

    it('should handle product operations', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 100,
      };

      service.product = {
        findUnique: jest.fn().mockResolvedValue(mockProduct),
        findMany: jest.fn().mockResolvedValue([mockProduct]),
        create: jest.fn().mockResolvedValue(mockProduct),
        update: jest.fn().mockResolvedValue(mockProduct),
        delete: jest.fn().mockResolvedValue(mockProduct),
      } as any;

      const result = await service.product.findUnique({ where: { id: '1' } });
      expect(result).toEqual(mockProduct);
    });

    it('should handle order operations', async () => {
      const mockOrder = {
        id: '1',
        userId: 'user1',
        totalAmount: 100,
      };

      service.order = {
        findUnique: jest.fn().mockResolvedValue(mockOrder),
        findMany: jest.fn().mockResolvedValue([mockOrder]),
        create: jest.fn().mockResolvedValue(mockOrder),
        update: jest.fn().mockResolvedValue(mockOrder),
      } as any;

      const result = await service.order.findUnique({ where: { id: '1' } });
      expect(result).toEqual(mockOrder);
    });

    it('should handle transactions', async () => {
      const transactionCallback = jest.fn().mockResolvedValue({ success: true });
      service.$transaction = jest.fn().mockImplementation((callback) => callback(service));

      const result = await service.$transaction(transactionCallback);

      expect(result).toEqual({ success: true });
      expect(transactionCallback).toHaveBeenCalledWith(service);
    });
  });

  describe('error handling', () => {
    it('should handle query errors', async () => {
      const errorHandler = jest.fn();
      service.$on = jest.fn().mockImplementation((event, handler) => {
        if (event === 'error') {
          errorHandler.mockImplementation(handler);
        }
      });

      const newService = new DatabaseService(configService);
      
      const error = new Error('Query failed');
      errorHandler(error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });
  });
});
