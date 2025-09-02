#!/usr/bin/env node

/**
 * 生产环境启动脚本
 * 使用 PM2 管理进程，提供自动重启和监控功能
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出工具
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      code: error.status 
    };
  }
}

async function checkPM2() {
  log('\n🔍 检查 PM2...', 'blue');
  
  const pm2Installed = execCommand('command -v pm2', { silent: true });
  if (!pm2Installed.success) {
    log('⚠️  PM2 未找到，尝试安装...', 'yellow');
    const installResult = execCommand('pnpm install -g pm2');
    if (!installResult.success) {
      log('❌ PM2 安装失败', 'red');
      log('💡 请手动安装: npm install -g pm2', 'yellow');
      return false;
    }
  }
  
  log('✅ PM2 已就绪', 'green');
  return true;
}

async function createDirectories() {
  log('\n📁 创建必要目录...', 'blue');
  
  const directories = ['logs', 'temp'];
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ 创建目录: ${dir}`, 'green');
    } else {
      log(`✅ 目录已存在: ${dir}`, 'green');
    }
  });
}

async function setupEnvironment() {
  log('\n🔧 设置环境变量...', 'blue');
  
  // 设置生产环境变量
  process.env.NODE_ENV = 'production';
  process.env.LOG_LEVEL = 'info';
  
  // 读取DATABASE_URL from .env或使用默认值
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public';
    log('⚠️  使用默认 DATABASE_URL，建议在 .env 中配置', 'yellow');
  }
  
  // 验证数据库URL是PostgreSQL
  if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
    log('❌ DATABASE_URL 必须是 PostgreSQL 连接字符串', 'red');
    log('💡 正确格式: postgresql://user:password@host:port/database', 'yellow');
    process.exit(1);
  }
  
  process.env.API_PORT = process.env.API_PORT || '3001';
  process.env.WEB_PORT = process.env.WEB_PORT || '3002';
  process.env.ENABLE_METRICS = process.env.ENABLE_METRICS || 'true';
  
  // 确保环境文件存在
  if (!fs.existsSync('.env')) {
    if (fs.existsSync('.env.production')) {
      execCommand('cp .env.production .env');
      log('✅ 复制 .env.production 到 .env', 'green');
    } else if (fs.existsSync('.env.development')) {
      execCommand('cp .env.development .env');
      log('✅ 复制 .env.development 到 .env', 'green');
    } else {
      log('⚠️  环境配置文件未找到', 'yellow');
    }
  }
  
  log('✅ 环境变量设置完成', 'green');
}

async function stopExistingProcesses() {
  log('\n🛑 停止现有进程...', 'blue');
  
  // 停止 PM2 管理的进程
  const stopResult = execCommand('pm2 stop ecosystem.config.js', { silent: true });
  if (stopResult.success) {
    log('✅ 已停止 PM2 进程', 'green');
  }
  
  // 删除 PM2 进程
  const deleteResult = execCommand('pm2 delete ecosystem.config.js', { silent: true });
  if (deleteResult.success) {
    log('✅ 已删除 PM2 进程', 'green');
  }
  
  // 清理旧的 PID 文件
  const pidFiles = ['logs/api.pid', 'logs/web.pid'];
  pidFiles.forEach(pidFile => {
    if (fs.existsSync(pidFile)) {
      fs.unlinkSync(pidFile);
      log(`✅ 删除 PID 文件: ${pidFile}`, 'green');
    }
  });
}

async function startServices() {
  log('\n🚀 启动生产服务...', 'blue');
  
  // 启动 PM2 服务
  log('🔗 启动 API 和 Web 服务...', 'yellow');
  const startResult = execCommand('pm2 start ecosystem.config.js --env production');
  
  if (!startResult.success) {
    log('❌ 服务启动失败', 'red');
    return false;
  }
  
  // 保存 PM2 配置
  execCommand('pm2 save');
  
  log('✅ 服务启动成功', 'green');
  return true;
}

async function waitForServices() {
  log('\n⏳ 等待服务启动...', 'yellow');
  
  // 等待服务初始化
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // 显示 PM2 状态
  log('\n📊 服务状态:', 'blue');
  execCommand('pm2 status');
}

async function healthCheck() {
  log('\n🩺 执行健康检查...', 'blue');
  
  let apiHealthy = false;
  let webHealthy = false;
  
  // 检查 API 健康状态
  for (let i = 0; i < 5; i++) {
    const apiCheck = execCommand('curl -f http://localhost:3001/health', { silent: true });
    if (apiCheck.success) {
      apiHealthy = true;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 检查 Web 健康状态
  for (let i = 0; i < 5; i++) {
    const webCheck = execCommand('curl -f http://localhost:3002', { silent: true });
    if (webCheck.success) {
      webHealthy = true;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  if (apiHealthy) {
    log('✅ API 服务健康', 'green');
  } else {
    log('❌ API 服务健康检查失败', 'red');
  }
  
  if (webHealthy) {
    log('✅ Web 服务健康', 'green');
  } else {
    log('❌ Web 服务健康检查失败', 'red');
  }
  
  return { apiHealthy, webHealthy };
}

async function displayInfo() {
  log('\n🎉 生产服务启动完成！', 'green');
  log('=====================================', 'blue');
  
  log('📊 服务信息:', 'blue');
  log('  • API 服务: http://localhost:3001', 'green');
  log('  • Web 服务: http://localhost:3002', 'green');
  log('  • API 文档: http://localhost:3001/api', 'green');
  log('  • 健康检查: http://localhost:3001/health', 'green');
  
  log('\n📝 日志文件:', 'blue');
  log('  • API 日志: logs/qa-api-combined.log', 'green');
  log('  • Web 日志: logs/qa-web-combined.log', 'green');
  
  log('\n🔧 管理命令:', 'blue');
  log('  • 查看状态: pm2 status', 'green');
  log('  • 查看日志: pm2 logs', 'green');
  log('  • 重启服务: pm2 restart ecosystem.config.js', 'green');
  log('  • 停止服务: pm2 stop ecosystem.config.js', 'green');
  log('  • 删除进程: pm2 delete ecosystem.config.js', 'green');
  
  log('\n💡 提示:', 'yellow');
  log('  • 服务已配置自动重启', 'yellow');
  log('  • 日志会自动轮转和归档', 'yellow');
  log('  • 使用 PM2 Dashboard 查看详细监控', 'yellow');
}

async function main() {
  log('🚀 启动生产环境部署...', 'bold');
  log('=====================================', 'blue');
  
  try {
    // 检查依赖
    const pm2Ok = await checkPM2();
    if (!pm2Ok) {
      process.exit(1);
    }
    
    // 创建目录
    await createDirectories();
    
    // 设置环境
    await setupEnvironment();
    
    // 停止现有进程
    await stopExistingProcesses();
    
    // 启动服务
    const startOk = await startServices();
    if (!startOk) {
      process.exit(1);
    }
    
    // 等待服务启动
    await waitForServices();
    
    // 健康检查
    const { apiHealthy, webHealthy } = await healthCheck();
    
    // 显示信息
    await displayInfo();
    
    if (!apiHealthy || !webHealthy) {
      log('\n⚠️  某些服务可能未正常启动，请检查日志', 'yellow');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n💥 启动过程中出现错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接执行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkPM2,
  createDirectories,
  setupEnvironment,
  stopExistingProcesses,
  startServices,
  healthCheck
};