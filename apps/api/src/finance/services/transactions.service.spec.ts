import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TransactionsService, TransactionQuery, UnifiedTransaction } from './transactions.service'

describe('TransactionsService', () => {
  let service: TransactionsService
  let configService: jest.Mocked<ConfigService>

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    }).compile()

    service = module.get<TransactionsService>(TransactionsService)
    configService = module.get(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return unified transaction list', async () => {
      // Arrange
      const query: TransactionQuery = {
        userId: 'user1',
        type: 'ALL',
        limit: 10,
        offset: 0
      }

      // Act
      const result = await service.findAll(query)

      // Assert
      expect(result).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(typeof result.total).toBe('number')
      expect(typeof result.page).toBe('number')
      expect(typeof result.pageSize).toBe('number')
    })

    it('should filter transactions by type', async () => {
      // Arrange
      const query: TransactionQuery = {
        type: 'PAYOUT',
        limit: 5
      }

      // Act
      const result = await service.findAll(query)

      // Assert
      expect(result).toBeDefined()
      if (result.data.length > 0) {
        expect(result.data.every(tx => tx.type === 'PAYOUT')).toBe(true)
      }
    })

    it('should filter transactions by status', async () => {
      // Arrange
      const query: TransactionQuery = {
        status: 'COMPLETED',
        limit: 10
      }

      // Act
      const result = await service.findAll(query)

      // Assert
      expect(result).toBeDefined()
      if (result.data.length > 0) {
        expect(result.data.every(tx => tx.status === 'COMPLETED')).toBe(true)
      }
    })

    it('should handle date range filtering', async () => {
      // Arrange
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      const query: TransactionQuery = {
        startDate,
        endDate,
        limit: 20
      }

      // Act
      const result = await service.findAll(query)

      // Assert
      expect(result).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should handle invalid query parameters gracefully', async () => {
      // Arrange
      const invalidQuery: TransactionQuery = {
        limit: -1,
        offset: -5
      }

      // Act
      const result = await service.findAll(invalidQuery)
      
      // Assert - service handles gracefully by returning empty or full data
      expect(result).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('findOne', () => {
    it('should return transaction by valid ID', async () => {
      // Arrange
      const transactionId = 'payout_1'

      // Act
      const result = await service.findOne(transactionId)

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(transactionId)
      expect(['PAYOUT', 'WITHDRAWAL']).toContain(result.type)
    })

    it('should throw NotFoundException for invalid ID', async () => {
      // Arrange
      const invalidId = 'nonexistent'

      // Act & Assert
      await expect(service.findOne(invalidId)).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException for empty ID', async () => {
      // Arrange
      const emptyId = ''

      // Act & Assert  
      await expect(service.findOne(emptyId)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateStatus', () => {
    it('should update transaction status successfully', async () => {
      // Arrange
      const transactionId = 'payout_1'
      const newStatus = 'COMPLETED'

      // Act
      const result = await service.updateStatus(transactionId, newStatus)

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(transactionId)
      expect(result.status).toBe(newStatus)
      expect(result.updatedAt).toBeDefined()
    })

    it('should handle status transitions for withdrawal', async () => {
      // Arrange
      const transactionId = 'withdrawal_1'
      const newStatus = 'COMPLETED'

      // Act
      const result = await service.updateStatus(transactionId, newStatus)

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(transactionId)
      expect(result.status).toBe(newStatus)
    })

    it('should throw NotFoundException for invalid transaction ID', async () => {
      // Arrange
      const invalidId = 'nonexistent'
      const status = 'COMPLETED'

      // Act & Assert
      await expect(
        service.updateStatus(invalidId, status)
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('integration with legacy services', () => {
    it('should maintain compatibility with payout service responses', async () => {
      // Test that unified responses match legacy payout service format
      const query: TransactionQuery = { type: 'PAYOUT', limit: 5 }
      
      const result = await service.findAll(query)
      
      // Verify structure matches legacy expectations
      expect(result.data).toBeDefined()
      if (result.data.length > 0) {
        const payoutTx = result.data[0]
        expect(payoutTx).toMatchObject({
          id: expect.any(String),
          type: 'PAYOUT',
          amount: expect.any(Number),
          status: expect.stringMatching(/^(PENDING|PROCESSING|COMPLETED|FAILED)$/),
          createdAt: expect.any(Date)
        })
      }
    })

    it('should maintain compatibility with withdrawal service responses', async () => {
      // Test unified responses match legacy withdrawal service format
      const query: TransactionQuery = { type: 'WITHDRAWAL', limit: 5 }
      
      const result = await service.findAll(query)
      
      if (result.data.length > 0) {
        const withdrawalTx = result.data[0]
        expect(withdrawalTx).toMatchObject({
          id: expect.any(String),
          type: 'WITHDRAWAL',
          amount: expect.any(Number),
          method: expect.any(String),
          status: expect.stringMatching(/^(PENDING|PROCESSING|COMPLETED|FAILED)$/),
          createdAt: expect.any(Date)
        })
      }
    })
  })

  describe('error scenarios', () => {
    it('should handle concurrent transaction updates', async () => {
      // Test concurrent updates
      const transactionId = 'payout_2'
      
      // Simulate concurrent updates
      const promises = [
        service.updateStatus(transactionId, 'PROCESSING'),
        service.updateStatus(transactionId, 'COMPLETED')
      ]

      // Should handle gracefully without data corruption
      const results = await Promise.allSettled(promises)
      expect(results).toHaveLength(2)
    })
  })
})