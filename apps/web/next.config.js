/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', '@tanstack/react-query', 'framer-motion', 'recharts'],
    // 启用部分预渲染（Beta）
    ppr: false,
    // 启用CSS优化
    optimizeCss: true,
  },
  turbopack: {
    rules: {
      '*.svg': ['@svgr/webpack']
    }
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // 启用SWC minification
    styledComponents: true,
    // React optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? true : false,
  },
  // 启用压缩
  compress: true,
  // 启用静态优化
  trailingSlash: false,
  // PoweredBy header
  poweredByHeader: false,
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
          // 分离React生态系统 - 最高优先级，最常用
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 40,
            reuseExistingChunk: true,
          },
          // Next.js 核心
          nextjs: {
            test: /[\\/]node_modules[\\/](@next|next)[\\/]/,
            name: 'nextjs',
            chunks: 'all',
            priority: 35,
            reuseExistingChunk: true,
          },
          // 将大型UI库分离
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons|lucide-react|@radix-ui)[\\/]/,
            name: 'ui-icons',
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
          // 将Web3相关库分离 - 用于钱包页面
          web3: {
            test: /[\\/]node_modules[\\/](wagmi|viem|@wagmi|@rainbow-me|@walletconnect|@reown)[\\/]/,
            name: 'web3',
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
          // 将动画库分离 - 用于动效
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'animations',
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
          // 工具库
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|clsx|class-variance-authority)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          // 图表库分离 - 仅管理页面使用
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 15,
            reuseExistingChunk: true,
          },
          // 其他第三方库
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      }
    }
    
    // Bundle 分析 (disabled for now - using built-in analysis)
    // if (process.env.ANALYZE === 'true') {
    //   const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    //   config.plugins.push(new BundleAnalyzerPlugin())
    // }
    
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
  
  // 重定向配置 - Sprint 2 迁移策略
  async redirects() {
    return [
      // Admin page consolidation redirects
      {
        source: '/admin/users',
        destination: '/admin/operations?tab=users',
        statusCode: 307
      },
      {
        source: '/admin/products', 
        destination: '/admin/operations?tab=products',
        statusCode: 307
      },
      {
        source: '/admin/orders',
        destination: '/admin/operations?tab=orders', 
        statusCode: 307
      },
      {
        source: '/admin/agents',
        destination: '/admin/operations?tab=agents',
        statusCode: 307
      },
      {
        source: '/admin/withdrawals',
        destination: '/admin/operations?tab=withdrawals',
        statusCode: 307
      },
      {
        source: '/admin/commissions',
        destination: '/admin/analytics?tab=commissions',
        statusCode: 307
      },
      {
        source: '/admin/reports',
        destination: '/admin/analytics?tab=reports',
        statusCode: 307
      },
      {
        source: '/admin/notifications',
        destination: '/admin/analytics?tab=notifications',
        statusCode: 307
      },
      // Dashboard page consolidation redirects
      {
        source: '/dashboard/profile',
        destination: '/dashboard#profile',
        statusCode: 307
      },
      {
        source: '/dashboard/wallets',
        destination: '/dashboard#wallets', 
        statusCode: 307
      },
      {
        source: '/dashboard/notifications',
        destination: '/dashboard#notifications',
        statusCode: 307
      }
    ];
  },

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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:3001 ws://localhost:3001 https://api.qa-app.com wss://api.qa-app.com https://*.infura.io https://*.alchemy.com https://*.quicknode.com wss://*.walletconnect.org https://*.walletconnect.org https://*.web3modal.org https://pulse.walletconnect.org wss://relay.walletconnect.org https://*.reown.com;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;