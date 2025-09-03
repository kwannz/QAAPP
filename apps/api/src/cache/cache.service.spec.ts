import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: any;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
            keys: jest.fn(),
            ttl: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    configService.get.mockReturnValue('development');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get value from cache', async () => {
      const mockValue = { id: 1, name: 'Test' };
      cacheManager.get.mockResolvedValue(mockValue);

      const result = await service.get('test-key');

      expect(result).toEqual(mockValue);
      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null if key not found', async () => {
      cacheManager.get.mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      cacheManager.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.get('error-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value in cache with default TTL', async () => {
      await service.set('test-key', { value: 'test' });

      expect(cacheManager.set).toHaveBeenCalledWith(
        'test-key',
        { value: 'test' },
        300
      );
    });

    it('should set value with custom TTL', async () => {
      await service.set('test-key', { value: 'test' }, 600);

      expect(cacheManager.set).toHaveBeenCalledWith(
        'test-key',
        { value: 'test' },
        600
      );
    });

    it('should handle set errors gracefully', async () => {
      cacheManager.set.mockRejectedValue(new Error('Set error'));

      await expect(
        service.set('error-key', { value: 'test' })
      ).resolves.not.toThrow();
    });
  });

  describe('del', () => {
    it('should delete key from cache', async () => {
      await service.del('test-key');

      expect(cacheManager.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle delete errors gracefully', async () => {
      cacheManager.del.mockRejectedValue(new Error('Delete error'));

      await expect(service.del('error-key')).resolves.not.toThrow();
    });
  });

  describe('reset', () => {
    it('should reset entire cache', async () => {
      await service.reset();

      expect(cacheManager.reset).toHaveBeenCalled();
    });

    it('should handle reset errors gracefully', async () => {
      cacheManager.reset.mockRejectedValue(new Error('Reset error'));

      await expect(service.reset()).resolves.not.toThrow();
    });
  });

  describe('invalidate', () => {
    it('should invalidate keys matching pattern', async () => {
      cacheManager.keys.mockResolvedValue(['user:1', 'user:2', 'product:1']);

      await service.invalidate('user:*');

      expect(cacheManager.del).toHaveBeenCalledWith('user:1');
      expect(cacheManager.del).toHaveBeenCalledWith('user:2');
      expect(cacheManager.del).not.toHaveBeenCalledWith('product:1');
    });

    it('should handle pattern without wildcard', async () => {
      await service.invalidate('specific-key');

      expect(cacheManager.del).toHaveBeenCalledWith('specific-key');
    });

    it('should handle invalidate errors gracefully', async () => {
      cacheManager.keys.mockRejectedValue(new Error('Keys error'));

      await expect(service.invalidate('pattern:*')).resolves.not.toThrow();
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const cachedValue = { id: 1, data: 'cached' };
      cacheManager.get.mockResolvedValue(cachedValue);

      const factory = jest.fn();
      const result = await service.getOrSet('test-key', factory);

      expect(result).toEqual(cachedValue);
      expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory and cache result if not in cache', async () => {
      const newValue = { id: 1, data: 'new' };
      cacheManager.get.mockResolvedValue(null);
      const factory = jest.fn().mockResolvedValue(newValue);

      const result = await service.getOrSet('test-key', factory, 600);

      expect(result).toEqual(newValue);
      expect(factory).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('test-key', newValue, 600);
    });

    it('should handle factory errors', async () => {
      cacheManager.get.mockResolvedValue(null);
      const factory = jest.fn().mockRejectedValue(new Error('Factory error'));

      await expect(
        service.getOrSet('test-key', factory)
      ).rejects.toThrow('Factory error');
    });
  });

  describe('mget', () => {
    it('should get multiple values', async () => {
      cacheManager.get
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 })
        .mockResolvedValueOnce(null);

      const result = await service.mget(['key1', 'key2', 'key3']);

      expect(result).toEqual([{ id: 1 }, { id: 2 }, null]);
    });
  });

  describe('mset', () => {
    it('should set multiple key-value pairs', async () => {
      const items = [
        { key: 'key1', value: { id: 1 }, ttl: 300 },
        { key: 'key2', value: { id: 2 }, ttl: 600 },
      ];

      await service.mset(items);

      expect(cacheManager.set).toHaveBeenCalledWith('key1', { id: 1 }, 300);
      expect(cacheManager.set).toHaveBeenCalledWith('key2', { id: 2 }, 600);
    });
  });

  describe('getTTL', () => {
    it('should get TTL for a key', async () => {
      cacheManager.ttl.mockResolvedValue(120);

      const result = await service.getTTL('test-key');

      expect(result).toBe(120);
    });

    it('should return -1 if key not found', async () => {
      cacheManager.ttl.mockResolvedValue(-1);

      const result = await service.getTTL('non-existent');

      expect(result).toBe(-1);
    });
  });

  describe('exists', () => {
    it('should return true if key exists', async () => {
      cacheManager.get.mockResolvedValue({ value: 'exists' });

      const result = await service.exists('test-key');

      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      cacheManager.get.mockResolvedValue(null);

      const result = await service.exists('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('increment', () => {
    it('should increment numeric value', async () => {
      cacheManager.get.mockResolvedValue(5);

      const result = await service.increment('counter', 3);

      expect(result).toBe(8);
      expect(cacheManager.set).toHaveBeenCalledWith('counter', 8, undefined);
    });

    it('should initialize to increment value if key does not exist', async () => {
      cacheManager.get.mockResolvedValue(null);

      const result = await service.increment('new-counter', 5);

      expect(result).toBe(5);
      expect(cacheManager.set).toHaveBeenCalledWith('new-counter', 5, undefined);
    });
  });

  describe('decrement', () => {
    it('should decrement numeric value', async () => {
      cacheManager.get.mockResolvedValue(10);

      const result = await service.decrement('counter', 3);

      expect(result).toBe(7);
      expect(cacheManager.set).toHaveBeenCalledWith('counter', 7, undefined);
    });

    it('should initialize to negative value if key does not exist', async () => {
      cacheManager.get.mockResolvedValue(null);

      const result = await service.decrement('new-counter', 5);

      expect(result).toBe(-5);
      expect(cacheManager.set).toHaveBeenCalledWith('new-counter', -5, undefined);
    });
  });

  describe('wrap', () => {
    it('should wrap function with caching', async () => {
      const fn = jest.fn().mockResolvedValue({ result: 'data' });
      const wrappedFn = service.wrap('wrapped-key', fn, 600);

      cacheManager.get.mockResolvedValue(null);

      const result = await wrappedFn('arg1', 'arg2');

      expect(result).toEqual({ result: 'data' });
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'wrapped-key',
        { result: 'data' },
        600
      );
    });

    it('should return cached result on subsequent calls', async () => {
      const fn = jest.fn();
      const wrappedFn = service.wrap('wrapped-key', fn);

      cacheManager.get.mockResolvedValue({ cached: true });

      const result = await wrappedFn();

      expect(result).toEqual({ cached: true });
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('stats', () => {
    it('should return cache statistics', async () => {
      cacheManager.keys.mockResolvedValue(['key1', 'key2', 'key3']);

      const stats = await service.stats();

      expect(stats).toHaveProperty('keys', 3);
      expect(stats).toHaveProperty('memory');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
    });
  });
});