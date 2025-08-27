import { Injectable } from '@nestjs/common';
import { 
  prisma, 
  createPaginationQuery, 
  createPaginatedResult,
  PaginationOptions,
  PaginatedResult,
  handleDatabaseError,
  createAuditLog,
  AuditLogData 
} from '@qa-app/database';

@Injectable()
export class AuditService {
  // 记录审计日志
  async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: createAuditLog(data),
      });
    } catch (error) {
      // 审计日志记录失败不应该影响主业务流程，只记录错误
      console.error('Failed to create audit log:', error);
    }
  }

  // 批量记录审计日志
  async logMany(logs: AuditLogData[]): Promise<void> {
    try {
      await prisma.auditLog.createMany({
        data: logs.map(log => createAuditLog(log)),
      });
    } catch (error) {
      console.error('Failed to create audit logs:', error);
    }
  }

  // 查询审计日志
  async findMany(options: PaginationOptions & {
    actorId?: string;
    actorType?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PaginatedResult<any>> {
    const { skip, take, page, limit } = createPaginationQuery(options);

    try {
      const where: any = {};

      // 参与者筛选
      if (options.actorId) {
        where.actorId = options.actorId;
      }

      if (options.actorType) {
        where.actorType = options.actorType;
      }

      // 操作类型筛选
      if (options.action) {
        where.action = options.action;
      }

      // 资源类型筛选
      if (options.resourceType) {
        where.resourceType = options.resourceType;
      }

      if (options.resourceId) {
        where.resourceId = options.resourceId;
      }

      // 时间范围筛选
      if (options.startDate || options.endDate) {
        where.createdAt = {};
        if (options.startDate) {
          where.createdAt.gte = options.startDate;
        }
        if (options.endDate) {
          where.createdAt.lte = options.endDate;
        }
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            actor: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      return createPaginatedResult(logs, total, page, limit);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 获取用户操作历史
  async getUserAuditLogs(userId: string, options: PaginationOptions): Promise<PaginatedResult<any>> {
    return this.findMany({
      ...options,
      actorId: userId,
    });
  }

  // 获取资源操作历史
  async getResourceAuditLogs(
    resourceType: string, 
    resourceId: string, 
    options: PaginationOptions
  ): Promise<PaginatedResult<any>> {
    return this.findMany({
      ...options,
      resourceType,
      resourceId,
    });
  }

  // 获取操作类型统计
  async getActionStats(
    startDate?: Date, 
    endDate?: Date
  ): Promise<Record<string, number>> {
    try {
      const where: any = {};

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const stats = await prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: {
          action: true,
        },
        orderBy: {
          _count: {
            action: 'desc',
          },
        },
      });

      return stats.reduce((acc, stat) => {
        acc[stat.action] = stat._count.action;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 获取用户活动统计
  async getUserActivityStats(
    userId: string,
    days: number = 30
  ): Promise<Array<{ date: string; count: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await prisma.auditLog.findMany({
        where: {
          actorId: userId,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true,
        },
      });

      // 按日期分组统计
      const dateMap = new Map<string, number>();
      
      logs.forEach(log => {
        const date = log.createdAt.toISOString().split('T')[0];
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      });

      // 填充缺失的日期
      const result: Array<{ date: string; count: number }> = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          count: dateMap.get(dateStr) || 0,
        });
      }

      return result;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // 检测异常活动
  async detectAnomalousActivity(
    userId: string,
    timeWindowHours: number = 1
  ): Promise<{
    isAnomalous: boolean;
    activityCount: number;
    threshold: number;
    actions: string[];
  }> {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - timeWindowHours);

      const recentLogs = await prisma.auditLog.findMany({
        where: {
          actorId: userId,
          createdAt: {
            gte: startTime,
          },
        },
        select: {
          action: true,
        },
      });

      const activityCount = recentLogs.length;
      const actions = [...new Set(recentLogs.map(log => log.action))];
      
      // 简单的异常检测规则：
      // 1小时内超过100次操作
      // 或者短时间内涉及敏感操作（如大量登录失败、密码修改等）
      const threshold = 100;
      const sensitiveActions = ['LOGIN_FAILURE', 'PASSWORD_CHANGE', 'USER_LOGOUT'];
      const sensitiveCount = recentLogs.filter(log => 
        sensitiveActions.includes(log.action)
      ).length;

      const isAnomalous = activityCount > threshold || sensitiveCount > 10;

      return {
        isAnomalous,
        activityCount,
        threshold,
        actions,
      };
    } catch (error) {
      console.error('Failed to detect anomalous activity:', error);
      return {
        isAnomalous: false,
        activityCount: 0,
        threshold: 100,
        actions: [],
      };
    }
  }

  // 清理过期日志
  async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      return result.count;
    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error);
      return 0;
    }
  }

  // 导出审计日志
  async exportLogs(options: {
    startDate?: Date;
    endDate?: Date;
    actorId?: string;
    resourceType?: string;
    format: 'json' | 'csv';
  }): Promise<any> {
    try {
      const where: any = {};

      if (options.startDate || options.endDate) {
        where.createdAt = {};
        if (options.startDate) where.createdAt.gte = options.startDate;
        if (options.endDate) where.createdAt.lte = options.endDate;
      }

      if (options.actorId) {
        where.actorId = options.actorId;
      }

      if (options.resourceType) {
        where.resourceType = options.resourceType;
      }

      const logs = await prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (options.format === 'csv') {
        // 简化的CSV格式转换
        const headers = [
          'timestamp',
          'actor_email',
          'actor_role',
          'action',
          'resource_type',
          'resource_id',
          'ip_address',
        ].join(',');

        const rows = logs.map(log => [
          log.createdAt.toISOString(),
          log.actor?.email || '',
          log.actor?.role || log.actorType,
          log.action,
          log.resourceType || '',
          log.resourceId || '',
          log.ipAddress || '',
        ].join(','));

        return [headers, ...rows].join('\n');
      }

      return logs;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}