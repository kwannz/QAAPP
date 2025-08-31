module.exports = {
  apps: [
    {
      name: 'qa-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        // 使用环境变量开关
        USE_GRAPHQL: process.env.USE_GRAPHQL || 'false',
        CACHE_L2_ENABLED: process.env.CACHE_L2_ENABLED || 'false',
        WEBSOCKET_ENABLED: process.env.WEBSOCKET_ENABLED || 'false',
        CSP_PRESET: process.env.CSP_PRESET || 'default'
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    {
      name: 'qa-web',
      cwd: './apps/web',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        CSP_PRESET: process.env.CSP_PRESET || 'default'
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true
    }
  ]
};