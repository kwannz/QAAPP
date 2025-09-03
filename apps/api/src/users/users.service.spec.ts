import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../cache/cache.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let databaseService: jest.Mocked<DatabaseService>;
  let cacheService: jest.Mocked<CacheService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    kycStatus: 'PENDING',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            wallet: {
              findFirst: jest.fn(),
              create: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
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

    service = module.get<UsersService>(UsersService);
    databaseService = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
    cacheService = module.get(CacheService) as jest.Mocked<CacheService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('should return null if user not found', async () => {
      databaseService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: expect.any(Object),
      });
    });

    it('should use cache when available', async () => {
      cacheService.get.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(databaseService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should cache user data when fetched from database', async () => {
      cacheService.get.mockResolvedValue(null);
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      await service.findByEmail('test@example.com');

      expect(cacheService.set).toHaveBeenCalledWith(
        `user:email:test@example.com`,
        mockUser,
        300
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [mockUser];
      databaseService.user.findMany.mockResolvedValue(mockUsers);
      databaseService.user.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        users: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters correctly', async () => {
      databaseService.user.findMany.mockResolvedValue([]);
      databaseService.user.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        role: 'ADMIN',
        isActive: true,
        search: 'test',
      });

      expect(databaseService.user.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          role: 'ADMIN',
          isActive: true,
          OR: expect.arrayContaining([
            { email: { contains: 'test', mode: 'insensitive' } },
            { name: { contains: 'test', mode: 'insensitive' } },
          ]),
        }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.user.update.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      const result = await service.update('1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(cacheService.invalidate).toHaveBeenCalledWith('user:*');
    });

    it('should throw NotFoundException if user not found', async () => {
      databaseService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('999', { name: 'Updated' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if email already exists', async () => {
      databaseService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ id: '2', email: 'existing@example.com' });

      await expect(
        service.update('1', { email: 'existing@example.com' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addWallet', () => {
    it('should add wallet successfully', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.wallet.findFirst.mockResolvedValue(null);
      databaseService.wallet.create.mockResolvedValue({
        id: '1',
        address: '0x123',
        isPrimary: true,
        userId: '1',
      });

      const result = await service.addWallet('1', '0x123');

      expect(result).toHaveProperty('address', '0x123');
    });

    it('should throw BadRequestException if wallet already exists', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.wallet.findFirst.mockResolvedValue({
        id: '1',
        address: '0x123',
      });

      await expect(
        service.addWallet('1', '0x123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should set new wallet as primary if first wallet', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.wallet.findFirst.mockResolvedValue(null);
      
      await service.addWallet('1', '0x123');

      expect(databaseService.wallet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isPrimary: true,
        }),
      });
    });
  });

  describe('removeWallet', () => {
    it('should remove wallet successfully', async () => {
      databaseService.wallet.findFirst.mockResolvedValue({
        id: 'w1',
        address: '0x123',
        userId: '1',
      });

      await service.removeWallet('1', '0x123');

      expect(databaseService.wallet.delete).toHaveBeenCalledWith({
        where: { id: 'w1' },
      });
    });

    it('should throw NotFoundException if wallet not found', async () => {
      databaseService.wallet.findFirst.mockResolvedValue(null);

      await expect(
        service.removeWallet('1', '0x999')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateKycStatus', () => {
    it('should update KYC status successfully', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.user.update.mockResolvedValue({
        ...mockUser,
        kycStatus: 'APPROVED',
      });

      const result = await service.updateKycStatus('1', 'APPROVED', {
        verifiedAt: new Date(),
      });

      expect(result.kycStatus).toBe('APPROVED');
    });

    it('should log audit entry', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.user.update.mockResolvedValue({
        ...mockUser,
        kycStatus: 'APPROVED',
      });

      await service.updateKycStatus('1', 'APPROVED', {
        verifiedAt: new Date(),
      });

      expect(databaseService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.user.update.mockResolvedValue({
        ...mockUser,
        role: 'ADMIN',
      });

      const result = await service.updateRole('1', 'ADMIN');

      expect(result.role).toBe('ADMIN');
    });

    it('should invalidate cache after role update', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.user.update.mockResolvedValue({
        ...mockUser,
        role: 'ADMIN',
      });

      await service.updateRole('1', 'ADMIN');

      expect(cacheService.invalidate).toHaveBeenCalledWith('user:*');
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle user status', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);
      databaseService.user.update.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await service.toggleUserStatus('1');

      expect(result.isActive).toBe(false);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      databaseService.user.count.mockImplementation((args) => {
        if (!args) return Promise.resolve(100);
        if (args.where?.isActive === true) return Promise.resolve(80);
        if (args.where?.kycStatus === 'APPROVED') return Promise.resolve(60);
        if (args.where?.kycStatus === 'PENDING') return Promise.resolve(20);
        if (args.where?.kycStatus === 'REJECTED') return Promise.resolve(10);
        return Promise.resolve(0);
      });

      databaseService.user.groupBy.mockResolvedValue([
        { role: 'USER', _count: { role: 70 } },
        { role: 'ADMIN', _count: { role: 10 } },
      ]);

      const result = await service.getUserStats();

      expect(result).toEqual({
        total: 100,
        active: 80,
        inactive: 20,
        kycApproved: 60,
        kycPending: 20,
        kycRejected: 10,
        roleDistribution: {
          USER: 70,
          ADMIN: 10,
        },
        kycDistribution: {
          APPROVED: 60,
          PENDING: 20,
          REJECTED: 10,
        },
        growthRate: 0,
      });
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      databaseService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.searchUsers('test');

      expect(databaseService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'test', mode: 'insensitive' } },
            { name: { contains: 'test', mode: 'insensitive' } },
            { phone: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        take: 10,
        include: expect.any(Object),
      });
      expect(result).toEqual([mockUser]);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should bulk update user status', async () => {
      databaseService.user.update.mockResolvedValue(mockUser);

      await service.bulkUpdateStatus(['1', '2'], true);

      expect(databaseService.user.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('exportUsers', () => {
    it('should export users in CSV format', async () => {
      databaseService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.exportUsers('csv');

      expect(result).toContain('email,name,role');
      expect(result).toContain('test@example.com');
    });

    it('should export users in JSON format', async () => {
      databaseService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.exportUsers('json');

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].email).toBe('test@example.com');
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity', async () => {
      const mockActivity = [
        {
          id: '1',
          action: 'LOGIN',
          timestamp: new Date(),
          metadata: {},
        },
      ];

      // Mock activity retrieval (would need to add to database service)
      const result = await service.getUserActivity('1');

      expect(result).toBeDefined();
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions based on role', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserPermissions('1');

      expect(result).toContain('read:profile');
      expect(result).toContain('update:profile');
    });

    it('should return admin permissions for admin role', async () => {
      databaseService.user.findUnique.mockResolvedValue({
        ...mockUser,
        role: 'ADMIN',
      });

      const result = await service.getUserPermissions('1');

      expect(result).toContain('admin:users');
      expect(result).toContain('admin:settings');
    });
  });
});