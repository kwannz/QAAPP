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
    optimizePackageImports: ['lucide-react', 'date-fns', '@tanstack/react-query', 'framer-motion'],
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
    
    // 生产环境优化 - 使用Next.js默认的代码分割策略
    // 复杂的自定义splitChunks已被移除，使用Next.js的默认优化
    // 如果后续需要特定优化，可以根据性能指标再添加
    
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
    // CSP策略配置 - 可通过环境变量选择预设
    const cspPreset = process.env.CSP_PRESET || 'default';
    const cspPolicies = {
      default: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:3001 ws://localhost:3001 https://api.qa-app.com wss://api.qa-app.com https://*.infura.io https://*.alchemy.com https://*.quicknode.com wss://*.walletconnect.org https://*.walletconnect.org https://*.web3modal.org https://pulse.walletconnect.org wss://relay.walletconnect.org https://*.reown.com;",
      strict: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';",
      development: "default-src *; script-src * 'unsafe-eval' 'unsafe-inline'; style-src * 'unsafe-inline';"
    };

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
            value: cspPolicies[cspPreset] || cspPolicies.default
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;