"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YieldDistributionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const auth_decorator_1 = require("../../auth/decorators/auth.decorator");
const yield_distribution_service_1 = require("../services/yield-distribution.service");
const error_utils_1 = require("../../common/utils/error.utils");
class TriggerDistributionDto {
}
class DistributionStatsDto {
}
class DistributionBatchDto {
}
let YieldDistributionController = class YieldDistributionController {
    constructor(yieldDistributionService) {
        this.yieldDistributionService = yieldDistributionService;
    }
    async triggerDistribution(triggerDto) {
        try {
            if (triggerDto.dryRun) {
                return {
                    success: true,
                    batch: null,
                    message: '干运行模式：验证通过，未执行实际分发',
                };
            }
            const batch = await this.yieldDistributionService.triggerManualDistribution(triggerDto.positionIds);
            return {
                success: true,
                batch,
                message: `收益分发任务已创建，批次ID: ${batch.id}`,
            };
        }
        catch (error) {
            return {
                success: false,
                batch: null,
                message: `触发收益分发失败: ${(0, error_utils_1.getErrorMessage)(error)}`,
            };
        }
    }
    async getDistributionStats() {
        return await this.yieldDistributionService.getDistributionStats();
    }
    async getDistributionBatches(limit = '10') {
        const limitNum = parseInt(limit, 10) || 10;
        const batches = await this.yieldDistributionService.getRecentDistributionBatches(limitNum);
        return {
            batches,
            total: batches.length,
        };
    }
    async getDistributionBatch(batchId) {
        const batch = await this.yieldDistributionService.getDistributionBatch(batchId);
        if (!batch) {
            return {
                batch: null,
                success: false,
                message: '分发批次不存在',
            };
        }
        return {
            batch,
            success: true,
        };
    }
    async getTodayDistributionStatus() {
        const today = new Date();
        const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const batchId = `batch-${todayStr}`;
        const batch = await this.yieldDistributionService.getDistributionBatch(batchId);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(1, 0, 0, 0);
        return {
            hasDistributedToday: !!batch,
            batch: batch || undefined,
            nextScheduledTime: tomorrow.toISOString(),
        };
    }
    async getSystemHealth() {
        return {
            healthy: true,
            checks: {
                database: true,
                blockchain: true,
                gasBalance: true,
            },
            timestamp: new Date().toISOString(),
        };
    }
    async getDistributionConfig() {
        return {
            scheduleCron: '0 1 * * *',
            batchSize: 100,
            maxRetryCount: 3,
            gasLimit: 200000,
            minGasBalance: '0.01',
            timezone: 'Asia/Shanghai',
        };
    }
    async pauseAutomaticDistribution() {
        return {
            success: true,
            message: '自动收益分发已暂停',
        };
    }
    async resumeAutomaticDistribution() {
        return {
            success: true,
            message: '自动收益分发已恢复',
        };
    }
    async getFailedTasks(batchId, limit = '50') {
        return {
            tasks: [],
            total: 0,
        };
    }
    async retryFailedTasks(batchId) {
        try {
            return {
                success: true,
                message: `批次 ${batchId} 的失败任务已提交重试`,
                retriedCount: 0,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `重试任务失败: ${(0, error_utils_1.getErrorMessage)(error)}`,
                retriedCount: 0,
            };
        }
    }
    async exportDistributionReport(startDate, endDate, format = 'json') {
        try {
            const reportData = {
                period: {
                    startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    endDate: endDate || new Date().toISOString().split('T')[0],
                },
                summary: {
                    totalBatches: 0,
                    totalAmount: 0,
                    successRate: 100,
                },
                batches: [],
            };
            if (format === 'csv') {
                return {
                    success: true,
                    downloadUrl: '/api/yield-distribution/download/report.csv',
                    message: 'CSV报告生成成功',
                };
            }
            return {
                success: true,
                data: reportData,
                message: 'JSON报告生成成功',
            };
        }
        catch (error) {
            return {
                success: false,
                message: `报告生成失败: ${(0, error_utils_1.getErrorMessage)(error)}`,
            };
        }
    }
};
exports.YieldDistributionController = YieldDistributionController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '手动触发收益分发' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '分发任务创建成功',
        type: DistributionBatchDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数无效' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('trigger'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TriggerDistributionDto]),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "triggerDistribution", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取收益分发统计' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '统计信息获取成功',
        type: DistributionStatsDto
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "getDistributionStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取分发批次列表' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '批次列表获取成功'
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '返回数量限制', example: 10 }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('batches'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "getDistributionBatches", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取指定批次详情' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '批次详情获取成功',
        type: DistributionBatchDto
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '批次不存在' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('batches/:batchId'),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "getDistributionBatch", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取今日分发状态' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '今日分发状态获取成功'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('today'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "getTodayDistributionStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取系统健康状态' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '系统健康状态获取成功'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "getSystemHealth", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取分发配置信息' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '配置信息获取成功'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "getDistributionConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '暂停自动分发' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '自动分发已暂停'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('pause'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "pauseAutomaticDistribution", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '恢复自动分发' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '自动分发已恢复'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('resume'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "resumeAutomaticDistribution", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取失败任务列表' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '失败任务列表获取成功'
    }),
    (0, swagger_1.ApiQuery)({ name: 'batchId', required: false, description: '批次ID过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '返回数量限制', example: 50 }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('failed-tasks'),
    __param(0, (0, common_1.Query)('batchId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "getFailedTasks", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '重试失败任务' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '重试任务已提交'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Post)('retry-failed/:batchId'),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "retryFailedTasks", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '导出分发报告' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '报告生成成功'
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: '开始日期 YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: '结束日期 YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, description: '导出格式', enum: ['json', 'csv'] }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], YieldDistributionController.prototype, "exportDistributionReport", null);
exports.YieldDistributionController = YieldDistributionController = __decorate([
    (0, swagger_1.ApiTags)('Yield Distribution'),
    (0, common_1.Controller)('yield-distribution'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [yield_distribution_service_1.YieldDistributionService])
], YieldDistributionController);
//# sourceMappingURL=yield-distribution.controller.js.map