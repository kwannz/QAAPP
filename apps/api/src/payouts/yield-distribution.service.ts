import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PayoutsService, MockPayout } from './payouts.service';
import { PositionsService, MockPosition } from '../positions/positions.service';
// import { BlockchainService } from '../blockchain/blockchain.service';
// import { DatabaseService } from '../database/database.service';

export interface YieldDistributionTask {
  id: string;
  positionId: string;
  userId: string;
  amount: number;
  scheduledAt: Date;
  executedAt?: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  txHash?: string;
  failureReason?: string;
  retryCount: number;
  createdAt: Date;
}

export interface DistributionBatch {
  id: string;
  date: Date;
  totalAmount: number;
  totalPositions: number;
  completedTasks: number;
  failedTasks: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  startedAt: Date;
  completedAt?: Date;
  tasks: YieldDistributionTask[];
}

@Injectable()
export class YieldDistributionService implements OnModuleInit {
  private readonly logger = new Logger(YieldDistributionService.name);
  
  // 内存存储任务队列
  private distributionTasks: Map<string, YieldDistributionTask> = new Map();
  private distributionBatches: Map<string, DistributionBatch> = new Map();
  
  // 配置参数
  private readonly maxRetryCount = 3;
  private readonly batchSize = 100; // 每批处理的持仓数量
  private readonly gasLimit = 200000;
  private readonly minGasBalance = '0.01'; // ETH
  
  constructor(
    private payoutsService: PayoutsService,
    private positionsService: PositionsService,
    // private blockchainService: BlockchainService,
    // private databaseService: DatabaseService,
  ) {}

  async onModuleInit() {
    this.logger.log('收益分发自动化系统启动');
    
    // 启动时检查未完成的任务
    await this.recoverPendingTasks();
    
    // 初始化监控
    this.startHealthMonitoring();
  }

  /**
   * 每日定时执行收益分发
   * 每天凌晨1点执行
   */
  @Cron('0 1 * * *', {
    name: 'daily-yield-distribution',
    timeZone: 'Asia/Shanghai',
  })
  async scheduleDailyYieldDistribution() {
    this.logger.log('开始执行每日收益分发任务');
    
    try {
      const today = new Date();
      const batchId = `batch-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      
      // 创建分发批次
      const batch = await this.createDistributionBatch(batchId, today);
      
      // 获取所有活跃持仓
      const activePositions = await this.positionsService.getActivePositions();
      
      if (activePositions.length === 0) {
        this.logger.log('没有活跃持仓需要分发收益');
        batch.status = 'COMPLETED';
        batch.completedAt = new Date();
        return;
      }
      
      this.logger.log(`发现 ${activePositions.length} 个活跃持仓需要分发收益`);
      
      // 为每个持仓创建收益分发任务
      const tasks = await this.createDistributionTasks(activePositions, batch.id);
      batch.tasks = tasks;
      batch.totalPositions = tasks.length;
      
      // 执行批量分发
      await this.executeBatchDistribution(batch);
      
      this.logger.log(`每日收益分发完成，成功: ${batch.completedTasks}，失败: ${batch.failedTasks}`);
      
    } catch (error) {
      this.logger.error('每日收益分发失败:', error);
      
      // 发送告警通知
      await this.sendAlert('DAILY_DISTRIBUTION_FAILED', error.message);
    }
  }

  /**
   * 手动触发收益分发
   */
  async triggerManualDistribution(positionIds?: string[]): Promise<DistributionBatch> {
    this.logger.log('开始手动收益分发');
    
    try {
      const batchId = `manual-${Date.now()}`;
      const batch = await this.createDistributionBatch(batchId, new Date());
      
      let positions: MockPosition[];
      
      if (positionIds && positionIds.length > 0) {
        // 指定持仓分发
        positions = [];
        for (const positionId of positionIds) {
          try {
            const position = await this.positionsService.getPosition(positionId);
            if (position.status === 'ACTIVE') {
              positions.push(position);
            }
          } catch (error) {
            this.logger.warn(`持仓 ${positionId} 不存在或不活跃`);
          }
        }
      } else {
        // 全部活跃持仓分发
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
      
    } catch (error) {
      this.logger.error('手动收益分发失败:', error);
      throw error;
    }
  }

  /**
   * 创建分发批次
   */
  private async createDistributionBatch(batchId: string, date: Date): Promise<DistributionBatch> {
    const batch: DistributionBatch = {
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

  /**
   * 为持仓创建分发任务
   */
  private async createDistributionTasks(
    positions: MockPosition[],
    batchId: string
  ): Promise<YieldDistributionTask[]> {
    const tasks: YieldDistributionTask[] = [];
    
    for (const position of positions) {
      try {
        // 计算每日收益
        const dailyYield = await this.calculateDailyYield(position);
        
        if (dailyYield <= 0) {
          this.logger.warn(`持仓 ${position.id} 每日收益为0，跳过`);
          continue;
        }
        
        const taskId = `task-${position.id}-${Date.now()}`;
        const task: YieldDistributionTask = {
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
        
      } catch (error) {
        this.logger.error(`为持仓 ${position.id} 创建分发任务失败:`, error);
      }
    }
    
    this.logger.log(`创建了 ${tasks.length} 个收益分发任务`);
    return tasks;
  }

  /**
   * 执行批量分发
   */
  private async executeBatchDistribution(batch: DistributionBatch): Promise<void> {
    this.logger.log(`开始执行批次 ${batch.id} 的收益分发，共 ${batch.tasks.length} 个任务`);
    
    // 检查系统状态
    const systemHealthy = await this.checkSystemHealth();
    if (!systemHealthy) {
      throw new Error('系统状态不健康，暂停收益分发');
    }
    
    let completedCount = 0;
    let failedCount = 0;
    let totalAmount = 0;
    
    // 分批处理任务
    const batches = this.chunkArray(batch.tasks, this.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const taskBatch = batches[i];
      this.logger.log(`处理第 ${i + 1}/${batches.length} 批任务，共 ${taskBatch.length} 个任务`);
      
      // 并行处理当前批次的任务
      const batchPromises = taskBatch.map(task => this.executeDistributionTask(task));
      const batchResults = await Promise.allSettled(batchPromises);
      
      // 统计结果
      batchResults.forEach((result, index) => {
        const task = taskBatch[index];
        if (result.status === 'fulfilled' && result.value) {
          completedCount++;
          totalAmount += task.amount;
        } else {
          failedCount++;
          this.logger.error(`任务 ${task.id} 执行失败:`, result.status === 'rejected' ? result.reason : '未知错误');
        }
      });
      
      // 批次间延迟，避免系统过载
      if (i < batches.length - 1) {
        await this.delay(2000); // 2秒延迟
      }
    }
    
    // 更新批次状态
    batch.completedTasks = completedCount;
    batch.failedTasks = failedCount;
    batch.totalAmount = totalAmount;
    batch.status = failedCount > 0 ? 'FAILED' : 'COMPLETED';
    batch.completedAt = new Date();
    
    this.logger.log(`批次 ${batch.id} 执行完成：成功 ${completedCount}，失败 ${failedCount}，总金额 ${totalAmount.toFixed(2)} USDT`);
    
    // 如果有失败任务，启动重试机制
    if (failedCount > 0) {
      await this.scheduleRetryTasks(batch.id);
    }
  }

  /**
   * 执行单个分发任务
   */
  private async executeDistributionTask(task: YieldDistributionTask): Promise<boolean> {
    try {
      task.status = 'PROCESSING';
      this.distributionTasks.set(task.id, task);
      
      this.logger.debug(`执行收益分发任务: ${task.id}，用户: ${task.userId}，金额: ${task.amount.toFixed(6)}`);
      
      // 1. 创建收益记录
      const payout = await this.createPayoutRecord(task);
      
      // 2. 执行链上转账（模拟）
      const txHash = await this.executeOnChainTransfer(task);
      
      // 3. 更新持仓记录
      await this.positionsService.recordPayoutPayment(task.positionId, task.amount);
      
      // 4. 更新任务状态
      task.status = 'COMPLETED';
      task.executedAt = new Date();
      task.txHash = txHash;
      this.distributionTasks.set(task.id, task);
      
      this.logger.debug(`任务 ${task.id} 执行成功，交易哈希: ${txHash}`);
      return true;
      
    } catch (error) {
      task.status = 'FAILED';
      task.failureReason = error.message;
      task.retryCount++;
      this.distributionTasks.set(task.id, task);
      
      this.logger.error(`任务 ${task.id} 执行失败 (重试 ${task.retryCount}/${this.maxRetryCount}):`, error);
      return false;
    }
  }

  /**
   * 计算每日收益
   */
  private async calculateDailyYield(position: MockPosition): Promise<number> {
    // 获取产品信息
    const product = await this.getProductInfo(position.productId);
    if (!product) {
      throw new Error(`产品 ${position.productId} 信息不存在`);
    }
    
    // 计算每日收益率
    const annualRate = product.aprBps / 10000;
    const dailyRate = annualRate / 365;
    
    // 计算收益金额
    const dailyYield = position.principal * dailyRate;
    
    this.logger.debug(`持仓 ${position.id} 每日收益: ${dailyYield.toFixed(6)} USDT (本金: ${position.principal}, APR: ${product.aprBps}bps)`);
    
    return dailyYield;
  }

  /**
   * 创建收益记录
   */
  private async createPayoutRecord(task: YieldDistributionTask): Promise<MockPayout> {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    const payout: MockPayout = {
      id: `payout-${task.positionId}-${todayStart.getTime()}`,
      userId: task.userId,
      positionId: task.positionId,
      amount: task.amount,
      periodStart: todayStart,
      periodEnd: todayEnd,
      status: 'PENDING',
      isClaimable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // 这里应该保存到数据库
    // await this.databaseService.createPayout(payout);
    
    this.logger.debug(`创建收益记录: ${payout.id}`);
    return payout;
  }

  /**
   * 执行链上转账
   */
  private async executeOnChainTransfer(task: YieldDistributionTask): Promise<string> {
    try {
      // 模拟区块链转账延迟
      await this.delay(1000 + Math.random() * 2000);
      
      // 生成模拟交易哈希
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // 实际实现中应该调用智能合约
      // const txHash = await this.blockchainService.distributePayout(
      //   task.userId,
      //   task.amount,
      //   task.positionId
      // );
      
      this.logger.debug(`模拟链上转账成功: ${mockTxHash}，金额: ${task.amount.toFixed(6)} USDT`);
      return mockTxHash;
      
    } catch (error) {
      this.logger.error('链上转账失败:', error);
      throw new Error(`链上转账失败: ${error.message}`);
    }
  }

  /**
   * 检查系统健康状态
   */
  private async checkSystemHealth(): Promise<boolean> {
    try {
      // 检查区块链连接
      const chainHealthy = await this.checkChainHealth();
      if (!chainHealthy) {
        this.logger.warn('区块链连接不健康');
        return false;
      }
      
      // 检查Gas余额
      const gasBalance = await this.checkGasBalance();
      if (!gasBalance) {
        this.logger.warn('Gas余额不足');
        return false;
      }
      
      // 检查数据库连接
      const dbHealthy = await this.checkDatabaseHealth();
      if (!dbHealthy) {
        this.logger.warn('数据库连接不健康');
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.error('系统健康检查失败:', error);
      return false;
    }
  }

  /**
   * 检查区块链健康状态
   */
  private async checkChainHealth(): Promise<boolean> {
    try {
      // 实际实现中应该检查区块链节点状态
      // const blockNumber = await this.blockchainService.getBlockNumber();
      // return blockNumber > 0;
      
      // 模拟检查
      return true;
    } catch (error) {
      this.logger.error('区块链健康检查失败:', error);
      return false;
    }
  }

  /**
   * 检查Gas余额
   */
  private async checkGasBalance(): Promise<boolean> {
    try {
      // 实际实现中应该检查操作钱包的ETH余额
      // const balance = await this.blockchainService.getETHBalance();
      // return parseFloat(balance) > parseFloat(this.minGasBalance);
      
      // 模拟检查
      return true;
    } catch (error) {
      this.logger.error('Gas余额检查失败:', error);
      return false;
    }
  }

  /**
   * 检查数据库健康状态
   */
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // 简单的数据库连接检查
      // await this.databaseService.healthCheck();
      return true;
    } catch (error) {
      this.logger.error('数据库健康检查失败:', error);
      return false;
    }
  }

  /**
   * 安排重试任务
   */
  private async scheduleRetryTasks(batchId: string): Promise<void> {
    const batch = this.distributionBatches.get(batchId);
    if (!batch) return;
    
    const failedTasks = batch.tasks.filter(
      task => task.status === 'FAILED' && task.retryCount < this.maxRetryCount
    );
    
    if (failedTasks.length === 0) {
      this.logger.log(`批次 ${batchId} 没有需要重试的任务`);
      return;
    }
    
    this.logger.log(`批次 ${batchId} 有 ${failedTasks.length} 个任务需要重试`);
    
    // 延迟5分钟后重试
    setTimeout(async () => {
      for (const task of failedTasks) {
        task.status = 'PENDING';
        await this.executeDistributionTask(task);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * 恢复待处理任务
   */
  private async recoverPendingTasks(): Promise<void> {
    // 实际实现中应该从数据库加载未完成的任务
    this.logger.log('检查并恢复待处理任务');
  }

  /**
   * 启动健康监控
   */
  private startHealthMonitoring(): void {
    // 每5分钟检查一次系统健康状态
    setInterval(async () => {
      const healthy = await this.checkSystemHealth();
      if (!healthy) {
        await this.sendAlert('SYSTEM_UNHEALTHY', '系统健康检查失败');
      }
    }, 5 * 60 * 1000);
  }

  /**
   * 发送告警通知
   */
  private async sendAlert(type: string, message: string): Promise<void> {
    this.logger.error(`告警 [${type}]: ${message}`);
    
    // 实际实现中应该发送邮件、短信或推送通知
    // await this.notificationService.sendAlert(type, message);
  }

  /**
   * 获取产品信息
   */
  private async getProductInfo(productId: string): Promise<any> {
    // 模拟产品信息
    const productMap = new Map([
      ['prod-silver-001', { aprBps: 1200, name: '银卡产品' }],
      ['prod-gold-001', { aprBps: 1500, name: '金卡产品' }],
      ['prod-diamond-001', { aprBps: 1800, name: '钻石卡产品' }],
    ]);
    
    return productMap.get(productId);
  }

  /**
   * 工具方法：数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 工具方法：延迟
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取分发批次信息
   */
  async getDistributionBatch(batchId: string): Promise<DistributionBatch | null> {
    return this.distributionBatches.get(batchId) || null;
  }

  /**
   * 获取最近的分发批次
   */
  async getRecentDistributionBatches(limit: number = 10): Promise<DistributionBatch[]> {
    const batches = Array.from(this.distributionBatches.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
    
    return batches;
  }

  /**
   * 获取系统分发统计
   */
  async getDistributionStats(): Promise<{
    totalDistributed: number;
    totalBatches: number;
    successRate: number;
    lastDistribution?: Date;
    pendingTasks: number;
    failedTasks: number;
  }> {
    const allBatches = Array.from(this.distributionBatches.values());
    const allTasks = Array.from(this.distributionTasks.values());
    
    const totalDistributed = allBatches.reduce((sum, batch) => sum + batch.totalAmount, 0);
    const totalTasks = allTasks.length;
    const successfulTasks = allTasks.filter(task => task.status === 'COMPLETED').length;
    const pendingTasks = allTasks.filter(task => task.status === 'PENDING').length;
    const failedTasks = allTasks.filter(task => task.status === 'FAILED').length;
    
    const lastBatch = allBatches
      .filter(batch => batch.status === 'COMPLETED')
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())[0];
    
    return {
      totalDistributed,
      totalBatches: allBatches.length,
      successRate: totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 0,
      lastDistribution: lastBatch?.completedAt,
      pendingTasks,
      failedTasks,
    };
  }
}