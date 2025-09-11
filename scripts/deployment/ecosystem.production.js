/**
 * QAapp 生产环境 PM2 配置文件
 * 服务器: 45.76.207.177
 * 
 * 使用方法:
 * 1. 启动: pm2 start ecosystem.production.js --env production
 * 2. 重启: pm2 restart ecosystem.production.js --env production
 * 3. 停止: pm2 stop ecosystem.production.js
 * 4. 删除: pm2 delete ecosystem.production.js
 * 5. 查看状态: pm2 status
 * 6. 查看日志: pm2 logs
 */

// 从环境变量读取数据库连接字符串
const DB_URL = process.env.DATABASE_URL || 
               process.env.DATABASE_PROD_URL || 
               'postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public';

// 验证数据库 URL
if (!DB_URL.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL 必须是 PostgreSQL 连接字符串');
  process.exit(1);
}

// 从环境变量读取 JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'production-jwt-secret-change-in-production-env';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'production-refresh-secret-change-in-production-env';

// 检查生产环境密钥安全性
if (JWT_SECRET.includes('change-in-production') || JWT_REFRESH_SECRET.includes('change-in-production')) {
  console.warn('⚠️ 警告: 请在生产环境中设置安全的 JWT 密钥');
}

module.exports = {
  apps: [
    {
      // API 服务配置
      name: 'qa-api',
      script: 'node',
      args: 'dist/apps/api/src/main.js',
      cwd: '/var/www/qaapp/apps/api',
      instances: 1,  // 单实例，避免数据库连接问题
      exec_mode: 'fork',
      
      // 生产环境变量
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: DB_URL,
        JWT_SECRET: JWT_SECRET,
        JWT_REFRESH_SECRET: JWT_REFRESH_SECRET,
        JWT_EXPIRES_IN: '7d',
        
        // 日志配置
        LOG_LEVEL: 'info',
        ENABLE_METRICS: 'true',
        
        // 性能配置
        NODE_OPTIONS: '--max-old-space-size=1024',
        UV_THREADPOOL_SIZE: 4,
        
        // 安全配置
        HELMET_ENABLED: 'true',
        RATE_LIMIT_ENABLED: 'true',
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://45.76.207.177',
        
        // 数据库连接池
        DB_POOL_MIN: 2,
        DB_POOL_MAX: 10,
        DB_CONNECTION_TIMEOUT: 60000,
        DB_IDLE_TIMEOUT: 600000,
        
        // Redis 配置 (如果使用)
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        REDIS_ENABLED: process.env.REDIS_ENABLED || 'false'
      },
      
      // 进程管理配置
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 4000,
      
      // 日志配置
      pid_file: '/var/log/qaapp/api.pid',
      out_file: '/var/log/qaapp/api-out.log',
      error_file: '/var/log/qaapp/api-error.log',
      log_file: '/var/log/qaapp/api-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 健康检查
      health_check_grace_period: 10000,
      
      // 环境特定配置
      node_args: '--max-old-space-size=1024',
      
      // 错误处理
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // 监控配置
      pmx: true,
      vizion: false
    },
    
    {
      // Web 前端服务配置
      name: 'qa-web',
      script: 'node',
      args: 'dist/standalone/apps/web/server.js',
      cwd: '/var/www/qaapp/apps/web',
      instances: 1,  // 单实例，Next.js 已优化并发处理
      exec_mode: 'fork',
      
      // 生产环境变量
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        
        // API 连接配置
        API_URL: 'http://localhost:3001',
        NEXT_PUBLIC_API_URL: 'http://45.76.207.177/api',
        
        // Web3 配置
        NEXT_PUBLIC_ENABLE_TESTNET: 'false',
        NEXT_PUBLIC_DISABLE_WALLETCONNECT: 'true',
        NEXT_PUBLIC_CHAIN_ID: '1',
        
        // RPC 端点
        NEXT_PUBLIC_ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/your-api-key',
        NEXT_PUBLIC_POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        
        // 应用配置
        NEXT_PUBLIC_ENVIRONMENT: 'production',
        NEXT_PUBLIC_DEVELOPMENT_MODE: 'false',
        
        // PWA 配置
        NEXT_PUBLIC_APP_NAME: 'QA Fixed Income Platform',
        NEXT_PUBLIC_APP_SHORT_NAME: 'QA App',
        NEXT_PUBLIC_APP_DESCRIPTION: 'Web3固定收益投资平台',
        
        // 日志配置
        LOG_LEVEL: 'info',
        NEXT_PUBLIC_LOG_LEVEL: 'info',
        
        // 性能配置
        NODE_OPTIONS: '--max-old-space-size=1024',
        
        // Next.js 特定配置
        NEXT_TELEMETRY_DISABLED: '1'
      },
      
      // 进程管理配置
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 4000,
      
      // 日志配置
      pid_file: '/var/log/qaapp/web.pid',
      out_file: '/var/log/qaapp/web-out.log',
      error_file: '/var/log/qaapp/web-error.log',
      log_file: '/var/log/qaapp/web-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 健康检查
      health_check_grace_period: 15000,
      
      // 环境特定配置
      node_args: '--max-old-space-size=1024',
      
      // 错误处理
      kill_timeout: 5000,
      listen_timeout: 10000,
      
      // 监控配置
      pmx: true,
      vizion: false
    }
  ],
  
  /**
   * 部署配置 (可选)
   * 用于 PM2 deploy 功能
   */
  deploy: {
    production: {
      user: 'root',
      host: '45.76.207.177',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/qaapp.git',  // 请替换为实际仓库地址
      path: '/var/www/qaapp-deploy',
      'post-deploy': 'pnpm install --frozen-lockfile && pnpm run build && pm2 reload ecosystem.production.js --env production && pm2 save'
    }
  },
  
  /**
   * PM2+ 监控配置 (可选)
   */
  // pmx: {
  //   http: true,
  //   ignore_routes: [/socket\.io/, /notFound/],
  //   errors: true,
  //   custom_probes: true,
  //   network: true,
  //   ports: true
  // }
};

// 配置验证函数
function validateConfig() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 缺少必要的环境变量:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('请设置这些环境变量后重新启动');
    process.exit(1);
  }
  
  console.log('✅ PM2 配置验证通过');
}

// 如果直接运行此文件，执行配置验证
if (require.main === module) {
  validateConfig();
}