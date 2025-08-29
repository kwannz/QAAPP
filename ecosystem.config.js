/**
 * PM2 生产环境配置文件
 * 用于管理 QA App 的所有服务进程
 */

module.exports = {
  apps: [
    {
      name: 'qa-api',
      script: './apps/api/dist/main.js',
      cwd: '/Users/zhaoleon/Downloads/QAAPP',
      instances: 2, // 运行2个实例以提供负载均衡
      exec_mode: 'cluster', // 集群模式
      env: {
        NODE_ENV: 'production',
        API_PORT: 3001,
        DATABASE_URL: 'postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public',
        REDIS_URL: 'redis://localhost:6379',
        LOG_LEVEL: 'info',
        ENABLE_METRICS: 'true',
        CORS_ORIGIN: 'http://localhost:3002,https://localhost:3002'
      },
      env_development: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug',
        watch: true,
        ignore_watch: ['node_modules', 'logs', '.git'],
        watch_options: {
          followSymlinks: false
        }
      },
      // 自动重启配置
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // 日志配置
      out_file: './logs/qa-api-out.log',
      error_file: './logs/qa-api-error.log',
      log_file: './logs/qa-api-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 健康检查
      health_check_grace_period: 3000,
      
      // 进程管理
      kill_timeout: 3000,
      listen_timeout: 8000,
      
      // 实例配置
      increment_var: 'API_INSTANCE_ID'
    },
    
    {
      name: 'qa-web',
      script: './apps/web/.next/standalone/server.js',
      cwd: '/Users/zhaoleon/Downloads/QAAPP',
      instances: 1, // Next.js 通常单实例运行
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOSTNAME: '0.0.0.0',
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
        NEXT_TELEMETRY_DISABLED: '1'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      
      // 自动重启配置
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // 日志配置
      out_file: './logs/qa-web-out.log',
      error_file: './logs/qa-web-error.log',
      log_file: './logs/qa-web-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 健康检查
      health_check_grace_period: 3000,
      
      // 进程管理
      kill_timeout: 5000,
      listen_timeout: 8000
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['localhost'],
      ref: 'origin/main',
      repo: 'git@github.com:qa-app/qa-app.git',
      path: '/var/www/qa-app',
      'pre-setup': 'echo "Pre-setup commands"',
      'post-setup': 'ls -la',
      'pre-deploy': 'git fetch --all',
      'post-deploy': `
        pnpm install &&
        pnpm run build &&
        pm2 reload ecosystem.config.js --env production &&
        pm2 save
      `,
      'pre-deploy-local': 'echo "Local pre-deploy"',
      'post-deploy-local': 'echo "Local post-deploy"',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};