#!/usr/bin/env node

/**
 * 验证架构冲突修复的脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证架构冲突修复...\n');

let errors = 0;
let warnings = 0;
let success = 0;

// 检查环境变量配置
function checkEnvConfig() {
  console.log('📋 检查环境变量配置...');
  
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env 文件不存在');
    errors++;
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  // 检查Mock服务开关
  const mockFlags = [
    'USE_MOCK_DATABASE=false',
    'USE_MOCK_AUTH=false',
    'USE_MOCK_SERVICES=false'
  ];
  
  mockFlags.forEach(flag => {
    if (envContent.includes(flag)) {
      console.log(`✅ ${flag} 已正确设置`);
      success++;
    } else {
      console.error(`❌ ${flag} 未设置或设置错误`);
      errors++;
    }
  });
}

// 检查数据库模块配置
function checkDatabaseModule() {
  console.log('\n📋 检查数据库模块配置...');
  
  const dbModulePath = path.join(__dirname, '..', 'apps/api/src/database/database.module.ts');
  const content = fs.readFileSync(dbModulePath, 'utf-8');
  
  // 检查是否有条件性加载
  if (content.includes('useFactory') && content.includes('ConfigService')) {
    console.log('✅ 数据库服务使用工厂模式条件加载');
    success++;
  } else {
    console.error('❌ 数据库服务未使用条件加载');
    errors++;
  }
  
  // 检查是否不再直接使用MockDatabaseService
  if (content.includes('useExisting: MockDatabaseService')) {
    console.error('❌ 仍在直接使用MockDatabaseService覆盖');
    errors++;
  } else {
    console.log('✅ 不再直接覆盖为MockDatabaseService');
    success++;
  }
}

// 检查认证模块配置
function checkAuthModule() {
  console.log('\n📋 检查认证模块配置...');
  
  const authModulePath = path.join(__dirname, '..', 'apps/api/src/auth/auth.module.ts');
  const content = fs.readFileSync(authModulePath, 'utf-8');
  
  // 检查是否有条件性加载
  if (content.includes('useFactory') && content.includes('USE_MOCK_AUTH')) {
    console.log('✅ 认证服务使用工厂模式条件加载');
    success++;
  } else {
    console.error('❌ 认证服务未使用条件加载');
    errors++;
  }
  
  // 检查是否不再直接使用MockAuthService
  if (content.includes('useClass: MockAuthService') && !content.includes('useFactory')) {
    console.error('❌ 仍在直接使用MockAuthService');
    errors++;
  } else {
    console.log('✅ 不再直接使用MockAuthService');
    success++;
  }
}

// 检查Mock模块配置
function checkMockModule() {
  console.log('\n📋 检查Mock模块配置...');
  
  const mockModulePath = path.join(__dirname, '..', 'apps/api/src/mock/mock.module.ts');
  const content = fs.readFileSync(mockModulePath, 'utf-8');
  
  // 检查是否有条件性提供服务
  if (content.includes('useFactory') && content.includes('USE_MOCK_SERVICES')) {
    console.log('✅ Mock模块使用条件性服务提供');
    success++;
  } else {
    console.warn('⚠️  Mock模块可能未使用条件性服务提供');
    warnings++;
  }
}

// 检查App模块配置
function checkAppModule() {
  console.log('\n📋 检查App模块配置...');
  
  const appModulePath = path.join(__dirname, '..', 'apps/api/src/app.module.ts');
  const content = fs.readFileSync(appModulePath, 'utf-8');
  
  // 检查MockModule是否条件加载
  if (content.includes("process.env.NODE_ENV === 'test'") || 
      content.includes("USE_MOCK_SERVICES === 'true'")) {
    console.log('✅ MockModule条件加载');
    success++;
  } else if (content.includes('MockModule')) {
    console.error('❌ MockModule未条件加载');
    errors++;
  } else {
    console.warn('⚠️  MockModule可能已被移除');
    warnings++;
  }
}

// 检查PrismaService的使用
function checkPrismaServiceUsage() {
  console.log('\n📋 检查PrismaService使用情况...');
  
  const srcPath = path.join(__dirname, '..', 'apps/api/src');
  let prismaImports = 0;
  let databaseImports = 0;
  
  function checkDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        checkDirectory(filePath);
      } else if (file.endsWith('.ts') && !file.includes('.spec.')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes("from '../prisma/prisma.service'")) {
          prismaImports++;
          console.warn(`⚠️  ${filePath.replace(srcPath, '')} 仍在导入PrismaService`);
        }
        if (content.includes("from '../database/database.service'") ||
            content.includes("from './database/database.service'")) {
          databaseImports++;
        }
      }
    });
  }
  
  checkDirectory(srcPath);
  
  if (prismaImports === 0) {
    console.log('✅ 没有文件导入PrismaService');
    success++;
  } else {
    console.warn(`⚠️  还有 ${prismaImports} 个文件导入PrismaService`);
    warnings++;
  }
  
  console.log(`ℹ️  共有 ${databaseImports} 个文件使用DatabaseService`);
}

// 运行所有检查
function runAllChecks() {
  checkEnvConfig();
  checkDatabaseModule();
  checkAuthModule();
  checkMockModule();
  checkAppModule();
  checkPrismaServiceUsage();
  
  // 输出总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 验证结果总结：');
  console.log('='.repeat(50));
  console.log(`✅ 成功: ${success} 项`);
  console.log(`⚠️  警告: ${warnings} 项`);
  console.log(`❌ 错误: ${errors} 项`);
  
  if (errors === 0) {
    console.log('\n🎉 所有关键修复已完成！');
    if (warnings > 0) {
      console.log('⚠️  存在一些警告，建议进一步检查。');
    }
    process.exit(0);
  } else {
    console.log('\n❌ 存在错误需要修复！');
    process.exit(1);
  }
}

// 执行检查
runAllChecks();