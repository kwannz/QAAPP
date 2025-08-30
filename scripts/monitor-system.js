#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  api: {
    url: 'http://localhost:3001',
    endpoints: ['/health', '/api/products', '/api/users/profile']
  },
  web: {
    url: 'http://localhost:3002',
    pages: ['/', '/products', '/auth/login', '/dashboard']
  },
  database: {
    connectionString: process.env.DATABASE_URL || 'postgresql://qauser:qapass123@localhost:5432/qadb'
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  logFile: path.join(__dirname, '../logs/monitor.log'),
  checkInterval: 30000 // 30秒
};

// 日志记录
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  };
  
  console.log(`[${timestamp}] [${level}] ${message}`, data);
  
  // 写入日志文件
  const logDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(CONFIG.logFile, JSON.stringify(logEntry) + '\n');
}

// 检查HTTP服务
async function checkHttpService(url, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      const status = res.statusCode;
      
      if (status >= 200 && status < 400) {
        log('INFO', `${name} is healthy`, { url, status, responseTime });
        resolve({ success: true, status, responseTime });
      } else {
        log('WARN', `${name} returned non-success status`, { url, status, responseTime });
        resolve({ success: false, status, responseTime });
      }
    }).on('error', (err) => {
      log('ERROR', `${name} is down`, { url, error: err.message });
      resolve({ success: false, error: err.message });
    });
  });
}

// 检查数据库连接
async function checkDatabase() {
  return new Promise((resolve) => {
    exec(`psql "${CONFIG.database.connectionString}" -c "SELECT 1"`, (error, stdout, stderr) => {
      if (error) {
        log('ERROR', 'Database connection failed', { error: error.message });
        resolve({ success: false, error: error.message });
      } else {
        log('INFO', 'Database is healthy');
        resolve({ success: true });
      }
    });
  });
}

// 检查Redis连接
async function checkRedis() {
  return new Promise((resolve) => {
    exec(`redis-cli -h ${CONFIG.redis.host} -p ${CONFIG.redis.port} ping`, (error, stdout, stderr) => {
      if (error) {
        log('ERROR', 'Redis connection failed', { error: error.message });
        resolve({ success: false, error: error.message });
      } else if (stdout.trim() === 'PONG') {
        log('INFO', 'Redis is healthy');
        resolve({ success: true });
      } else {
        log('WARN', 'Redis returned unexpected response', { response: stdout });
        resolve({ success: false, response: stdout });
      }
    });
  });
}

// 检查磁盘空间
async function checkDiskSpace() {
  return new Promise((resolve) => {
    exec('df -h /', (error, stdout, stderr) => {
      if (error) {
        log('ERROR', 'Failed to check disk space', { error: error.message });
        resolve({ success: false, error: error.message });
      } else {
        const lines = stdout.split('\n');
        const dataLine = lines[1];
        const parts = dataLine.split(/\s+/);
        const usage = parseInt(parts[4]);
        
        if (usage > 90) {
          log('ERROR', 'Disk space critical', { usage: `${usage}%` });
          resolve({ success: false, usage });
        } else if (usage > 80) {
          log('WARN', 'Disk space warning', { usage: `${usage}%` });
          resolve({ success: true, warning: true, usage });
        } else {
          log('INFO', 'Disk space healthy', { usage: `${usage}%` });
          resolve({ success: true, usage });
        }
      }
    });
  });
}

// 检查内存使用
async function checkMemory() {
  return new Promise((resolve) => {
    exec('free -m', (error, stdout, stderr) => {
      if (error) {
        log('ERROR', 'Failed to check memory', { error: error.message });
        resolve({ success: false, error: error.message });
      } else {
        const lines = stdout.split('\n');
        const memLine = lines[1];
        const parts = memLine.split(/\s+/);
        const total = parseInt(parts[1]);
        const used = parseInt(parts[2]);
        const usage = Math.round((used / total) * 100);
        
        if (usage > 90) {
          log('ERROR', 'Memory usage critical', { usage: `${usage}%`, used, total });
          resolve({ success: false, usage });
        } else if (usage > 80) {
          log('WARN', 'Memory usage warning', { usage: `${usage}%`, used, total });
          resolve({ success: true, warning: true, usage });
        } else {
          log('INFO', 'Memory usage healthy', { usage: `${usage}%`, used, total });
          resolve({ success: true, usage });
        }
      }
    });
  });
}

// 检查进程
async function checkProcesses() {
  const processes = [
    { name: 'node', pattern: 'api' },
    { name: 'node', pattern: 'web' },
    { name: 'postgres', pattern: 'postgres' },
    { name: 'redis-server', pattern: 'redis-server' }
  ];
  
  const results = [];
  
  for (const proc of processes) {
    const result = await new Promise((resolve) => {
      exec(`pgrep -f "${proc.pattern}"`, (error, stdout, stderr) => {
        if (error) {
          log('WARN', `Process ${proc.name} (${proc.pattern}) not found`);
          resolve({ name: proc.name, pattern: proc.pattern, running: false });
        } else {
          const pids = stdout.trim().split('\n').filter(pid => pid);
          log('INFO', `Process ${proc.name} (${proc.pattern}) is running`, { pids });
          resolve({ name: proc.name, pattern: proc.pattern, running: true, pids });
        }
      });
    });
    results.push(result);
  }
  
  return results;
}

// 生成健康报告
function generateHealthReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    overall: 'HEALTHY',
    services: {},
    metrics: {},
    issues: []
  };
  
  // API健康状态
  const apiHealthy = results.api.every(r => r.success);
  report.services.api = apiHealthy ? 'HEALTHY' : 'UNHEALTHY';
  if (!apiHealthy) {
    report.overall = 'DEGRADED';
    report.issues.push('API service has issues');
  }
  
  // Web健康状态
  const webHealthy = results.web.every(r => r.success);
  report.services.web = webHealthy ? 'HEALTHY' : 'UNHEALTHY';
  if (!webHealthy) {
    report.overall = 'DEGRADED';
    report.issues.push('Web service has issues');
  }
  
  // 数据库健康状态
  report.services.database = results.database.success ? 'HEALTHY' : 'UNHEALTHY';
  if (!results.database.success) {
    report.overall = 'CRITICAL';
    report.issues.push('Database is down');
  }
  
  // Redis健康状态
  report.services.redis = results.redis.success ? 'HEALTHY' : 'UNHEALTHY';
  if (!results.redis.success) {
    report.overall = 'DEGRADED';
    report.issues.push('Redis is down');
  }
  
  // 系统指标
  report.metrics.diskUsage = `${results.disk.usage}%`;
  report.metrics.memoryUsage = `${results.memory.usage}%`;
  
  if (results.disk.usage > 80) {
    report.issues.push(`High disk usage: ${results.disk.usage}%`);
  }
  
  if (results.memory.usage > 80) {
    report.issues.push(`High memory usage: ${results.memory.usage}%`);
  }
  
  // 进程状态
  const criticalProcesses = results.processes.filter(p => !p.running);
  if (criticalProcesses.length > 0) {
    report.overall = report.overall === 'HEALTHY' ? 'DEGRADED' : report.overall;
    criticalProcesses.forEach(p => {
      report.issues.push(`Process ${p.name} (${p.pattern}) is not running`);
    });
  }
  
  return report;
}

// 主监控循环
async function monitor() {
  log('INFO', '=== Starting System Monitoring ===');
  
  const results = {
    api: [],
    web: [],
    database: null,
    redis: null,
    disk: null,
    memory: null,
    processes: []
  };
  
  // 检查API端点
  for (const endpoint of CONFIG.api.endpoints) {
    const result = await checkHttpService(`${CONFIG.api.url}${endpoint}`, `API ${endpoint}`);
    results.api.push(result);
  }
  
  // 检查Web页面
  for (const page of CONFIG.web.pages) {
    const result = await checkHttpService(`${CONFIG.web.url}${page}`, `Web ${page}`);
    results.web.push(result);
  }
  
  // 检查数据库
  results.database = await checkDatabase();
  
  // 检查Redis
  results.redis = await checkRedis();
  
  // 检查系统资源
  results.disk = await checkDiskSpace();
  results.memory = await checkMemory();
  
  // 检查进程
  results.processes = await checkProcesses();
  
  // 生成报告
  const report = generateHealthReport(results);
  
  // 记录报告
  log('INFO', '=== Health Report ===', report);
  
  // 保存报告到文件
  const reportFile = path.join(__dirname, '../logs/health-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  // 如果系统不健康，发送告警
  if (report.overall !== 'HEALTHY') {
    log('ERROR', `System is ${report.overall}`, { issues: report.issues });
    
    // 这里可以添加发送邮件、短信或其他告警通知的代码
  }
  
  return report;
}

// 启动监控
async function startMonitoring() {
  console.log('🔍 System Monitor Started');
  console.log(`📊 Monitoring interval: ${CONFIG.checkInterval / 1000} seconds`);
  console.log(`📝 Log file: ${CONFIG.logFile}`);
  console.log('');
  
  // 立即执行一次监控
  await monitor();
  
  // 定期执行监控
  setInterval(monitor, CONFIG.checkInterval);
}

// 优雅退出
process.on('SIGINT', () => {
  log('INFO', 'System monitor shutting down');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('INFO', 'System monitor shutting down');
  process.exit(0);
});

// 启动
startMonitoring();