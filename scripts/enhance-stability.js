#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  services: [
    {
      name: 'PostgreSQL',
      checkCommand: 'pg_isready -h localhost -p 5432',
      startCommand: 'sudo service postgresql start',
      critical: true
    },
    {
      name: 'Redis',
      checkCommand: 'redis-cli ping',
      startCommand: 'sudo service redis-server start',
      critical: true
    },
    {
      name: 'API Service',
      checkCommand: 'curl -s http://localhost:3001/health',
      startCommand: 'cd /workspace/apps/api && npm run start:prod',
      processName: 'api',
      port: 3001,
      critical: true
    },
    {
      name: 'Web Service',
      checkCommand: 'curl -s http://localhost:3002',
      startCommand: 'cd /workspace/apps/web && npm run start',
      processName: 'web',
      port: 3002,
      critical: true
    }
  ],
  retryAttempts: 3,
  retryDelay: 5000,
  healthCheckInterval: 30000
};

// 日志函数
function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
  
  // 写入日志文件
  const logFile = path.join(__dirname, '../logs/stability.log');
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  
  if (!fs.existsSync(path.dirname(logFile))) {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
  }
  
  fs.appendFileSync(logFile, logEntry);
}

// 执行命令
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message, stderr });
      } else {
        resolve({ success: true, stdout, stderr });
      }
    });
  });
}

// 检查服务状态
async function checkService(service) {
  const result = await executeCommand(service.checkCommand);
  return result.success;
}

// 启动服务
async function startService(service) {
  log('INFO', `Starting ${service.name}...`);
  
  if (service.processName) {
    // 对于Node.js服务，使用后台进程
    const [cmd, ...args] = service.startCommand.split(' ');
    const child = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    child.unref();
    
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else {
    // 对于系统服务
    await executeCommand(service.startCommand);
  }
  
  // 验证服务是否启动成功
  const isRunning = await checkService(service);
  if (isRunning) {
    log('INFO', `${service.name} started successfully`);
  } else {
    log('ERROR', `Failed to start ${service.name}`);
  }
  
  return isRunning;
}

// 重启服务
async function restartService(service) {
  log('INFO', `Restarting ${service.name}...`);
  
  // 先停止服务
  if (service.processName) {
    await executeCommand(`pkill -f ${service.processName}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 启动服务
  return await startService(service);
}

// 服务健康检查
async function healthCheck() {
  const results = {
    healthy: true,
    services: {}
  };
  
  for (const service of CONFIG.services) {
    const isHealthy = await checkService(service);
    results.services[service.name] = isHealthy;
    
    if (!isHealthy && service.critical) {
      results.healthy = false;
      log('WARN', `${service.name} is not healthy`);
      
      // 尝试恢复服务
      let recovered = false;
      for (let i = 0; i < CONFIG.retryAttempts; i++) {
        log('INFO', `Attempting to recover ${service.name} (attempt ${i + 1}/${CONFIG.retryAttempts})`);
        
        const started = await restartService(service);
        if (started) {
          recovered = true;
          log('INFO', `${service.name} recovered successfully`);
          results.services[service.name] = true;
          break;
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
      }
      
      if (!recovered) {
        log('ERROR', `Failed to recover ${service.name} after ${CONFIG.retryAttempts} attempts`);
      }
    }
  }
  
  return results;
}

// 清理旧日志
function cleanupLogs() {
  const logsDir = path.join(__dirname, '../logs');
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
  
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        log('INFO', `Deleted old log file: ${file}`);
      }
    });
  }
}

// 优化数据库连接
async function optimizeDatabase() {
  log('INFO', 'Optimizing database connections...');
  
  // 清理空闲连接
  await executeCommand('psql -U qauser -d qadb -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle\' AND state_change < NOW() - INTERVAL \'10 minutes\';"');
  
  // 分析和优化表
  await executeCommand('psql -U qauser -d qadb -c "ANALYZE;"');
  
  log('INFO', 'Database optimization completed');
}

// 清理缓存
async function clearCache() {
  log('INFO', 'Clearing cache...');
  
  // 清理Redis缓存
  await executeCommand('redis-cli FLUSHDB');
  
  // 清理Node.js缓存
  const cacheDir = path.join(__dirname, '../.cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
  
  log('INFO', 'Cache cleared');
}

// 系统资源监控
async function monitorResources() {
  // 检查内存使用
  const memResult = await executeCommand('free -m | grep Mem | awk \'{print ($3/$2)*100}\'');
  if (memResult.success) {
    const memUsage = parseFloat(memResult.stdout);
    if (memUsage > 90) {
      log('WARN', `High memory usage: ${memUsage.toFixed(2)}%`);
      
      // 清理内存
      await executeCommand('sync && echo 3 | sudo tee /proc/sys/vm/drop_caches');
      log('INFO', 'Memory cache cleared');
    }
  }
  
  // 检查磁盘使用
  const diskResult = await executeCommand('df -h / | tail -1 | awk \'{print $5}\' | sed \'s/%//\'');
  if (diskResult.success) {
    const diskUsage = parseInt(diskResult.stdout);
    if (diskUsage > 90) {
      log('WARN', `High disk usage: ${diskUsage}%`);
      
      // 清理日志和临时文件
      cleanupLogs();
      await executeCommand('rm -rf /tmp/*');
      log('INFO', 'Temporary files cleaned');
    }
  }
}

// 错误恢复机制
class ErrorRecovery {
  constructor() {
    this.errorCounts = new Map();
    this.lastErrors = new Map();
  }
  
  recordError(service, error) {
    const count = this.errorCounts.get(service) || 0;
    this.errorCounts.set(service, count + 1);
    this.lastErrors.set(service, {
      error,
      timestamp: new Date()
    });
    
    // 如果错误频繁，采取更激进的恢复措施
    if (count > 5) {
      this.aggressiveRecovery(service);
    }
  }
  
  async aggressiveRecovery(service) {
    log('WARN', `Aggressive recovery for ${service}`);
    
    // 重启所有相关服务
    for (const svc of CONFIG.services) {
      await restartService(svc);
    }
    
    // 清理和优化
    await clearCache();
    await optimizeDatabase();
    
    // 重置错误计数
    this.errorCounts.set(service, 0);
  }
  
  getStatus() {
    const status = {};
    for (const [service, count] of this.errorCounts.entries()) {
      const lastError = this.lastErrors.get(service);
      status[service] = {
        errorCount: count,
        lastError: lastError
      };
    }
    return status;
  }
}

// 主监控循环
async function startMonitoring() {
  log('INFO', '🚀 System Stability Monitor Started');
  
  const errorRecovery = new ErrorRecovery();
  
  // 初始健康检查
  const initialCheck = await healthCheck();
  log('INFO', `Initial health check: ${initialCheck.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  
  // 定期健康检查
  setInterval(async () => {
    try {
      // 健康检查
      const health = await healthCheck();
      
      // 资源监控
      await monitorResources();
      
      // 记录状态
      if (!health.healthy) {
        for (const [service, isHealthy] of Object.entries(health.services)) {
          if (!isHealthy) {
            errorRecovery.recordError(service, 'Health check failed');
          }
        }
      }
      
      // 定期优化（每小时）
      if (new Date().getMinutes() === 0) {
        await optimizeDatabase();
        await clearCache();
      }
      
    } catch (error) {
      log('ERROR', `Monitoring error: ${error.message}`);
    }
  }, CONFIG.healthCheckInterval);
  
  // 错误状态报告（每5分钟）
  setInterval(() => {
    const status = errorRecovery.getStatus();
    if (Object.keys(status).length > 0) {
      log('INFO', `Error status: ${JSON.stringify(status)}`);
    }
  }, 5 * 60 * 1000);
}

// 优雅退出
process.on('SIGINT', () => {
  log('INFO', 'Stability monitor shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('INFO', 'Stability monitor shutting down...');
  process.exit(0);
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  log('ERROR', `Uncaught exception: ${error.message}`);
  // 不退出，继续运行
});

process.on('unhandledRejection', (reason, promise) => {
  log('ERROR', `Unhandled rejection: ${reason}`);
  // 不退出，继续运行
});

// 启动监控
startMonitoring().catch(error => {
  log('ERROR', `Failed to start monitoring: ${error.message}`);
  process.exit(1);
});