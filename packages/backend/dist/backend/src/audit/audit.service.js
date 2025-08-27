"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@qa-app/database");
let AuditService = class AuditService {
    async log(data) {
        try {
            await database_1.prisma.auditLog.create({
                data: (0, database_1.createAuditLog)(data),
            });
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
    async logMany(logs) {
        try {
            await database_1.prisma.auditLog.createMany({
                data: logs.map(log => (0, database_1.createAuditLog)(log)),
            });
        }
        catch (error) {
            console.error('Failed to create audit logs:', error);
        }
    }
    async findMany(options) {
        const { skip, take, page, limit } = (0, database_1.createPaginationQuery)(options);
        try {
            const where = {};
            if (options.actorId) {
                where.actorId = options.actorId;
            }
            if (options.actorType) {
                where.actorType = options.actorType;
            }
            if (options.action) {
                where.action = options.action;
            }
            if (options.resourceType) {
                where.resourceType = options.resourceType;
            }
            if (options.resourceId) {
                where.resourceId = options.resourceId;
            }
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
                database_1.prisma.auditLog.findMany({
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
                database_1.prisma.auditLog.count({ where }),
            ]);
            return (0, database_1.createPaginatedResult)(logs, total, page, limit);
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async getUserAuditLogs(userId, options) {
        return this.findMany({
            ...options,
            actorId: userId,
        });
    }
    async getResourceAuditLogs(resourceType, resourceId, options) {
        return this.findMany({
            ...options,
            resourceType,
            resourceId,
        });
    }
    async getActionStats(startDate, endDate) {
        try {
            const where = {};
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = startDate;
                if (endDate)
                    where.createdAt.lte = endDate;
            }
            const stats = await database_1.prisma.auditLog.groupBy({
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
            }, {});
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async getUserActivityStats(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const logs = await database_1.prisma.auditLog.findMany({
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
            const dateMap = new Map();
            logs.forEach(log => {
                const date = log.createdAt.toISOString().split('T')[0];
                dateMap.set(date, (dateMap.get(date) || 0) + 1);
            });
            const result = [];
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
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
    async detectAnomalousActivity(userId, timeWindowHours = 1) {
        try {
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - timeWindowHours);
            const recentLogs = await database_1.prisma.auditLog.findMany({
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
            const threshold = 100;
            const sensitiveActions = ['LOGIN_FAILURE', 'PASSWORD_CHANGE', 'USER_LOGOUT'];
            const sensitiveCount = recentLogs.filter(log => sensitiveActions.includes(log.action)).length;
            const isAnomalous = activityCount > threshold || sensitiveCount > 10;
            return {
                isAnomalous,
                activityCount,
                threshold,
                actions,
            };
        }
        catch (error) {
            console.error('Failed to detect anomalous activity:', error);
            return {
                isAnomalous: false,
                activityCount: 0,
                threshold: 100,
                actions: [],
            };
        }
    }
    async cleanupOldLogs(daysToKeep = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            const result = await database_1.prisma.auditLog.deleteMany({
                where: {
                    createdAt: {
                        lt: cutoffDate,
                    },
                },
            });
            return result.count;
        }
        catch (error) {
            console.error('Failed to cleanup old audit logs:', error);
            return 0;
        }
    }
    async exportLogs(options) {
        try {
            const where = {};
            if (options.startDate || options.endDate) {
                where.createdAt = {};
                if (options.startDate)
                    where.createdAt.gte = options.startDate;
                if (options.endDate)
                    where.createdAt.lte = options.endDate;
            }
            if (options.actorId) {
                where.actorId = options.actorId;
            }
            if (options.resourceType) {
                where.resourceType = options.resourceType;
            }
            const logs = await database_1.prisma.auditLog.findMany({
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
        }
        catch (error) {
            (0, database_1.handleDatabaseError)(error);
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)()
], AuditService);
//# sourceMappingURL=audit.service.js.map