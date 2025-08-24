# 🏗️ 全栈技术架构设计
## Web3固定收益平台技术实施方案

> **架构理念**：构建可扩展、高性能、安全可靠的混合式Web3金融平台，支持百万级用户并发使用

---

## 1. 🎯 整体架构概览

### 系统架构图
```
┌─────────────────────────────────────────────────────────┐
│                    客户端层                             │
├─────────────────────────────────────────────────────────┤
│  Next.js Frontend  │  Mobile App  │  Admin Dashboard    │
│  (React + TS)      │  (React Native) │  (React + TS)    │
└─────────────────────┴──────────────┴───────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                    网关层                               │
├─────────────────────────────────────────────────────────┤
│        NGINX + Cloudflare CDN + Rate Limiting          │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   应用服务层                             │
├─────────────────────────────────────────────────────────┤
│  NestJS API Gateway │ Auth Service │ Business Services   │
│  GraphQL + REST     │ JWT + RBAC   │ User/Product/Order  │
└─────────────────────┴──────────────┴───────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   数据存储层                             │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL  │    Redis      │   S3/R2    │  Blockchain  │
│  (主数据库)   │  (缓存+队列)   │  (文件存储) │  (合约数据)   │
└──────────────┴───────────────┴────────────┴─────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   基础设施层                             │
├─────────────────────────────────────────────────────────┤
│     Docker + Kubernetes + AWS/Vercel + Monitoring       │
└─────────────────────────────────────────────────────────┘
```

### 核心技术栈
```typescript
// 前端技术栈
const frontendStack = {
  framework: 'Next.js 14',
  language: 'TypeScript 5.0',
  styling: 'Tailwind CSS + shadcn/ui',
  stateManagement: 'Zustand + TanStack Query',
  web3: 'wagmi + viem + RainbowKit',
  testing: 'Jest + Playwright',
  deployment: 'Vercel'
};

// 后端技术栈
const backendStack = {
  framework: 'NestJS',
  language: 'TypeScript 5.0', 
  database: 'PostgreSQL + Prisma',
  cache: 'Redis + ioredis',
  queue: 'BullMQ',
  auth: 'JWT + Passport',
  api: 'GraphQL + REST',
  deployment: 'Docker + AWS ECS'
};

// Web3技术栈
const web3Stack = {
  contracts: 'Solidity + Hardhat',
  network: 'Polygon + Arbitrum',
  indexing: 'The Graph',
  storage: 'IPFS + Arweave',
  oracles: 'Chainlink',
  monitoring: 'Tenderly'
};
```

---

## 2. 📊 数据库架构设计

### 核心表结构优化
```sql
-- 用户表 (分区表)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role user_role DEFAULT 'USER',
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES users(id),
    kyc_status kyc_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 按月分区
CREATE TABLE users_2024_01 PARTITION OF users 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 钱包表 (支持多链)
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    chain_id INTEGER NOT NULL,
    address VARCHAR(42) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(chain_id, address)
);

-- 产品表 (支持动态配置)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL, -- SILVER/GOLD/DIAMOND
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_amount DECIMAL(20,6) NOT NULL,
    max_amount DECIMAL(20,6),
    apr_bps INTEGER NOT NULL, -- 基点表示，便于精确计算
    lock_days INTEGER NOT NULL,
    nft_token_id INTEGER UNIQUE,
    nft_metadata JSONB, -- NFT元数据
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 订单表 (高频写入，需要优化)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    usdt_amount DECIMAL(20,6) NOT NULL,
    platform_fee DECIMAL(20,6) DEFAULT 0,
    tx_hash VARCHAR(66), -- 以太坊交易哈希
    status order_status DEFAULT 'PENDING',
    referrer_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    INDEX idx_orders_user_status (user_id, status),
    INDEX idx_orders_tx_hash (tx_hash),
    INDEX idx_orders_created_at (created_at)
);

-- 持仓表 (与NFT一对一)
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    order_id INTEGER NOT NULL REFERENCES orders(id),
    principal DECIMAL(20,6) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_payout_at TIMESTAMP,
    nft_token_id INTEGER,
    nft_token_uri VARCHAR(500),
    status position_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_positions_user_status (user_id, status),
    INDEX idx_positions_next_payout (next_payout_at),
    INDEX idx_positions_end_date (end_date)
);

-- 收益分发表 (分区表，高频查询)
CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    position_id INTEGER NOT NULL REFERENCES positions(id),
    amount DECIMAL(20,6) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    is_claimable BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP,
    claim_tx_hash VARCHAR(66),
    merkle_index INTEGER, -- Merkle树索引
    merkle_proof JSONB,   -- Merkle证明
    batch_id VARCHAR(36),  -- 批次ID
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (period_start);

-- 佣金表 (分区表)
CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    order_id INTEGER NOT NULL REFERENCES orders(id),
    basis_amount DECIMAL(20,6) NOT NULL, -- 计算基数
    rate_bps INTEGER NOT NULL, -- 佣金比例(基点)
    amount DECIMAL(20,6) NOT NULL,
    commission_type commission_type NOT NULL, -- REFERRAL/AGENT
    status commission_status DEFAULT 'PENDING',
    settled_at TIMESTAMP,
    settlement_tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 审计日志表 (时序数据库风格)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(id),
    actor_type VARCHAR(20) DEFAULT 'USER',
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_audit_logs_actor (actor_id, created_at),
    INDEX idx_audit_logs_action (action, created_at),
    INDEX idx_audit_logs_resource (resource_type, resource_id)
);
```

### 数据库性能优化
```sql
-- 创建枚举类型
CREATE TYPE user_role AS ENUM ('USER', 'AGENT', 'ADMIN');
CREATE TYPE kyc_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE order_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELED');
CREATE TYPE position_status AS ENUM ('ACTIVE', 'REDEEMING', 'CLOSED', 'DEFAULTED');
CREATE TYPE commission_type AS ENUM ('REFERRAL', 'AGENT');
CREATE TYPE commission_status AS ENUM ('PENDING', 'READY', 'PAID', 'FAILED');

-- 创建复合索引
CREATE INDEX CONCURRENTLY idx_orders_user_product_status 
ON orders (user_id, product_id, status, created_at);

CREATE INDEX CONCURRENTLY idx_positions_user_active 
ON positions (user_id, status) WHERE status = 'ACTIVE';

CREATE INDEX CONCURRENTLY idx_payouts_claimable 
ON payouts (user_id, is_claimable, created_at) WHERE is_claimable = TRUE;

-- 创建函数索引
CREATE INDEX CONCURRENTLY idx_users_referral_code_lower 
ON users (LOWER(referral_code));

-- 创建部分索引
CREATE INDEX CONCURRENTLY idx_orders_pending 
ON orders (created_at) WHERE status = 'PENDING';

-- 创建GIN索引支持JSONB查询
CREATE INDEX CONCURRENTLY idx_audit_logs_metadata_gin 
ON audit_logs USING GIN (metadata);
```

### 数据库连接池配置
```typescript
// prisma/schema.prisma 优化配置
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema", "views", "fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

// 连接池配置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20'
    }
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error']
});

// 读写分离配置
const readReplica = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_READ_URL }
  }
});
```

---

## 3. 🔌 API 接口设计

### RESTful API 规范
```typescript
// API路由结构
const apiRoutes = {
  // 认证相关
  auth: {
    'POST /auth/register': '用户注册',
    'POST /auth/login': '用户登录',
    'POST /auth/refresh': '刷新Token',
    'POST /auth/logout': '用户登出',
    'POST /auth/wallet': '钱包连接认证'
  },
  
  // 用户相关
  users: {
    'GET /users/me': '获取用户信息',
    'PUT /users/me': '更新用户信息',
    'GET /users/me/wallets': '获取用户钱包',
    'POST /users/me/wallets': '添加钱包地址',
    'DELETE /users/me/wallets/:id': '删除钱包地址'
  },
  
  // 产品相关
  products: {
    'GET /products': '获取产品列表',
    'GET /products/:id': '获取产品详情',
    'GET /products/:id/stats': '获取产品统计信息'
  },
  
  // 订单相关
  orders: {
    'POST /orders/draft': '创建订单草稿',
    'POST /orders': '创建订单',
    'GET /orders': '获取订单列表',
    'GET /orders/:id': '获取订单详情',
    'POST /orders/:id/confirm': '确认订单'
  },
  
  // 持仓相关
  positions: {
    'GET /positions': '获取持仓列表',
    'GET /positions/:id': '获取持仓详情',
    'GET /positions/summary': '获取持仓汇总'
  },
  
  // 收益相关
  payouts: {
    'GET /payouts': '获取收益记录',
    'GET /payouts/claimable': '获取可领取收益',
    'POST /payouts/prepare-claim': '准备领取收益',
    'POST /payouts/claim': '领取收益'
  },
  
  // 推荐相关
  referral: {
    'GET /referral/stats': '获取推荐统计',
    'POST /referral/link': '生成推荐链接',
    'GET /referral/commissions': '获取佣金记录'
  }
};
```

### GraphQL Schema 设计
```graphql
type User {
  id: ID!
  email: String
  role: UserRole!
  referralCode: String!
  wallets: [Wallet!]!
  positions: [Position!]!
  totalInvestment: Float!
  totalRevenue: Float!
  claimableAmount: Float!
  referralStats: ReferralStats
  createdAt: DateTime!
}

type Product {
  id: ID!
  symbol: String!
  name: String!
  description: String
  minAmount: Float!
  maxAmount: Float
  apr: Float!
  lockDays: Int!
  nftTokenId: Int
  isActive: Boolean!
  stats: ProductStats
}

type Position {
  id: ID!
  user: User!
  product: Product!
  principal: Float!
  startDate: Date!
  endDate: Date!
  nextPayoutAt: DateTime
  status: PositionStatus!
  nftTokenId: Int
  expectedRevenue: Float!
  actualRevenue: Float!
  payouts: [Payout!]!
}

type Payout {
  id: ID!
  position: Position!
  amount: Float!
  periodStart: Date!
  periodEnd: Date!
  isClaimable: Boolean!
  claimedAt: DateTime
  claimTxHash: String
}

type ReferralStats {
  totalReferrals: Int!
  successfulReferrals: Int!
  totalCommission: Float!
  pendingCommission: Float!
}

type Query {
  me: User
  products(filter: ProductFilter): [Product!]!
  positions(filter: PositionFilter): [Position!]!
  payouts(filter: PayoutFilter): [Payout!]!
  referralStats: ReferralStats
}

type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  connectWallet(input: WalletInput!): User!
  createOrder(input: OrderInput!): Order!
  claimPayouts(positionIds: [ID!]!): ClaimResult!
}

type Subscription {
  orderStatusChanged(userId: ID!): Order!
  payoutDistributed(userId: ID!): Payout!
  priceUpdated(productId: ID!): Product!
}
```

### API响应格式标准
```typescript
// 统一响应格式
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId: string;
    timestamp: number;
    version: string;
  };
}

// 分页响应格式
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 实际响应示例
const successResponse: ApiResponse<Product[]> = {
  success: true,
  data: [
    {
      id: '1',
      symbol: 'SILVER',
      name: '银卡',
      minAmount: 100,
      apr: 12,
      lockDays: 365
    }
  ],
  meta: {
    requestId: 'req_1234567890',
    timestamp: Date.now(),
    version: '1.0.0'
  }
};

const errorResponse: ApiResponse = {
  success: false,
  error: {
    code: 'INSUFFICIENT_BALANCE',
    message: '余额不足',
    details: {
      required: 1000,
      available: 500
    }
  },
  meta: {
    requestId: 'req_1234567890',
    timestamp: Date.now(),
    version: '1.0.0'
  }
};
```

---

## 4. 🔐 认证与权限系统

### JWT + RBAC实现
```typescript
// JWT Payload 结构
interface JwtPayload {
  sub: string; // 用户ID
  email: string;
  role: UserRole;
  permissions: string[];
  wallets: string[]; // 关联的钱包地址
  iat: number;
  exp: number;
}

// 权限定义
const PERMISSIONS = {
  // 用户权限
  'user:read': '读取用户信息',
  'user:update': '更新用户信息',
  'wallet:connect': '连接钱包',
  'order:create': '创建订单',
  'payout:claim': '领取收益',
  
  // 代理权限
  'agent:stats': '查看代理统计',
  'agent:team': '管理团队',
  'commission:view': '查看佣金',
  
  // 管理员权限
  'admin:users': '用户管理',
  'admin:products': '产品管理',
  'admin:settlement': '结算管理',
  'admin:system': '系统管理'
};

// 角色权限映射
const ROLE_PERMISSIONS = {
  USER: [
    'user:read', 'user:update', 'wallet:connect',
    'order:create', 'payout:claim'
  ],
  AGENT: [
    ...ROLE_PERMISSIONS.USER,
    'agent:stats', 'agent:team', 'commission:view'
  ],
  ADMIN: [
    ...ROLE_PERMISSIONS.AGENT,
    'admin:users', 'admin:products', 
    'admin:settlement', 'admin:system'
  ]
};
```

### Web3签名认证
```typescript
// Web3登录流程
@Controller('auth')
export class AuthController {
  @Post('wallet/challenge')
  async getChallenge(@Body() { address }: { address: string }) {
    const nonce = randomBytes(32).toString('hex');
    const message = `Sign this message to authenticate: ${nonce}`;
    
    // 缓存challenge信息
    await this.redis.setex(`auth:${address}`, 300, nonce);
    
    return { message, nonce };
  }

  @Post('wallet/verify')
  async verifySignature(@Body() body: WalletAuthDto) {
    const { address, signature, message } = body;
    
    // 验证签名
    const recoveredAddress = verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }
    
    // 查找或创建用户
    let user = await this.userService.findByWallet(address);
    if (!user) {
      user = await this.userService.createFromWallet(address);
    }
    
    // 生成JWT
    const tokens = await this.authService.generateTokens(user);
    return tokens;
  }
}

// 签名验证工具
function verifyMessage(message: string, signature: string): string {
  const messageHash = hashMessage(message);
  const recoveredAddress = recoverAddress(messageHash, signature);
  return recoveredAddress;
}
```

---

## 5. ⚡ 实时数据同步

### WebSocket实现
```typescript
// WebSocket网关
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  namespace: 'app'
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  private userSockets = new Map<string, Socket>();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = await this.authService.verifyToken(token);
      
      client.data.userId = payload.sub;
      this.userSockets.set(payload.sub, client);
      
      // 加入用户房间
      client.join(`user:${payload.sub}`);
      
      // 发送初始数据
      await this.sendUserStats(payload.sub);
      
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
    }
  }

  // 订单状态更新
  async notifyOrderStatus(userId: string, order: Order) {
    this.server.to(`user:${userId}`).emit('order:status', {
      orderId: order.id,
      status: order.status,
      txHash: order.txHash
    });
  }

  // 收益分发通知
  async notifyPayoutDistributed(userId: string, payout: Payout) {
    this.server.to(`user:${userId}`).emit('payout:distributed', {
      amount: payout.amount,
      positionId: payout.positionId,
      claimable: payout.isClaimable
    });
  }

  // 价格更新推送
  @SubscribeMessage('subscribe:prices')
  async handlePriceSubscription(client: Socket, productIds: string[]) {
    for (const productId of productIds) {
      client.join(`prices:${productId}`);
    }
  }
}
```

### 区块链事件监听
```typescript
// 区块链事件监听服务
@Injectable()
export class BlockchainListenerService {
  private providers: Map<number, ethers.Provider> = new Map();
  private contracts: Map<string, ethers.Contract> = new Map();

  async onModuleInit() {
    // 初始化多链支持
    this.setupProviders();
    this.setupContracts();
    this.startEventListening();
  }

  private setupProviders() {
    const chains = [137, 42161]; // Polygon, Arbitrum
    
    chains.forEach(chainId => {
      const rpcUrl = process.env[`RPC_URL_${chainId}`];
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      this.providers.set(chainId, provider);
    });
  }

  private async startEventListening() {
    // 监听USDT存款事件
    const treasuryContract = this.contracts.get('treasury');
    treasuryContract.on('Deposited', async (user, amount, txHash) => {
      await this.handleDeposit(user, amount, txHash);
    });

    // 监听NFT铸造事件
    const nftContract = this.contracts.get('nft');
    nftContract.on('TransferSingle', async (operator, from, to, id, value) => {
      if (from === ethers.ZeroAddress) {
        await this.handleNFTMinted(to, id, value);
      }
    });

    // 监听收益分发事件
    const distributorContract = this.contracts.get('distributor');
    distributorContract.on('Claimed', async (user, amount, merkleIndex) => {
      await this.handlePayoutClaimed(user, amount, merkleIndex);
    });
  }

  private async handleDeposit(user: string, amount: bigint, txHash: string) {
    try {
      // 查找待确认的订单
      const order = await this.orderService.findPendingByTxHash(txHash);
      if (!order) return;

      // 确认订单
      await this.orderService.confirmOrder(order.id, {
        status: 'SUCCESS',
        confirmedAt: new Date()
      });

      // 创建持仓
      await this.positionService.createFromOrder(order);

      // 铸造NFT
      await this.nftService.mint(user, order.productId);

      // 通知前端
      await this.appGateway.notifyOrderStatus(order.userId, order);

    } catch (error) {
      this.logger.error('Failed to handle deposit', error);
    }
  }
}
```

---

## 6. 🚀 性能优化策略

### 缓存策略
```typescript
// Redis缓存配置
@Injectable()
export class CacheService {
  constructor(
    @InjectRedis() private redis: Redis,
    private configService: ConfigService
  ) {}

  // 产品信息缓存 (长期缓存)
  async getProduct(id: string): Promise<Product | null> {
    const cacheKey = `product:${id}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const product = await this.productService.findById(id);
    if (product) {
      await this.redis.setex(cacheKey, 3600 * 24, JSON.stringify(product));
    }
    
    return product;
  }

  // 用户统计信息缓存 (短期缓存)
  async getUserStats(userId: string): Promise<UserStats> {
    const cacheKey = `user:stats:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const stats = await this.userService.calculateStats(userId);
    await this.redis.setex(cacheKey, 300, JSON.stringify(stats)); // 5分钟缓存
    
    return stats;
  }

  // 热门数据预热
  async warmupCache() {
    const activeProducts = await this.productService.findActive();
    const promises = activeProducts.map(product => 
      this.getProduct(product.id)
    );
    
    await Promise.all(promises);
    this.logger.log(`Warmed up ${activeProducts.length} products`);
  }
}
```

### 数据库查询优化
```typescript
// 复杂查询优化
@Injectable()
export class PositionService {
  // 使用原生SQL优化复杂统计查询
  async getUserPositionStats(userId: string): Promise<PositionStats> {
    const result = await this.prisma.$queryRaw<PositionStatsRaw[]>`
      SELECT 
        COUNT(*) as total_positions,
        SUM(principal) as total_investment,
        SUM(
          CASE 
            WHEN status = 'ACTIVE' THEN principal * (products.apr_bps / 10000.0) * 
                 (EXTRACT(days FROM (LEAST(NOW(), end_date) - start_date)) / 365.0)
            ELSE 0 
          END
        ) as expected_revenue,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_positions,
        COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as closed_positions
      FROM positions p
      JOIN products ON p.product_id = products.id  
      WHERE p.user_id = ${userId}
    `;

    return this.transformPositionStats(result[0]);
  }

  // 批量查询优化
  async findUserPositionsWithPayouts(userId: string): Promise<PositionWithPayouts[]> {
    return await this.prisma.position.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            symbol: true,
            aprBps: true
          }
        },
        payouts: {
          where: { isClaimable: true },
          select: {
            id: true,
            amount: true,
            periodStart: true,
            periodEnd: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
```

### API性能优化
```typescript
// 响应时间中间件
@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      // 记录慢查询
      if (duration > 1000) {
        console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
      }
      
      // 设置性能头部
      res.set('X-Response-Time', `${duration}ms`);
    });
    
    next();
  }
}

// 查询结果压缩
@Controller()
export class BaseController {
  @Get('products')
  @UseInterceptors(CacheInterceptor)
  @Header('Cache-Control', 'public, max-age=3600')
  async getProducts(@Query() query: ProductQueryDto) {
    const products = await this.productService.findMany(query);
    
    // 返回时去除不必要的字段
    return products.map(product => ({
      id: product.id,
      symbol: product.symbol,
      name: product.name,
      minAmount: product.minAmount,
      apr: product.aprBps / 100,
      lockDays: product.lockDays,
      isActive: product.isActive
    }));
  }
}
```

---

## 7. 🔒 安全防护措施

### API安全防护
```typescript
// 速率限制配置
const rateLimitConfig = {
  // 全局限制
  global: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000 // 每个IP最多1000次请求
  },
  
  // 登录接口限制
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5, // 每15分钟最多5次登录尝试
    skipSuccessfulRequests: true
  },
  
  // 订单创建限制
  orders: {
    windowMs: 60 * 1000, // 1分钟
    max: 10, // 每分钟最多10个订单
    keyGenerator: (req) => req.user?.id || req.ip
  }
};

// 输入验证和消毒
@Controller('orders')
export class OrderController {
  @Post()
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle(10, 60) // 每分钟最多10次
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: User
  ) {
    // 数据验证
    await this.validateOrderData(dto, user);
    
    // 业务规则检查
    await this.checkBusinessRules(dto, user);
    
    // 创建订单
    return await this.orderService.create(dto, user);
  }

  private async validateOrderData(dto: CreateOrderDto, user: User) {
    // 检查用户KYC状态
    if (user.kycStatus !== 'APPROVED') {
      throw new ForbiddenException('KYC verification required');
    }

    // 检查投资限额
    const dailyLimit = await this.userService.getDailyLimit(user.id);
    if (dto.amount > dailyLimit) {
      throw new BadRequestException('Amount exceeds daily limit');
    }

    // 检查产品有效性
    const product = await this.productService.findById(dto.productId);
    if (!product || !product.isActive) {
      throw new BadRequestException('Product not available');
    }
  }
}
```

### SQL注入防护
```typescript
// 参数化查询
@Injectable()
export class UserService {
  // ✅ 安全的查询方式
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
  }

  // ✅ 使用Prisma的类型安全查询
  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { referralCode: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: Math.min(limit, 100), // 限制结果数量
      select: {
        id: true,
        email: true,
        referralCode: true,
        createdAt: true
      }
    });
  }

  // ✅ 复杂查询使用参数化原生SQL
  async getRevenueStats(userId: string, startDate: Date, endDate: Date) {
    return await this.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as daily_revenue
      FROM payouts 
      WHERE user_id = ${userId}
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
        AND claimed_at IS NOT NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
  }
}
```

### 数据加密存储
```typescript
// 敏感数据加密
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;

  constructor(private configService: ConfigService) {}

  encrypt(text: string): string {
    const key = Buffer.from(this.configService.get('ENCRYPTION_KEY'), 'hex');
    const iv = randomBytes(16);
    const cipher = createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const key = Buffer.from(this.configService.get('ENCRYPTION_KEY'), 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// 使用示例
@Entity('sensitive_data')
export class SensitiveData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ transformer: new EncryptedTransformer() })
  personalInfo: string; // 自动加密存储

  @Column({ transformer: new EncryptedTransformer() })
  kycDocuments: string; // 自动加密存储
}
```

---

## 8. 📊 监控与日志系统

### 应用监控
```typescript
// 健康检查端点
@Controller('health')
export class HealthController {
  constructor(
    @InjectRedis() private redis: Redis,
    private prisma: PrismaService
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkBlockchain(),
      this.checkExternalServices()
    ]);

    const status = checks.every(check => check.status === 'fulfilled') 
      ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0].status === 'fulfilled',
        redis: checks[1].status === 'fulfilled',
        blockchain: checks[2].status === 'fulfilled',
        external: checks[3].status === 'fulfilled'
      },
      uptime: process.uptime(),
      version: process.env.APP_VERSION
    };
  }

  private async checkDatabase(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    await this.redis.ping();
  }

  private async checkBlockchain(): Promise<void> {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    await provider.getBlockNumber();
  }
}

// 性能监控中间件
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
  });

  private httpRequestTotal = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  });

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.url;
      
      this.httpRequestDuration
        .labels(req.method, route, res.statusCode.toString())
        .observe(duration);
        
      this.httpRequestTotal
        .labels(req.method, route, res.statusCode.toString())
        .inc();
    });
    
    next();
  }
}
```

### 结构化日志
```typescript
// Winston日志配置
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        stack,
        ...meta,
        service: 'qa-app-backend',
        version: process.env.APP_VERSION
      });
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
};

// 业务事件日志
@Injectable()
export class AuditLogger {
  constructor(private logger: Logger) {}

  async logUserAction(
    userId: string, 
    action: string, 
    resource: string,
    metadata: any = {}
  ) {
    await this.prisma.auditLog.create({
      data: {
        actorId: parseInt(userId),
        action,
        resourceType: resource,
        metadata,
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent
      }
    });

    this.logger.log({
      event: 'user_action',
      userId,
      action,
      resource,
      metadata
    });
  }

  async logSystemEvent(event: string, data: any) {
    this.logger.log({
      event: 'system_event',
      type: event,
      data
    });
  }
}
```

---

## 🎯 **实施计划**

### Phase 1: 基础架构搭建 (Week 1-2)
- [x] 技术栈选型和架构设计
- [x] 数据库设计和优化
- [ ] 项目脚手架创建
- [ ] 基础中间件和工具类
- [ ] 认证授权系统

### Phase 2: 核心功能开发 (Week 3-6)
- [ ] 用户管理和钱包连接
- [ ] 产品管理和订单处理
- [ ] 持仓管理和收益计算
- [ ] 区块链集成和事件监听
- [ ] 实时通信和数据同步

### Phase 3: 高级功能实现 (Week 7-10)
- [ ] 推荐奖励系统
- [ ] 代理管理后台
- [ ] 批量结算和Merkle分发
- [ ] 管理员控制台
- [ ] 风控和合规检查

### Phase 4: 优化与部署 (Week 11-12)
- [ ] 性能优化和压力测试
- [ ] 安全审计和漏洞修复
- [ ] 监控告警和日志完善
- [ ] 生产环境部署
- [ ] 文档和培训

## 🚀 **架构优势**

这套全栈架构将提供：

✨ **高性能** - 多级缓存+数据库优化+CDN加速  
✨ **高可用** - 微服务架构+负载均衡+故障恢复  
✨ **高安全** - 多层防护+数据加密+权限控制  
✨ **高扩展** - 横向扩容+插件化+模块解耦  
✨ **高监控** - 全链路追踪+实时告警+性能分析  

准备开始创建项目脚手架了吗？我将为您构建一个能够支撑百万用户的企业级Web3平台！ 🏗️✨