/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  webpack: (config) => {
    // 支持Web3相关的Node.js模块
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // 优化bundle大小
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false
    };
    
    return config;
  },
  images: {
    domains: [
      'ipfs.io',
      'gateway.pinata.cloud', 
      'qa-app.s3.amazonaws.com',
      'avatars.githubusercontent.com'
    ],
    formats: ['image/webp', 'image/avif']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },
  // 启用SWC编译器优化
  swcMinify: true,
  
  // 安全头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.qa-app.com wss://api.qa-app.com https://*.infura.io https://*.alchemy.com https://*.quicknode.com;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;