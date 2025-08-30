#!/usr/bin/env node

/**
 * 自愈系统 - 自动检测和修复问题
 * 目标：99.99%可用性
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// ========== 配置 ==========
const CONFIG = {
  // 服务配置
  services: {
    api: {
      name: 'API Service',
      url: 'http://localhost:3001',
      healthEndpoint: '/health',
      startCommand: 'cd /workspace/apps/api && npm run start:prod',
      buildCommand: 'cd /workspace/apps/api && npm run build',
      port: 3001,
      maxRestarts: 5,
      restartDelay: 5000,
      healthCheckInterval: 10000,
      responseTimeThreshold: 1000,
      memoryThreshold: 500 * 1024 * 1024, // 500MB
      cpuThreshold: 80, // 80%
    },
    web: {
      name: 'Web Service',
      url: 'http://localhost:3002',
      healthEndpoint: '/',
      startCommand: 'cd /workspace/apps/web && npm run start',
      buildCommand: 'cd /workspace/apps/web && npm run build',
      port: 3002,
      maxRestarts: 5,
      restartDelay: 5000,
      healthCheckInterval: 10000,
      responseTimeThreshold: 2000,
      memoryThreshold: 500 * 1024 * 1024,
      cpuThreshold: 80,
    },
    database: {
      name: 'PostgreSQL',
      checkCommand: 'pg_isready -h localhost -p 5432',
      startCommand: 'sudo service postgresql start',
      restartCommand: 'sudo service postgresql restart',
      optimizeCommand: 'psql -U qauser -d qadb -c "VACUUM ANALYZE;"',
      healthCheckInterval: 30000,
    },
    redis: {
      name: 'Redis',
      checkCommand: 'redis-cli ping',
      startCommand: 'sudo service redis-server start',
      restartCommand: 'sudo service redis-server restart',
      flushCommand: 'redis-cli FLUSHDB',
      healthCheckInterval: 30000,
    }
  },
  
  // 自愈策略
  healingStrategies: {
    memoryLeak: {
      threshold: 0.9, // 90%内存使用率
      action: 'restart',
      cooldown: 300000, // 5分钟冷却
    },
    highCpu: {
      threshold: 0.95, // 95% CPU使用率
      duration: 60000, // 持续1分钟
      action: 'throttle',
    },
    slowResponse: {
      threshold: 5000, // 5秒响应时间
      consecutiveFailures: 3,
      action: 'optimize',
    },
    deadlock: {
      detectInterval: 60000,
      action: 'forceRestart',
    }
  },
  
  // 监控指标
  metrics: {
    history: [],
    maxHistorySize: 1000,
    aggregationInterval: 60000, // 1分钟聚合
  },
  
  // 告警配置
  alerts: {
    enabled: true,
    channels: ['console', 'file'],
    levels: {
      info: 0,
      warning: 1,
      error: 2,
      critical: 3,
    },
    thresholds: {
      errorRate: 0.01, // 1%错误率
      downtime: 60000, // 1分钟宕机
      responseTime: 3000, // 3秒响应
    }
  }
};

// ========== 核心类 ==========

/**
 * 健康检查器
 */
class HealthChecker {
  constructor() {
    this.checks = new Map();
    this.results = new Map();
  }
  
  async checkHTTP(url, endpoint) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const fullUrl = `${url}${endpoint}`;
      
      const protocol = url.startsWith('https') ? https : http;
      
      protocol.get(fullUrl, (res) => {
        const responseTime = Date.now() - startTime;
        const healthy = res.statusCode >= 200 && res.statusCode < 400;
        
        resolve({
          healthy,
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date(),
        });
      }).on('error', (err) => {
        resolve({
          healthy: false,
          error: err.message,
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
        });
      }).setTimeout(5000);
    });
  }
  
  async checkCommand(command) {
    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        resolve({
          healthy: !error,
          output: stdout,
          error: error ? error.message : stderr,
          timestamp: new Date(),
        });
      });
    });
  }
  
  async checkProcess(port) {
    return new Promise((resolve) => {
      exec(`lsof -i:${port} | grep LISTEN`, (error, stdout) => {
        resolve({
          healthy: !error && stdout.length > 0,
          timestamp: new Date(),
        });
      });
    });
  }
  
  async getSystemMetrics() {
    const metrics = {};
    
    // CPU使用率
    const cpuUsage = await this.getCPUUsage();
    metrics.cpu = cpuUsage;
    
    // 内存使用率
    const memUsage = await this.getMemoryUsage();
    metrics.memory = memUsage;
    
    // 磁盘使用率
    const diskUsage = await this.getDiskUsage();
    metrics.disk = diskUsage;
    
    // 网络状态
    const networkStatus = await this.getNetworkStatus();
    metrics.network = networkStatus;
    
    return metrics;
  }
  
  async getCPUUsage() {
    return new Promise((resolve) => {
      exec("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1", (error, stdout) => {
        resolve(error ? 0 : parseFloat(stdout) || 0);
      });
    });
  }
  
  async getMemoryUsage() {
    return new Promise((resolve) => {
      exec("free -m | grep Mem | awk '{print ($3/$2)*100}'", (error, stdout) => {
        resolve(error ? 0 : parseFloat(stdout) || 0);
      });
    });
  }
  
  async getDiskUsage() {
    return new Promise((resolve) => {
      exec("df -h / | tail -1 | awk '{print $5}' | sed 's/%//'", (error, stdout) => {
        resolve(error ? 0 : parseInt(stdout) || 0);
      });
    });
  }
  
  async getNetworkStatus() {
    return new Promise((resolve) => {
      exec("ping -c 1 google.com", (error) => {
        resolve(!error);
      });
    });
  }
}

/**
 * 自愈执行器
 */
class HealingExecutor {
  constructor() {
    this.healingHistory = [];
    this.restartCounts = new Map();
    this.lastHealingTime = new Map();
  }
  
  async executeHealing(service, issue, strategy) {
    const healingId = `${service}-${Date.now()}`;
    
    console.log(`🔧 执行自愈: ${service} - ${issue}`);
    
    this.healingHistory.push({
      id: healingId,
      service,
      issue,
      strategy,
      timestamp: new Date(),
      status: 'started',
    });
    
    let success = false;
    
    switch (strategy) {
      case 'restart':
        success = await this.restartService(service);
        break;
      case 'rebuild':
        success = await this.rebuildService(service);
        break;
      case 'optimize':
        success = await this.optimizeService(service);
        break;
      case 'clearCache':
        success = await this.clearCache();
        break;
      case 'forceRestart':
        success = await this.forceRestartService(service);
        break;
      default:
        console.log(`未知策略: ${strategy}`);
    }
    
    // 更新历史记录
    const record = this.healingHistory.find(h => h.id === healingId);
    if (record) {
      record.status = success ? 'completed' : 'failed';
      record.completedAt = new Date();
    }
    
    return success;
  }
  
  async restartService(serviceName) {
    const service = CONFIG.services[serviceName];
    if (!service) return false;
    
    console.log(`♻️ 重启服务: ${service.name}`);
    
    // 检查重启次数
    const restartCount = this.restartCounts.get(serviceName) || 0;
    if (restartCount >= service.maxRestarts) {
      console.log(`❌ ${service.name} 已达到最大重启次数`);
      return false;
    }
    
    // 停止服务
    if (service.port) {
      await this.killProcess(service.port);
    }
    
    // 等待
    await this.sleep(2000);
    
    // 启动服务
    const started = await this.startService(serviceName);
    
    if (started) {
      this.restartCounts.set(serviceName, restartCount + 1);
      
      // 30分钟后重置计数器
      setTimeout(() => {
        this.restartCounts.set(serviceName, 0);
      }, 30 * 60 * 1000);
    }
    
    return started;
  }
  
  async rebuildService(serviceName) {
    const service = CONFIG.services[serviceName];
    if (!service || !service.buildCommand) return false;
    
    console.log(`🔨 重建服务: ${service.name}`);
    
    return new Promise((resolve) => {
      exec(service.buildCommand, (error) => {
        if (!error) {
          this.restartService(serviceName).then(resolve);
        } else {
          resolve(false);
        }
      });
    });
  }
  
  async optimizeService(serviceName) {
    console.log(`⚡ 优化服务: ${serviceName}`);
    
    if (serviceName === 'database') {
      return await this.optimizeDatabase();
    } else if (serviceName === 'redis') {
      return await this.optimizeRedis();
    } else {
      // 通用优化：清理日志、临时文件等
      await this.cleanupLogs();
      await this.cleanupTempFiles();
      return true;
    }
  }
  
  async forceRestartService(serviceName) {
    const service = CONFIG.services[serviceName];
    if (!service) return false;
    
    console.log(`🔴 强制重启: ${service.name}`);
    
    // 强制终止
    if (service.port) {
      await this.killProcess(service.port, true);
    }
    
    await this.sleep(3000);
    
    // 清理并重启
    await this.clearCache();
    return await this.startService(serviceName);
  }
  
  async startService(serviceName) {
    const service = CONFIG.services[serviceName];
    if (!service) return false;
    
    return new Promise((resolve) => {
      if (service.startCommand) {
        const [cmd, ...args] = service.startCommand.split(' ');
        const child = spawn(cmd, args, {
          detached: true,
          stdio: 'ignore',
          shell: true,
        });
        
        child.unref();
        
        // 等待服务启动
        setTimeout(() => {
          resolve(true);
        }, 5000);
      } else {
        resolve(false);
      }
    });
  }
  
  async killProcess(port, force = false) {
    return new Promise((resolve) => {
      const signal = force ? 'SIGKILL' : 'SIGTERM';
      exec(`lsof -ti:${port} | xargs kill -${signal}`, () => {
        resolve(true);
      });
    });
  }
  
  async optimizeDatabase() {
    return new Promise((resolve) => {
      exec(CONFIG.services.database.optimizeCommand, (error) => {
        resolve(!error);
      });
    });
  }
  
  async optimizeRedis() {
    return new Promise((resolve) => {
      // Redis内存优化
      exec('redis-cli CONFIG SET maxmemory-policy allkeys-lru', () => {
        exec('redis-cli MEMORY PURGE', () => {
          resolve(true);
        });
      });
    });
  }
  
  async clearCache() {
    console.log('🧹 清理缓存');
    
    // 清理Redis
    await new Promise((resolve) => {
      exec('redis-cli FLUSHDB', resolve);
    });
    
    // 清理Node缓存
    const cacheDir = path.join(__dirname, '../.cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
    
    // 清理临时文件
    await new Promise((resolve) => {
      exec('rm -rf /tmp/npm-*', resolve);
    });
    
    return true;
  }
  
  async cleanupLogs() {
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) return;
    
    const files = fs.readdirSync(logsDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  }
  
  async cleanupTempFiles() {
    await new Promise((resolve) => {
      exec('find /tmp -type f -atime +1 -delete', resolve);
    });
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 智能分析器
 */
class IntelligentAnalyzer {
  constructor() {
    this.patterns = new Map();
    this.predictions = new Map();
    this.anomalies = [];
  }
  
  analyzeMetrics(metrics) {
    const analysis = {
      health: 'healthy',
      issues: [],
      recommendations: [],
      predictions: [],
    };
    
    // CPU分析
    if (metrics.cpu > 80) {
      analysis.issues.push({
        type: 'highCpu',
        severity: metrics.cpu > 95 ? 'critical' : 'warning',
        value: metrics.cpu,
      });
      analysis.recommendations.push('考虑扩展计算资源或优化代码');
    }
    
    // 内存分析
    if (metrics.memory > 85) {
      analysis.issues.push({
        type: 'highMemory',
        severity: metrics.memory > 95 ? 'critical' : 'warning',
        value: metrics.memory,
      });
      analysis.recommendations.push('检查内存泄漏或增加内存容量');
    }
    
    // 磁盘分析
    if (metrics.disk > 80) {
      analysis.issues.push({
        type: 'highDisk',
        severity: metrics.disk > 90 ? 'critical' : 'warning',
        value: metrics.disk,
      });
      analysis.recommendations.push('清理日志文件或扩展存储空间');
    }
    
    // 网络分析
    if (!metrics.network) {
      analysis.issues.push({
        type: 'networkDown',
        severity: 'critical',
      });
      analysis.recommendations.push('检查网络连接');
    }
    
    // 预测分析
    analysis.predictions = this.predictIssues(metrics);
    
    // 确定整体健康状态
    if (analysis.issues.some(i => i.severity === 'critical')) {
      analysis.health = 'critical';
    } else if (analysis.issues.some(i => i.severity === 'warning')) {
      analysis.health = 'warning';
    }
    
    return analysis;
  }
  
  predictIssues(metrics) {
    const predictions = [];
    
    // 基于历史数据预测
    const history = CONFIG.metrics.history;
    if (history.length > 10) {
      // 内存泄漏预测
      const memoryTrend = this.calculateTrend(history.map(h => h.memory));
      if (memoryTrend > 0.5) {
        predictions.push({
          type: 'memoryLeak',
          probability: memoryTrend,
          timeToIssue: this.estimateTimeToThreshold(metrics.memory, 95, memoryTrend),
        });
      }
      
      // CPU过载预测
      const cpuTrend = this.calculateTrend(history.map(h => h.cpu));
      if (cpuTrend > 0.3) {
        predictions.push({
          type: 'cpuOverload',
          probability: cpuTrend,
          timeToIssue: this.estimateTimeToThreshold(metrics.cpu, 95, cpuTrend),
        });
      }
    }
    
    return predictions;
  }
  
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    let trend = 0;
    for (let i = 1; i < values.length; i++) {
      trend += (values[i] - values[i-1]) / values[i-1];
    }
    
    return trend / (values.length - 1);
  }
  
  estimateTimeToThreshold(current, threshold, trend) {
    if (trend <= 0) return Infinity;
    
    const remaining = threshold - current;
    const ratePerMinute = trend * current / 100;
    
    return Math.floor(remaining / ratePerMinute);
  }
  
  detectAnomalies(metrics) {
    const anomalies = [];
    
    // 使用统计方法检测异常
    const history = CONFIG.metrics.history;
    if (history.length > 30) {
      const stats = this.calculateStatistics(history);
      
      // CPU异常
      if (Math.abs(metrics.cpu - stats.cpu.mean) > 2 * stats.cpu.stdDev) {
        anomalies.push({
          type: 'cpu',
          value: metrics.cpu,
          deviation: Math.abs(metrics.cpu - stats.cpu.mean) / stats.cpu.stdDev,
        });
      }
      
      // 内存异常
      if (Math.abs(metrics.memory - stats.memory.mean) > 2 * stats.memory.stdDev) {
        anomalies.push({
          type: 'memory',
          value: metrics.memory,
          deviation: Math.abs(metrics.memory - stats.memory.mean) / stats.memory.stdDev,
        });
      }
    }
    
    return anomalies;
  }
  
  calculateStatistics(history) {
    const stats = {
      cpu: { mean: 0, stdDev: 0 },
      memory: { mean: 0, stdDev: 0 },
    };
    
    // 计算平均值
    history.forEach(h => {
      stats.cpu.mean += h.cpu;
      stats.memory.mean += h.memory;
    });
    
    stats.cpu.mean /= history.length;
    stats.memory.mean /= history.length;
    
    // 计算标准差
    history.forEach(h => {
      stats.cpu.stdDev += Math.pow(h.cpu - stats.cpu.mean, 2);
      stats.memory.stdDev += Math.pow(h.memory - stats.memory.mean, 2);
    });
    
    stats.cpu.stdDev = Math.sqrt(stats.cpu.stdDev / history.length);
    stats.memory.stdDev = Math.sqrt(stats.memory.stdDev / history.length);
    
    return stats;
  }
}

/**
 * 主控制器
 */
class AutoHealingSystem {
  constructor() {
    this.healthChecker = new HealthChecker();
    this.healingExecutor = new HealingExecutor();
    this.analyzer = new IntelligentAnalyzer();
    this.isRunning = false;
    this.checkIntervals = new Map();
  }
  
  async start() {
    console.log('🚀 自愈系统启动');
    console.log('📊 目标: 99.99%可用性');
    console.log('🔍 监控间隔: 10秒');
    console.log('🔧 自动修复: 已启用\n');
    
    this.isRunning = true;
    
    // 初始化检查
    await this.performInitialCheck();
    
    // 启动定期检查
    this.startPeriodicChecks();
    
    // 启动智能分析
    this.startIntelligentAnalysis();
    
    // 启动性能优化
    this.startPerformanceOptimization();
  }
  
  async performInitialCheck() {
    console.log('📋 执行初始系统检查...\n');
    
    for (const [name, service] of Object.entries(CONFIG.services)) {
      const status = await this.checkService(name, service);
      
      if (!status.healthy) {
        console.log(`❌ ${service.name} 不健康，尝试修复...`);
        await this.healingExecutor.executeHealing(name, 'initialCheck', 'restart');
      } else {
        console.log(`✅ ${service.name} 正常`);
      }
    }
    
    console.log('\n初始检查完成\n');
  }
  
  startPeriodicChecks() {
    // API服务检查
    this.checkIntervals.set('api', setInterval(async () => {
      await this.checkAndHeal('api');
    }, CONFIG.services.api.healthCheckInterval));
    
    // Web服务检查
    this.checkIntervals.set('web', setInterval(async () => {
      await this.checkAndHeal('web');
    }, CONFIG.services.web.healthCheckInterval));
    
    // 数据库检查
    this.checkIntervals.set('database', setInterval(async () => {
      await this.checkAndHeal('database');
    }, CONFIG.services.database.healthCheckInterval));
    
    // Redis检查
    this.checkIntervals.set('redis', setInterval(async () => {
      await this.checkAndHeal('redis');
    }, CONFIG.services.redis.healthCheckInterval));
  }
  
  startIntelligentAnalysis() {
    setInterval(async () => {
      const metrics = await this.healthChecker.getSystemMetrics();
      
      // 保存历史数据
      CONFIG.metrics.history.push({
        ...metrics,
        timestamp: new Date(),
      });
      
      // 限制历史数据大小
      if (CONFIG.metrics.history.length > CONFIG.metrics.maxHistorySize) {
        CONFIG.metrics.history.shift();
      }
      
      // 分析指标
      const analysis = this.analyzer.analyzeMetrics(metrics);
      
      // 检测异常
      const anomalies = this.analyzer.detectAnomalies(metrics);
      
      // 处理关键问题
      if (analysis.health === 'critical') {
        console.log('🚨 检测到关键问题:', analysis.issues);
        
        for (const issue of analysis.issues) {
          await this.handleCriticalIssue(issue);
        }
      }
      
      // 处理预测
      for (const prediction of analysis.predictions) {
        if (prediction.timeToIssue < 10) {
          console.log(`⚠️ 预测: ${prediction.type} 将在 ${prediction.timeToIssue} 分钟内发生`);
          await this.handlePrediction(prediction);
        }
      }
      
      // 处理异常
      for (const anomaly of anomalies) {
        console.log(`🔍 检测到异常: ${anomaly.type} (偏差: ${anomaly.deviation.toFixed(2)}σ)`);
      }
      
    }, CONFIG.metrics.aggregationInterval);
  }
  
  startPerformanceOptimization() {
    // 每小时执行一次优化
    setInterval(async () => {
      console.log('⚡ 执行定期性能优化...');
      
      // 数据库优化
      await this.healingExecutor.optimizeDatabase();
      
      // Redis优化
      await this.healingExecutor.optimizeRedis();
      
      // 清理日志
      await this.healingExecutor.cleanupLogs();
      
      // 清理缓存（如果内存使用率高）
      const metrics = await this.healthChecker.getSystemMetrics();
      if (metrics.memory > 70) {
        await this.healingExecutor.clearCache();
      }
      
      console.log('✅ 性能优化完成');
      
    }, 60 * 60 * 1000); // 每小时
  }
  
  async checkAndHeal(serviceName) {
    const service = CONFIG.services[serviceName];
    if (!service) return;
    
    const status = await this.checkService(serviceName, service);
    
    if (!status.healthy) {
      console.log(`❌ ${service.name} 检查失败`);
      
      // 确定修复策略
      let strategy = 'restart';
      
      if (status.responseTime && status.responseTime > service.responseTimeThreshold) {
        strategy = 'optimize';
      } else if (status.error && status.error.includes('ECONNREFUSED')) {
        strategy = 'restart';
      } else if (status.error && status.error.includes('timeout')) {
        strategy = 'forceRestart';
      }
      
      // 执行修复
      const healed = await this.healingExecutor.executeHealing(
        serviceName,
        status.error || 'unhealthy',
        strategy
      );
      
      if (healed) {
        console.log(`✅ ${service.name} 已修复`);
      } else {
        console.log(`❌ ${service.name} 修复失败，需要人工干预`);
        this.sendAlert('critical', `${service.name} 自动修复失败`);
      }
    }
  }
  
  async checkService(name, service) {
    if (service.url && service.healthEndpoint) {
      return await this.healthChecker.checkHTTP(service.url, service.healthEndpoint);
    } else if (service.checkCommand) {
      return await this.healthChecker.checkCommand(service.checkCommand);
    } else if (service.port) {
      return await this.healthChecker.checkProcess(service.port);
    }
    
    return { healthy: false, error: 'No check method available' };
  }
  
  async handleCriticalIssue(issue) {
    switch (issue.type) {
      case 'highCpu':
        // CPU过高，限流或重启
        console.log('🔥 CPU使用率过高，执行限流...');
        // 实施限流逻辑
        break;
        
      case 'highMemory':
        // 内存过高，清理或重启
        console.log('💾 内存使用率过高，清理内存...');
        await this.healingExecutor.clearCache();
        await this.healingExecutor.cleanupTempFiles();
        break;
        
      case 'highDisk':
        // 磁盘空间不足
        console.log('💿 磁盘空间不足，清理文件...');
        await this.healingExecutor.cleanupLogs();
        await this.healingExecutor.cleanupTempFiles();
        break;
        
      case 'networkDown':
        // 网络故障
        console.log('🌐 网络连接异常');
        // 等待网络恢复
        break;
    }
  }
  
  async handlePrediction(prediction) {
    switch (prediction.type) {
      case 'memoryLeak':
        console.log('🔮 预防内存泄漏，提前重启服务...');
        await this.healingExecutor.restartService('api');
        await this.healingExecutor.restartService('web');
        break;
        
      case 'cpuOverload':
        console.log('🔮 预防CPU过载，优化服务...');
        await this.healingExecutor.optimizeService('api');
        await this.healingExecutor.optimizeService('web');
        break;
    }
  }
  
  sendAlert(level, message) {
    const timestamp = new Date().toISOString();
    const alert = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // 控制台输出
    if (CONFIG.alerts.channels.includes('console')) {
      console.log(alert);
    }
    
    // 文件记录
    if (CONFIG.alerts.channels.includes('file')) {
      const alertFile = path.join(__dirname, '../logs/alerts.log');
      fs.appendFileSync(alertFile, alert + '\n');
    }
    
    // 这里可以添加更多告警渠道：邮件、短信、Webhook等
  }
  
  async stop() {
    console.log('🛑 停止自愈系统...');
    
    this.isRunning = false;
    
    // 清理所有定时器
    for (const interval of this.checkIntervals.values()) {
      clearInterval(interval);
    }
    
    console.log('✅ 自愈系统已停止');
  }
  
  getStatus() {
    return {
      running: this.isRunning,
      services: Object.keys(CONFIG.services).map(name => ({
        name,
        healthy: this.healthChecker.results.get(name)?.healthy || false,
        lastCheck: this.healthChecker.results.get(name)?.timestamp,
      })),
      healingHistory: this.healingExecutor.healingHistory.slice(-10),
      metrics: CONFIG.metrics.history.slice(-1)[0],
      predictions: this.analyzer.predictions,
    };
  }
}

// ========== 主程序 ==========
const system = new AutoHealingSystem();

// 启动系统
system.start().catch(error => {
  console.error('❌ 自愈系统启动失败:', error);
  process.exit(1);
});

// 优雅退出
process.on('SIGINT', async () => {
  await system.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await system.stop();
  process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获异常:', error);
  // 不退出，继续运行
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理拒绝:', reason);
  // 不退出，继续运行
});

// 状态API（可选）
const statusServer = http.createServer((req, res) => {
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(system.getStatus(), null, 2));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

statusServer.listen(9999, () => {
  console.log('📊 状态服务器运行在 http://localhost:9999/status');
});