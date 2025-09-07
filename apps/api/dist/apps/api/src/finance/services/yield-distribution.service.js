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
var YieldDistributionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YieldDistributionService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const payouts_service_1 = require("./payouts.service");
const positions_service_1 = require("./positions.service");
const mapping_interface_1 = require("../interfaces/mapping.interface");
const database_service_1 = require("../../database/database.service");
const error_utils_1 = require("../../common/utils/error.utils");
let YieldDistributionService = YieldDistributionService_1 = class YieldDistributionService {
    constructor(payoutsService, positionsService, database) {
        this.payoutsService = payoutsService;
        this.positionsService = positionsService;
        this.database = database;
        this.logger = new common_1.Logger(YieldDistributionService_1.name);
        this.distributionTasks = new Map();
        this.distributionBatches = new Map();
        this.maxRetryCount = 3;
        this.batchSize = 100;
        this.gasLimit = 200000;
        this.minGasBalance = '0.01';
    }
    async onModuleInit() {
        this.logger.log('收益分发自动化系统启动');
        await this.recoverPendingTasks();
        this.startHealthMonitoring();
    }
    async onModuleDestroy() {
        this.logger.log('Cleaning up Yield Distribution Service...');
        if (this.healthMonitoringIntervalId) {
            clearInterval(this.healthMonitoringIntervalId);
        }
        if (this.batchProcessingIntervalId) {
            clearInterval(this.batchProcessingIntervalId);
        }
        this.logger.log('Yield Distribution Service cleanup completed');
    }
    async scheduleDailyYieldDistribution() {
        this.logger.log('开始执行每日收益分发任务');
        try {
            const today = new Date();
            const batchId = `batch-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
            const batch = await this.createDistributionBatch(batchId, today);
            const activePositions = await this.positionsService.getActivePositions();
            if (activePositions.length === 0) {
                this.logger.log('没有活跃持仓需要分发收益');
                batch.status = 'COMPLETED';
                batch.completedAt = new Date();
                return;
            }
            this.logger.log(`发现 ${activePositions.length} 个活跃持仓需要分发收益`);
            const tasks = await this.createDistributionTasks(activePositions, batch.id);
            batch.tasks = tasks;
            batch.totalPositions = tasks.length;
            await this.executeBatchDistribution(batch);
            this.logger.log(`每日收益分发完成，成功: ${batch.completedTasks}，失败: ${batch.failedTasks}`);
        }
        catch (error) {
            this.logger.error('每日收益分发失败:', error);
            await this.sendAlert('DAILY_DISTRIBUTION_FAILED', (0, error_utils_1.getErrorMessage)(error));
        }
    }
    async triggerManualDistribution(positionIds) {
        this.logger.log('开始手动收益分发');
        try {
            const batchId = `manual-${Date.now()}`;
            const batch = await this.createDistributionBatch(batchId, new Date());
            let positions;
            if (positionIds && positionIds.length > 0) {
                positions = [];
                for (const positionId of positionIds) {
                    try {
                        const position = await this.positionsService.getPosition(positionId);
                        if (position.status === 'ACTIVE') {
                            positions.push(position);
                        }
                    }
                    catch (error) {
                        this.logger.warn(`持仓 ${positionId} 不存在或不活跃`);
                    }
                }
            }
            else {
                positions = await this.positionsService.getActivePositions();
            }
            if (positions.length === 0) {
                batch.status = 'COMPLETED';
                batch.completedAt = new Date();
                this.logger.log('没有符合条件的持仓需要分发收益');
                return batch;
            }
            const tasks = await this.createDistributionTasks(positions, batch.id);
            batch.tasks = tasks;
            batch.totalPositions = tasks.length;
            await this.executeBatchDistribution(batch);
            this.logger.log(`手动收益分发完成，成功: ${batch.completedTasks}，失败: ${batch.failedTasks}`);
            return batch;
        }
        catch (error) {
            this.logger.error('手动收益分发失败:', error);
            throw error;
        }
    }
    async createDistributionBatch(batchId, date) {
        const batch = {
            id: batchId,
            date,
            totalAmount: 0,
            totalPositions: 0,
            completedTasks: 0,
            failedTasks: 0,
            status: 'PROCESSING',
            startedAt: new Date(),
            tasks: [],
        };
        this.distributionBatches.set(batchId, batch);
        this.logger.log(`创建收益分发批次: ${batchId}`);
        return batch;
    }
    async createDistributionTasks(positions, batchId) {
        const tasks = [];
        for (const position of positions) {
            try {
                const dailyYield = await this.calculateDailyYield(position);
                if (dailyYield <= 0) {
                    this.logger.warn(`持仓 ${position.id} 每日收益为0，跳过`);
                    continue;
                }
                const taskId = `task-${position.id}-${Date.now()}`;
                const task = {
                    id: taskId,
                    positionId: position.id,
                    userId: position.userId,
                    amount: dailyYield,
                    scheduledAt: new Date(),
                    status: 'PENDING',
                    retryCount: 0,
                    createdAt: new Date(),
                };
                tasks.push(task);
                this.distributionTasks.set(taskId, task);
                this.logger.debug(`创建收益分发任务: ${taskId}，金额: ${dailyYield.toFixed(6)} USDT`);
            }
            catch (error) {
                this.logger.error(`为持仓 ${position.id} 创建分发任务失败:`, error);
            }
        }
        this.logger.log(`创建了 ${tasks.length} 个收益分发任务`);
        return tasks;
    }
    async executeBatchDistribution(batch) {
        this.logger.log(`开始执行批次 ${batch.id} 的收益分发，共 ${batch.tasks.length} 个任务`);
        const systemHealthy = await this.checkSystemHealth();
        if (!systemHealthy) {
            throw new Error('系统状态不健康，暂停收益分发');
        }
        let completedCount = 0;
        let failedCount = 0;
        let totalAmount = 0;
        const batches = this.chunkArray(batch.tasks, this.batchSize);
        for (let i = 0; i < batches.length; i++) {
            const taskBatch = batches[i];
            this.logger.log(`处理第 ${i + 1}/${batches.length} 批任务，共 ${taskBatch.length} 个任务`);
            const batchPromises = taskBatch.map(task => this.executeDistributionTask(task));
            const batchResults = await Promise.allSettled(batchPromises);
            batchResults.forEach((result, index) => {
                const task = taskBatch[index];
                if (result.status === 'fulfilled' && result.value) {
                    completedCount++;
                    totalAmount += task.amount;
                }
                else {
                    failedCount++;
                    this.logger.error(`任务 ${task.id} 执行失败:`, result.status === 'rejected' ? result.reason : '未知错误');
                }
            });
            if (i < batches.length - 1) {
                await this.delay(2000);
            }
        }
        batch.completedTasks = completedCount;
        batch.failedTasks = failedCount;
        batch.totalAmount = totalAmount;
        batch.status = failedCount > 0 ? 'FAILED' : 'COMPLETED';
        batch.completedAt = new Date();
        this.logger.log(`批次 ${batch.id} 执行完成：成功 ${completedCount}，失败 ${failedCount}，总金额 ${totalAmount.toFixed(2)} USDT`);
        if (failedCount > 0) {
            await this.scheduleRetryTasks(batch.id);
        }
    }
    async executeDistributionTask(task) {
        try {
            task.status = 'PROCESSING';
            this.distributionTasks.set(task.id, task);
            this.logger.debug(`执行收益分发任务: ${task.id}，用户: ${task.userId}，金额: ${task.amount.toFixed(6)}`);
            const payout = await this.createPayoutRecord(task);
            const txHash = await this.executeOnChainTransfer(task);
            await this.positionsService.recordPayoutPayment(task.positionId, task.amount);
            task.status = 'COMPLETED';
            task.executedAt = new Date();
            task.txHash = txHash;
            this.distributionTasks.set(task.id, task);
            this.logger.debug(`任务 ${task.id} 执行成功，交易哈希: ${txHash}`);
            return true;
        }
        catch (error) {
            task.status = 'FAILED';
            task.failureReason = (0, error_utils_1.getErrorMessage)(error);
            task.retryCount++;
            this.distributionTasks.set(task.id, task);
            this.logger.error(`任务 ${task.id} 执行失败 (重试 ${task.retryCount}/${this.maxRetryCount}):`, error);
            return false;
        }
    }
    async calculateDailyYield(position) {
        const product = await this.database.product.findUnique({
            where: { id: position.productId },
            select: { aprBps: true, name: true }
        });
        if (!product) {
            throw new Error(`产品 ${position.productId} 信息不存在`);
        }
        const annualRate = product.aprBps / 10000;
        const dailyRate = annualRate / 365;
        const dailyYield = position.principal * dailyRate;
        this.logger.debug(`持仓 ${position.id} 每日收益: ${dailyYield.toFixed(6)} USDT (本金: ${position.principal}, APR: ${product.aprBps}bps)`);
        return dailyYield;
    }
    async createPayoutRecord(task) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
        const existingPayout = await this.database.payout.findFirst({
            where: {
                positionId: task.positionId,
                userId: task.userId,
                periodStart: {
                    gte: todayStart,
                    lt: todayEnd
                }
            }
        });
        if (existingPayout) {
            this.logger.debug(`收益记录已存在: ${existingPayout.id}`);
            return mapping_interface_1.FinanceMappingUtils.mapDatabasePayoutToMock({
                id: existingPayout.id,
                userId: existingPayout.userId,
                positionId: existingPayout.positionId,
                amount: Number(existingPayout.amount),
                periodStart: existingPayout.periodStart,
                periodEnd: existingPayout.periodEnd,
                status: existingPayout.claimedAt ? 'CLAIMED' : 'PENDING',
                isClaimable: existingPayout.isClaimable,
                claimedAt: existingPayout.claimedAt,
                txHash: existingPayout.claimTxHash,
                createdAt: existingPayout.createdAt,
                updatedAt: existingPayout.updatedAt
            });
        }
        const createdPayout = await this.database.payout.create({
            data: {
                userId: task.userId,
                positionId: task.positionId,
                amount: task.amount,
                periodStart: todayStart,
                periodEnd: todayEnd,
                isClaimable: true
            }
        });
        this.logger.debug(`创建收益记录: ${createdPayout.id}`);
        return mapping_interface_1.FinanceMappingUtils.mapDatabasePayoutToMock({
            id: createdPayout.id,
            userId: createdPayout.userId,
            positionId: createdPayout.positionId,
            amount: Number(createdPayout.amount),
            periodStart: createdPayout.periodStart,
            periodEnd: createdPayout.periodEnd,
            status: 'PENDING',
            isClaimable: createdPayout.isClaimable,
            claimedAt: createdPayout.claimedAt,
            txHash: createdPayout.claimTxHash,
            createdAt: createdPayout.createdAt,
            updatedAt: createdPayout.updatedAt
        });
    }
    async executeOnChainTransfer(task) {
        try {
            await this.delay(1000 + Math.random() * 2000);
            const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
            this.logger.debug(`模拟链上转账成功: ${mockTxHash}，金额: ${task.amount.toFixed(6)} USDT`);
            return mockTxHash;
        }
        catch (error) {
            this.logger.error('链上转账失败:', error);
            throw new Error(`链上转账失败: ${(0, error_utils_1.getErrorMessage)(error)}`);
        }
    }
    async checkSystemHealth() {
        try {
            const chainHealthy = await this.checkChainHealth();
            if (!chainHealthy) {
                this.logger.warn('区块链连接不健康');
                return false;
            }
            const gasBalance = await this.checkGasBalance();
            if (!gasBalance) {
                this.logger.warn('Gas余额不足');
                return false;
            }
            const dbHealthy = await this.checkDatabaseHealth();
            if (!dbHealthy) {
                this.logger.warn('数据库连接不健康');
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error('系统健康检查失败:', error);
            return false;
        }
    }
    async checkChainHealth() {
        try {
            return true;
        }
        catch (error) {
            this.logger.error('区块链健康检查失败:', error);
            return false;
        }
    }
    async checkGasBalance() {
        try {
            return true;
        }
        catch (error) {
            this.logger.error('Gas余额检查失败:', error);
            return false;
        }
    }
    async checkDatabaseHealth() {
        try {
            const healthResult = await this.database.healthCheck();
            return healthResult.status === 'healthy';
        }
        catch (error) {
            this.logger.error('数据库健康检查失败:', error);
            return false;
        }
    }
    async scheduleRetryTasks(batchId) {
        const batch = this.distributionBatches.get(batchId);
        if (!batch)
            return;
        const failedTasks = batch.tasks.filter(task => task.status === 'FAILED' && task.retryCount < this.maxRetryCount);
        if (failedTasks.length === 0) {
            this.logger.log(`批次 ${batchId} 没有需要重试的任务`);
            return;
        }
        this.logger.log(`批次 ${batchId} 有 ${failedTasks.length} 个任务需要重试`);
        setTimeout(async () => {
            for (const task of failedTasks) {
                task.status = 'PENDING';
                await this.executeDistributionTask(task);
            }
        }, 5 * 60 * 1000);
    }
    async recoverPendingTasks() {
        try {
            const pendingBatches = await this.database.batchJob.findMany({
                where: {
                    type: 'PAYOUT_DISTRIBUTION',
                    status: { in: ['PENDING', 'PROCESSING'] }
                },
                orderBy: { createdAt: 'asc' }
            });
            if (pendingBatches.length > 0) {
                this.logger.log(`发现 ${pendingBatches.length} 个未完成的批次作业`);
            }
            else {
                this.logger.log('没有待恢复的任务');
            }
        }
        catch (error) {
            this.logger.error('恢复待处理任务失败:', error);
        }
    }
    startHealthMonitoring() {
        this.healthMonitoringIntervalId = setInterval(async () => {
            const healthy = await this.checkSystemHealth();
            if (!healthy) {
                await this.sendAlert('SYSTEM_UNHEALTHY', '系统健康检查失败');
            }
        }, 5 * 60 * 1000);
    }
    async sendAlert(type, message) {
        this.logger.error(`告警 [${type}]: ${message}`);
    }
    async getProductInfo(productId) {
        return await this.database.product.findUnique({
            where: { id: productId },
            select: { aprBps: true, name: true, symbol: true }
        });
    }
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async getDistributionBatch(batchId) {
        return this.distributionBatches.get(batchId) || null;
    }
    async getRecentDistributionBatches(limit = 10) {
        const batches = Array.from(this.distributionBatches.values())
            .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
            .slice(0, limit);
        return batches;
    }
    async getDistributionStats() {
        const allBatches = Array.from(this.distributionBatches.values());
        const allTasks = Array.from(this.distributionTasks.values());
        const totalDistributed = allBatches.reduce((sum, batch) => sum + batch.totalAmount, 0);
        const totalTasks = allTasks.length;
        const successfulTasks = allTasks.filter(task => task.status === 'COMPLETED').length;
        const pendingTasks = allTasks.filter(task => task.status === 'PENDING').length;
        const failedTasks = allTasks.filter(task => task.status === 'FAILED').length;
        const lastBatch = allBatches
            .filter(batch => batch.status === 'COMPLETED')
            .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0];
        return {
            totalDistributed,
            totalBatches: allBatches.length,
            successRate: totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 0,
            lastDistribution: lastBatch?.completedAt,
            pendingTasks,
            failedTasks,
        };
    }
};
exports.YieldDistributionService = YieldDistributionService;
__decorate([
    (0, schedule_1.Cron)('0 1 * * *', {
        name: 'daily-yield-distribution',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YieldDistributionService.prototype, "scheduleDailyYieldDistribution", null);
exports.YieldDistributionService = YieldDistributionService = YieldDistributionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payouts_service_1.PayoutsService,
        positions_service_1.PositionsService,
        database_service_1.DatabaseService])
], YieldDistributionService);
//# sourceMappingURL=yield-distribution.service.js.map