import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PerformanceOptimizerService } from './performance-optimizer.service';

describe('PerformanceOptimizerService', () => {
  let service: PerformanceOptimizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceOptimizerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
              const config = {
                ENABLE_QUERY_OPTIMIZATION: true,
                ENABLE_RESPONSE_COMPRESSION: true,
                ENABLE_REQUEST_BATCHING: true,
                CACHE_DEFAULT_TTL: 300000,
                CACHE_MAX_MEMORY_MB: 512,
                ENABLE_APM_TRACING: true,
                SLOW_QUERY_THRESHOLD_MS: 1000,
                RESPONSE_TIME_THRESHOLD_MS: 2000,
              };
              return config[key] !== undefined ? config[key] : defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PerformanceOptimizerService>(PerformanceOptimizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('optimizeQuery', () => {
    it('should execute query function and return result', async () => {
      const queryKey = 'test-query';
      const queryFn = jest.fn().mockResolvedValue({ result: 'test-data' });
      
      const result = await service.optimizeQuery(queryKey, queryFn);

      expect(queryFn).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ result: 'test-data' });
    });

    it('should use cache for subsequent identical queries', async () => {
      const queryKey = 'cached-query';
      const queryFn = jest.fn().mockResolvedValue({ result: 'cached-data' });
      
      // First call - should execute query
      const result1 = await service.optimizeQuery(queryKey, queryFn);
      
      // Second call - should use cache (won't call queryFn again)
      const result2 = await service.optimizeQuery(queryKey, queryFn);

      expect(queryFn).toHaveBeenCalledTimes(1); // Only called once
      expect(result1).toEqual({ result: 'cached-data' });
      expect(result2).toEqual({ result: 'cached-data' });
    });

    it('should respect skip cache option', async () => {
      const queryKey = 'skip-cache-query';
      const queryFn = jest.fn().mockResolvedValue({ result: 'fresh-data' });
      
      // First call
      await service.optimizeQuery(queryKey, queryFn);
      
      // Second call with skipCache should execute query again
      await service.optimizeQuery(queryKey, queryFn, { skipCache: true });

      expect(queryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('batchOptimize', () => {
    it('should batch multiple requests efficiently', async () => {
      const batchKey = 'test-batch';
      const batchFn = jest.fn().mockResolvedValue(['result1', 'result2', 'result3']);
      
      const requests = [
        service.batchOptimize(batchKey, batchFn, { data: 'request1' }),
        service.batchOptimize(batchKey, batchFn, { data: 'request2' }),
        service.batchOptimize(batchKey, batchFn, { data: 'request3' }),
      ];

      const results = await Promise.all(requests);

      expect(results).toEqual(['result1', 'result2', 'result3']);
      expect(batchFn).toHaveBeenCalledTimes(1); // Batched into single call
      expect(batchFn).toHaveBeenCalledWith([
        { data: 'request1' },
        { data: 'request2' },
        { data: 'request3' },
      ]);
    });
  });

  describe('optimizeResponse', () => {
    it('should cache response data', async () => {
      const cacheKey = 'response-test';
      const responseFn = jest.fn().mockResolvedValue({ data: 'response' });

      const result = await service.optimizeResponse(cacheKey, responseFn);

      expect(result).toEqual({ data: 'response' });
      expect(responseFn).toHaveBeenCalledTimes(1);
    });

    it('should return cached response on subsequent calls', async () => {
      const cacheKey = 'cached-response';
      const responseFn = jest.fn().mockResolvedValue({ data: 'cached' });

      // First call
      const result1 = await service.optimizeResponse(cacheKey, responseFn, 5000);
      
      // Second call should use cache
      const result2 = await service.optimizeResponse(cacheKey, responseFn, 5000);

      expect(result1).toEqual(result2);
      expect(responseFn).toHaveBeenCalledTimes(1); // Only called once
    });
  });
});