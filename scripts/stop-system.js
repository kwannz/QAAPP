#!/usr/bin/env node

/**
 * 系统停止脚本
 * 优雅地停止所有 QA App 服务
 */

const { execSync } = require('child_process');
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

async function stopPM2Services() {
  log('\n🛑 停止 PM2 服务...', 'blue');

  // 检查 PM2 是否安装
  const pm2Check = execCommand('command -v pm2', { silent: true });
  if (!pm2Check.success) {
    log('⚠️  PM2 未找到，跳过 PM2 服务停止', 'yellow');
    return true;
  }

  // 获取当前 PM2 进程列表
  const listResult = execCommand('pm2 list --no-color', { silent: true });
  if (!listResult.success || !listResult.output.includes('qa-')) {
    log('✅ 没有运行的 PM2 服务', 'green');
    return true;
  }

  // 停止所有 QA App 相关服务
  log('🔄 停止 QA App 服务...', 'yellow');
  const stopResult = execCommand('pm2 stop ecosystem.config.js', { silent: true });
  if (stopResult.success) {
    log('✅ PM2 服务已停止', 'green');
  } else {
    log('⚠️  停止 PM2 服务可能失败', 'yellow');
  }

  // 删除 PM2 进程
  log('🗑️  删除 PM2 进程...', 'yellow');
  const deleteResult = execCommand('pm2 delete ecosystem.config.js', { silent: true });
  if (deleteResult.success) {
    log('✅ PM2 进程已删除', 'green');
  } else {
    log('⚠️  删除 PM2 进程可能失败', 'yellow');
  }

  return true;
}

async function stopLegacyProcesses() {
  log('\n🔍 查找并停止遗留进程...', 'blue');

  const pidFiles = [
    'logs/api.pid',
    'logs/web.pid'
  ];

  let stoppedProcesses = 0;

  for (const pidFile of pidFiles) {
    if (fs.existsSync(pidFile)) {
      try {
        const pid = fs.readFileSync(pidFile, 'utf8').trim();
        if (pid) {
          // 检查进程是否存在
          const processExists = execCommand(`kill -0 ${pid}`, { silent: true });
          if (processExists.success) {
            log(`🔄 停止进程 ${pid}...`, 'yellow');
            const killResult = execCommand(`kill ${pid}`, { silent: true });
            if (killResult.success) {
              log(`✅ 进程 ${pid} 已停止`, 'green');
              stoppedProcesses++;
            } else {
              log(`⚠️  强制停止进程 ${pid}...`, 'yellow');
              execCommand(`kill -9 ${pid}`, { silent: true });
              stoppedProcesses++;
            }
          }
        }
        fs.unlinkSync(pidFile);
        log(`✅ 删除 PID 文件: ${pidFile}`, 'green');
      } catch (error) {
        log(`⚠️  处理 PID 文件失败: ${pidFile}`, 'yellow');
      }
    }
  }

  if (stoppedProcesses === 0) {
    log('✅ 没有发现遗留进程', 'green');
  } else {
    log(`✅ 停止了 ${stoppedProcesses} 个遗留进程`, 'green');
  }
}

async function stopPortProcesses() {
  log('\n🔌 检查并停止端口占用进程...', 'blue');

  const ports = [3001, 3002]; // API 和 Web 端口
  let stoppedPorts = 0;

  for (const port of ports) {
    const portCheck = execCommand(`lsof -ti:${port}`, { silent: true });
    if (portCheck.success && portCheck.output.trim()) {
      const pids = portCheck.output.trim().split('\n');
      for (const pid of pids) {
        if (pid) {
          log(`🔄 停止端口 ${port} 上的进程 ${pid}...`, 'yellow');
          const killResult = execCommand(`kill ${pid}`, { silent: true });
          if (!killResult.success) {
            log(`⚠️  强制停止进程 ${pid}...`, 'yellow');
            execCommand(`kill -9 ${pid}`, { silent: true });
          }
          stoppedPorts++;
        }
      }
      log(`✅ 端口 ${port} 已释放`, 'green');
    }
  }

  if (stoppedPorts === 0) {
    log('✅ 没有端口占用进程需要停止', 'green');
  } else {
    log(`✅ 释放了 ${stoppedPorts} 个端口进程`, 'green');
  }
}



async function cleanupLogs() {
  log('\n🧹 清理临时文件...', 'blue');

  // 不删除日志文件，只清理临时文件
  const tempDirs = ['temp', '.turbo/cache'];
  let cleanedFiles = 0;

  for (const dir of tempDirs) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          if (file.startsWith('temp-') || file.endsWith('.tmp')) {
            fs.unlinkSync(filePath);
            cleanedFiles++;
          }
        }
      } catch (error) {
        log(`⚠️  清理目录失败: ${dir}`, 'yellow');
      }
    }
  }

  if (cleanedFiles > 0) {
    log(`✅ 清理了 ${cleanedFiles} 个临时文件`, 'green');
  } else {
    log('✅ 没有临时文件需要清理', 'green');
  }
}

async function displayStatus() {
  log('\n📊 最终状态检查...', 'blue');

  // 检查端口状态
  const ports = [3001, 3002];
  for (const port of ports) {
    const portCheck = execCommand(`lsof -ti:${port}`, { silent: true });
    if (portCheck.success && portCheck.output.trim()) {
      log(`⚠️  端口 ${port} 仍被占用`, 'yellow');
    } else {
      log(`✅ 端口 ${port} 已释放`, 'green');
    }
  }

  // 检查 PM2 状态
  const pm2Check = execCommand('pm2 list --no-color', { silent: true });
  if (pm2Check.success && pm2Check.output.includes('qa-')) {
    log('⚠️  仍有 PM2 进程运行', 'yellow');
    execCommand('pm2 list');
  } else {
    log('✅ 没有 PM2 进程运行', 'green');
  }
}

async function main() {
  log('🛑 开始停止 QA App 系统...', 'bold');
  log('=====================================', 'blue');

  try {
    // 停止 PM2 服务
    await stopPM2Services();

    // 停止遗留进程
    await stopLegacyProcesses();

    // 停止端口占用进程
    await stopPortProcesses();

    // 清理临时文件
    await cleanupLogs();

    // 显示最终状态
    await displayStatus();

    log('\n🎯 系统停止完成！', 'green');
    log('=====================================', 'blue');

    log('💡 提示:', 'yellow');
    log('  • 所有服务已停止', 'green');
    log('  • 日志文件已保留', 'green');
    log('  • 数据库和 Redis 服务未受影响', 'green');
    log('  • 临时文件已清理', 'green');

    log('\n🔧 重新启动命令:', 'blue');
    log('  • 开发模式: pnpm run start:dev', 'green');
    log('  • 生产模式: pnpm run start', 'green');


  } catch (error) {
    log(`\n💥 停止过程中出现错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 处理 SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  log('\n\n🚨 接收到停止信号，正在优雅退出...', 'yellow');
  main();
});

// 如果直接执行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  stopPM2Services,
  stopLegacyProcesses,
  stopPortProcesses,
  cleanupLogs
};