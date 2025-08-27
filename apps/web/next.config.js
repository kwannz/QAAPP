/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', '@tanstack/react-query', 'framer-motion'],
    // 开启并发特性
    concurrentFeatures: true,
    // 服务端组件优化
    serverComponentsExternalPackages: ['@prisma/client'],
    // 启用部分预渲染（Beta）
    ppr: false,
  },
  turbopack: {
    rules: {
      '*.svg': ['@svgr/webpack']
    }
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 支持Web3相关的Node.js模块
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // 优化bundle大小和修复indexedDB等浏览器API问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false
    };

    // 修复模块导入问题
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tanstack/react-query': require.resolve('@tanstack/react-query')
    };
    
    // 生产环境优化
    if (!dev && !isServer) {
      // 代码分割优化
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // 将大型UI库分离
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 20,
          },
          // 将动画库分离
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'animations',
            chunks: 'all',
            priority: 20,
          },
          // 将Web3相关库分离
          web3: {
            test: /[\\/]node_modules[\\/](wagmi|viem|@wagmi|@rainbow-me)[\\/]/,
            name: 'web3',
            chunks: 'all',
            priority: 20,
          },
        },
      }
    }
    
    // Bundle 分析
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('@next/bundle-analyzer')({
        enabled: true,
      })
      config.plugins.push(new BundleAnalyzerPlugin())
    }
    
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
  // SWC编译器优化已默认启用 (Next.js 15+)
  
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