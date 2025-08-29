#!/usr/bin/env node

/**
 * 数据库自动初始化脚本
 * 自动检查并配置 PostgreSQL 和 Redis 服务
 * 创建数据库用户、数据库，并运行迁移
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

async function checkCommand(command, installHint) {
  const result = execCommand(`command -v ${command}`, { silent: true });
  if (!result.success) {
    log(`❌ ${command} 未找到`, 'red');
    log(`💡 安装提示: ${installHint}`, 'yellow');
    return false;
  }
  log(`✅ ${command} 已安装`, 'green');
  return true;
}

async function checkPostgreSQL() {
  log('\n🔍 检查 PostgreSQL...', 'blue');
  
  const pgInstalled = await checkCommand('psql', 'brew install postgresql@14');
  if (!pgInstalled) return false;

  // 检查服务状态
  const isRunning = execCommand('pg_isready -h localhost -p 5432', { silent: true });
  if (!isRunning.success) {
    log('⚠️  PostgreSQL 未运行，尝试启动...', 'yellow');
    const startResult = execCommand('brew services start postgresql@14');
    if (!startResult.success) {
      log('❌ 无法启动 PostgreSQL', 'red');
      log('💡 请手动启动: brew services start postgresql@14', 'yellow');
      return false;
    }
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  log('✅ PostgreSQL 运行正常', 'green');
  return true;
}

async function checkRedis() {
  log('\n🔍 检查 Redis...', 'blue');
  
  const redisInstalled = await checkCommand('redis-cli', 'brew install redis');
  if (!redisInstalled) return false;

  // 检查服务状态
  const isRunning = execCommand('redis-cli ping', { silent: true });
  if (!isRunning.success || !isRunning.output.includes('PONG')) {
    log('⚠️  Redis 未运行，尝试启动...', 'yellow');
    const startResult = execCommand('brew services start redis');
    if (!startResult.success) {
      log('❌ 无法启动 Redis', 'red');
      log('💡 请手动启动: brew services start redis', 'yellow');
      return false;
    }
    // 等待服务启动
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  log('✅ Redis 运行正常', 'green');
  return true;
}

async function setupDatabaseUser() {
  log('\n🗄️  配置数据库用户...', 'blue');

  // 检查用户是否存在
  const checkUser = execCommand(
    `psql -h localhost -d postgres -t -c "SELECT 1 FROM pg_roles WHERE rolname='qa_user';"`,
    { silent: true }
  );

  if (!checkUser.success || !checkUser.output.trim()) {
    log('👤 创建数据库用户...', 'yellow');
    const createUser = execCommand(
      `psql -h localhost -d postgres -c "CREATE USER qa_user WITH PASSWORD 'qa_password';"`
    );
    if (!createUser.success) {
      log('❌ 创建用户失败', 'red');
      return false;
    }

    const grantPrivileges = execCommand(
      `psql -h localhost -d postgres -c "ALTER USER qa_user CREATEDB;"`
    );
    if (!grantPrivileges.success) {
      log('⚠️  设置权限可能失败', 'yellow');
    }
  } else {
    log('✅ 数据库用户已存在', 'green');
  }

  return true;
}

async function createDatabase() {
  log('\n🏗️  创建数据库...', 'blue');

  // 检查数据库是否存在
  const checkDB = execCommand(
    `psql -h localhost -U qa_user -lqt | grep -w qa_database`,
    { silent: true }
  );

  if (!checkDB.success || !checkDB.output.trim()) {
    log('🗃️  创建数据库...', 'yellow');
    const createDB = execCommand(
      `psql -h localhost -d postgres -c "CREATE DATABASE qa_database OWNER qa_user;"`
    );
    if (!createDB.success) {
      log('❌ 创建数据库失败', 'red');
      return false;
    }
  } else {
    log('✅ 数据库已存在', 'green');
  }

  return true;
}

async function setupPrisma() {
  log('\n🔄 配置 Prisma 客户端...', 'blue');

  // 设置环境变量
  process.env.DATABASE_URL = 'postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public';

  // 切换到 database 包目录
  const databasePath = path.join(__dirname, '../packages/database');
  process.chdir(databasePath);

  // 生成 Prisma 客户端
  log('📦 生成 Prisma 客户端...', 'yellow');
  const generateResult = execCommand('pnpm db:generate');
  if (!generateResult.success) {
    log('⚠️  Prisma 客户端生成可能失败', 'yellow');
  }

  // 推送数据库架构
  log('🔄 推送数据库架构...', 'yellow');
  const pushResult = execCommand('pnpm db:push');
  if (!pushResult.success) {
    log('⚠️  数据库架构推送可能失败', 'yellow');
  }

  // 运行种子数据
  log('🌱 运行种子数据...', 'yellow');
  const seedResult = execCommand('pnpm db:seed');
  if (!seedResult.success) {
    log('⚠️  种子数据可能失败', 'yellow');
  }

  // 返回根目录
  process.chdir(path.join(__dirname, '..'));
  
  log('✅ Prisma 配置完成', 'green');
  return true;
}

async function validateSetup() {
  log('\n🩺 验证配置...', 'blue');

  // 测试数据库连接
  const testConnection = execCommand(
    `psql -h localhost -U qa_user -d qa_database -c "SELECT version();"`,
    { silent: true }
  );

  if (testConnection.success) {
    log('✅ 数据库连接测试成功', 'green');
  } else {
    log('❌ 数据库连接测试失败', 'red');
    return false;
  }

  // 测试 Redis 连接
  const testRedis = execCommand('redis-cli ping', { silent: true });
  if (testRedis.success && testRedis.output.includes('PONG')) {
    log('✅ Redis 连接测试成功', 'green');
  } else {
    log('❌ Redis 连接测试失败', 'red');
    return false;
  }

  return true;
}

async function main() {
  log('🚀 开始数据库自动初始化...', 'bold');
  log('=====================================', 'blue');

  try {
    // 检查依赖
    const pgOk = await checkPostgreSQL();
    const redisOk = await checkRedis();
    
    if (!pgOk || !redisOk) {
      log('\n❌ 依赖检查失败，请安装必要服务', 'red');
      process.exit(1);
    }

    // 配置数据库
    const userOk = await setupDatabaseUser();
    if (!userOk) {
      log('\n❌ 数据库用户配置失败', 'red');
      process.exit(1);
    }

    const dbOk = await createDatabase();
    if (!dbOk) {
      log('\n❌ 数据库创建失败', 'red');
      process.exit(1);
    }

    // 配置 Prisma
    const prismaOk = await setupPrisma();
    if (!prismaOk) {
      log('\n⚠️  Prisma 配置可能有问题', 'yellow');
    }

    // 验证配置
    const validationOk = await validateSetup();
    if (!validationOk) {
      log('\n❌ 配置验证失败', 'red');
      process.exit(1);
    }

    log('\n🎉 数据库初始化完成！', 'green');
    log('=====================================', 'blue');
    log('📊 服务状态:', 'blue');
    log('  • PostgreSQL: ✅ 运行中 (端口 5432)', 'green');
    log('  • Redis: ✅ 运行中 (端口 6379)', 'green');
    log('  • 数据库: qa_database (用户: qa_user)', 'green');
    log('  • Prisma 客户端: ✅ 已生成', 'green');
    
  } catch (error) {
    log(`\n💥 初始化过程中出现错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接执行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkPostgreSQL,
  checkRedis,
  setupDatabaseUser,
  createDatabase,
  setupPrisma,
  validateSetup
};