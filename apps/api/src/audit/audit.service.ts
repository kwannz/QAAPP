import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuditLog, Prisma } from '@qa-app/database';

export interface CreateAuditLogDto {
  actorId?: string;
  actorType?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export interface AuditLogQueryDto {
  actorId?: string;
  action?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(private database: DatabaseService) {}

  async createAuditLog(data: CreateAuditLogDto): Promise<AuditLog> {
    return this.database.auditLog.create({
      data: {
        actorId: data.actorId,
        actorType: data.actorType || 'USER',
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata,
      },
    });
  }

  async getAuditLogs(query: AuditLogQueryDto): Promise<{ logs: AuditLog[], pagination: any }> {
    const {
      actorId,
      action,
      resourceType,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = query;

    const where: any = {};
    
    if (actorId) where.actorId = actorId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resourceType) where.resourceType = resourceType;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.database.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.database.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditLogById(id: string): Promise<AuditLog | null> {
    return this.database.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getAuditStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalLogs,
      actionStats,
      actorTypeStats,
      recentActivity,
    ] = await Promise.all([
      this.database.auditLog.count({ where }),
      this.database.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      this.database.auditLog.groupBy({
        by: ['actorType'],
        where,
        _count: true,
      }),
      this.database.auditLog.findMany({
        where: {
          ...where,
          createdAt: {
            ...where.createdAt,
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 最近24小时
          },
        },
        select: {
          action: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    return {
      totalLogs,
      topActions: actionStats.map(stat => ({
        action: stat.action,
        count: stat._count,
      })),
      actorTypeDistribution: actorTypeStats.reduce((acc, stat) => {
        acc[stat.actorType] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      recentActivity: recentActivity.length,
    };
  }
}