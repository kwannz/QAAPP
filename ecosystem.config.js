// Read DATABASE_URL from environment with production fallback
const DB_URL = process.env.DATABASE_URL || 
               process.env.DATABASE_PROD_URL || 
               'postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public'

// Validate database URL
if (!DB_URL.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL must be a PostgreSQL connection string');
  process.exit(1);
}

module.exports = {
  apps: [
    {
      name: 'qa-api',
      script: 'npm',
      args: 'run start:prod',
      cwd: './apps/api',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: DB_URL,
        JWT_SECRET: process.env.JWT_SECRET || 'production-jwt-secret-change-in-production-env',
        LOG_LEVEL: 'info',
        ENABLE_METRICS: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: DB_URL,
        JWT_SECRET: process.env.JWT_SECRET || 'production-jwt-secret-change-in-production-env',
        LOG_LEVEL: 'info',
        ENABLE_METRICS: 'true'
      },
      pid_file: './logs/api.pid',
      out_file: './logs/qa-api-out.log',
      error_file: './logs/qa-api-error.log',
      log_file: './logs/qa-api-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5
    },
    {
      name: 'qa-web',
      script: 'node',
      args: 'dist/standalone/server.js',
      cwd: './apps/web',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        API_URL: 'http://localhost:3001',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        NEXT_PUBLIC_LOG_LEVEL: process.env.LOG_LEVEL || 'info'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        API_URL: 'http://localhost:3001',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        NEXT_PUBLIC_LOG_LEVEL: process.env.LOG_LEVEL || 'info'
      },
      pid_file: './logs/web.pid',
      out_file: './logs/qa-web-out.log',
      error_file: './logs/qa-web-error.log',
      log_file: './logs/qa-web-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5
    }
  ]
};
