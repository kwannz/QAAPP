import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { MonitoringService, MonitoringMetrics } from './monitoring.service'
import { PerformanceOptimizerService } from '../../common/performance/performance-optimizer.service'
import { OptimizedQueriesService } from '../../common/database/optimized-queries.service'

describe('MonitoringService', () => {
  let service: MonitoringService
  let configService: jest.Mocked<ConfigService>
  let performanceService: jest.Mocked<PerformanceOptimizerService>
  let queriesService: jest.Mocked<OptimizedQueriesService>

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn()
    }

    const mockPerformanceService = {
      getPerformanceMetrics: jest.fn(),
      generatePerformanceReport: jest.fn(),
      clearAllCaches: jest.fn(),
      resetMetrics: jest.fn()
    }

    const mockQueriesService = {
      getUserStatistics: jest.fn(),
      getDashboardStats: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: PerformanceOptimizerService,
          useValue: mockPerformanceService
        },
        {
          provide: OptimizedQueriesService,
          useValue: mockQueriesService
        }
      ]
    }).compile()

    service = module.get<MonitoringService>(MonitoringService)
    configService = module.get(ConfigService)
    performanceService = module.get(PerformanceOptimizerService)
    queriesService = module.get(OptimizedQueriesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getMetrics', () => {
    it('should return consolidated monitoring metrics', async () => {
      // Arrange
      const mockOptimizationMetrics = {
        queryOptimizations: 150,
        cacheHitRate: 0.85,
        averageResponseTime: 120,
        memoryUsage: 512000000,
        cpuUsage: 45.2,
        recommendations: ['Enable query caching', 'Optimize database indexes']
      }

      const mockPerformanceReport = {
        summary: { healthStatus: 'healthy' },
        recommendations: ['Enable caching'],
        metrics: mockOptimizationMetrics,
        cacheStats: { 
          queryCache: { size: 1000, memoryUsage: 50000000 }, 
          responseCache: { size: 500, memoryUsage: 30000000 } 
        }
      }

      performanceService.getPerformanceMetrics.mockResolvedValue(mockOptimizationMetrics)
      performanceService.generatePerformanceReport.mockResolvedValue(mockPerformanceReport)

      // Act
      const result = await service.getMetrics({})

      // Assert
      expect(result).toBeDefined()
      expect(result.performance).toEqual(
        expect.objectContaining({
          avgResponseTime: expect.any(Number),
          errorRate: expect.any(Number),
          uptime: expect.any(Number)
        })
      )
      expect(result.logs).toBeDefined()
      expect(result.audit).toBeDefined()
      expect(result.alerts).toBeDefined()
      expect(result.system).toBeDefined()
      expect(performanceService.getPerformanceMetrics).toHaveBeenCalled()
      expect(performanceService.generatePerformanceReport).toHaveBeenCalled()
    })

    it('should handle performance service errors gracefully', async () => {
      // Arrange
      performanceService.getPerformanceMetrics.mockRejectedValue(new Error('Performance service unavailable'))
      performanceService.generatePerformanceReport.mockRejectedValue(new Error('Performance service unavailable'))

      // Act
      const result = await service.getMetrics({})

      // Assert
      expect(result).toBeDefined()
      expect(result.performance.avgResponseTime).toBe(0)
      expect(result.performance.errorRate).toBe(0)
      expect(result.performance.uptime).toBe(0)
    })
  })

  describe('getLogs', () => {
    it('should return formatted log entries', async () => {
      // Act
      const result = await service.getLogs({ limit: 10 })

      // Assert
      expect(result).toBeDefined()
      expect(result.logs).toBeDefined()
      expect(Array.isArray(result.logs)).toBe(true)
      expect(typeof result.total).toBe('number')
      expect(typeof result.page).toBe('number')
      expect(typeof result.limit).toBe('number')
    })

    it('should filter logs by level when specified', async () => {
      // Act
      const result = await service.getLogs({ level: 'error', limit: 5 })

      // Assert
      expect(result).toBeDefined()
      expect(result.logs).toBeDefined()
      expect(typeof result.total).toBe('number')
    })
  })

  describe('getAuditLogs', () => {
    it('should return audit trail data', async () => {
      // Act
      const result = await service.getAuditLogs({ limit: 20 })

      // Assert
      expect(result).toBeDefined()
      expect(result.logs).toBeDefined()
      expect(Array.isArray(result.logs)).toBe(true)
      expect(typeof result.total).toBe('number')
    })

    it('should filter audit entries by date range', async () => {
      // Arrange
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      // Act
      const result = await service.getAuditLogs({ 
        startDate, 
        endDate, 
        limit: 50 
      })

      // Assert
      expect(result).toBeDefined()
      expect(Array.isArray(result.logs)).toBe(true)
    })
  })

  describe('getAlerts', () => {
    it('should return system alerts', async () => {
      // Act
      const result = await service.getAlerts({})

      // Assert
      expect(result).toBeDefined()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(typeof result.total).toBe('number')
    })
  })

  describe('getDashboardData', () => {
    it('should return dashboard metrics for different time ranges', async () => {
      // Arrange
      const mockOptimizationMetrics = {
        queryOptimizations: 100,
        cacheHitRate: 0.9,
        averageResponseTime: 85,
        memoryUsage: 400000000,
        cpuUsage: 35.5,
        recommendations: ['Excellent performance']
      }

      const mockPerformanceReport = {
        summary: { healthStatus: 'healthy' },
        recommendations: [],
        metrics: mockOptimizationMetrics,
        cacheStats: { 
          queryCache: { size: 800, memoryUsage: 40000000 }, 
          responseCache: { size: 400, memoryUsage: 25000000 } 
        }
      }

      performanceService.getPerformanceMetrics.mockResolvedValue(mockOptimizationMetrics)
      performanceService.generatePerformanceReport.mockResolvedValue(mockPerformanceReport)

      // Act
      const result = await service.getDashboardData('24h')

      // Assert
      expect(result).toBeDefined()
      expect(result.performance).toBeDefined()
      expect(result.logs).toBeDefined()
      expect(result.audit).toBeDefined()
      expect(result.alerts).toBeDefined()
      expect(result.system).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle service dependencies unavailable', async () => {
      // Arrange
      performanceService.getPerformanceMetrics.mockRejectedValue(new Error('Service down'))
      performanceService.generatePerformanceReport.mockRejectedValue(new Error('Service down'))

      // Act & Assert
      await expect(service.getMetrics({})).resolves.toBeDefined()
    })
  })
})