# QAMini - Minimal Web3 Fixed-Income Platform

QAMini is a streamlined version of the QAAPP, containing only the core features necessary for a functional Web3 fixed-income platform. This minimal version focuses on essential business logic while maintaining production readiness.

## 🏗️ Architecture

**Monorepo Structure:**
- `apps/api/` - NestJS backend with core business logic
- `apps/web/` - Next.js frontend application
- `packages/database/` - Prisma ORM with PostgreSQL schema
- `packages/contracts/` - Smart contracts and blockchain integration
- `packages/shared/` - Shared types and utilities
- `packages/ui/` - Shared UI components

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.17.0
- pnpm >= 10.0.0
- PostgreSQL database
- Redis (optional, for caching)
- Hardhat (for blockchain development)

### Installation

1. **Clone and setup:**
```bash
cd qamini
pnpm install
```

2. **Environment setup:**
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Configure your database URL and other environment variables
```

3. **Database setup:**
```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

4. **Blockchain setup (optional):**
```bash
# Start local blockchain
pnpm blockchain:start

# In another terminal, deploy contracts
pnpm blockchain:deploy:local
```

5. **Build dependencies:**
```bash
pnpm build:deps
```

### Development

```bash
# Start development servers
pnpm dev
# API: http://localhost:3001
# Web: http://localhost:3002
```

### Production Deployment

```bash
# Build for production
pnpm build

# Start with PM2
pnpm pm2:start

# Monitor
pnpm pm2:logs
```

## 📦 Core Features

### ✅ Included in QAMini

**Authentication & Users**
- JWT-based authentication
- User registration and profile management
- Role-based access control

**Finance Module**
- Product management (fixed-income products)
- Order processing
- Transaction history
- Position tracking

**Core Infrastructure**
- Database optimization with Prisma
- Health monitoring
- Logging and error handling
- API rate limiting

**Frontend**
- Responsive dashboard
- Product browsing and investment
- User authentication flows
- Core UI components

**Blockchain Integration**
- Smart contracts for yield distribution
- Treasury management on-chain
- QA Card NFT system
- MockUSDT for testing
- Ethereum/Sepolia testnet support

### ❌ Excluded from QAMini

- Real-time WebSocket features (basic WebSocket module included)
- Advanced monitoring and alerting
- Redis caching layer (basic cache module included)
- Test suites and testing infrastructure
- Storybook component library
- CI/CD workflows
- Advanced admin features

## 🔧 Configuration

### Environment Variables

**API (.env):**
```
DATABASE_URL="postgresql://user:password@localhost:5432/qamini"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
NODE_ENV="development"
PORT=3001

# Blockchain Configuration
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your-private-key-for-deployment
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
ETHERSCAN_API_KEY=your-etherscan-api-key
```

**Web (.env.local):**
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NODE_ENV="development"
```

### Database

The system uses PostgreSQL with Prisma ORM. Key entities:
- Users (authentication and profiles)
- Products (fixed-income offerings)
- Orders (investment orders)
- Transactions (financial records)
- Positions (user holdings)

## 📚 API Documentation

Once running, access the Swagger documentation at:
- Development: http://localhost:3001/api/docs
- Production: https://your-domain.com/api/docs

## 🔍 Monitoring

### Health Checks
- API Health: `GET /health`
- Database Health: `GET /health/database`

### Logs
See `docs/LOGGING.md` for full logging and verbose options (API + Web). Production logs are managed by PM2:
```bash
pnpm pm2:logs
```

## 🧪 Testing & E2E Login

### Playwright E2E

- Run all E2E tests (web server auto-starts at port 3005):
```bash
pnpm test:e2e
```

### Login Flows (E2E)

There are two ways to validate “user logged-in” flows:

1) Simulated login (default, stable)
- Seeds `localStorage('qa-auth-storage')` before app loads, then opens `/dashboard?e2e_auth=skip`.
- File: `tests/e2e/auth-login.spec.ts`
- Run:
```bash
PLAYWRIGHT_BASE_URL=http://localhost:3005 pnpm test:e2e -- tests/e2e/auth-login.spec.ts
```

2) Real login against API (opt-in)
- Requires API to have JWT secrets configured and a seeded admin user.
- Enable with env var:
  - `PLAYWRIGHT_ALLOW_REAL_LOGIN=true`
- Optional env vars:
 - `PLAYWRIGHT_API_URL` (default `http://localhost:3001/api`)
  - `PLAYWRIGHT_LOGIN_EMAIL` (default `admin@qa-app.com`)
  - `PLAYWRIGHT_LOGIN_PASSWORD` (default `Admin123!`)
- Run (example):
```bash
PLAYWRIGHT_ALLOW_REAL_LOGIN=true \
PLAYWRIGHT_BASE_URL=http://localhost:3005 \
PLAYWRIGHT_API_URL=http://localhost:3001/api \
pnpm test:e2e -- tests/e2e/auth-login-real.spec.ts
```

#### Local API helper

Start only the API with required JWT envs for local/e2e:

```bash
pnpm start:api:local
```

#### CI (GitHub Actions)

This repo includes `.github/workflows/e2e-real-login.yml` to run the real login test against a local Postgres service. Trigger it via “Run workflow”. Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are configured as needed.

## 🛠️ Development Scripts

```bash
# Development
pnpm dev                    # Start development servers
pnpm build                  # Build all packages
pnpm lint                   # Run linting
pnpm type-check            # TypeScript validation

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:push               # Push schema changes
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed database

# Blockchain
pnpm blockchain:start      # Start local Hardhat network
pnpm blockchain:stop       # Stop local blockchain
pnpm blockchain:deploy:local    # Deploy contracts to localhost
pnpm blockchain:deploy:sepolia  # Deploy contracts to Sepolia
pnpm blockchain:test:local      # Test contracts on localhost
pnpm blockchain:verify:sepolia  # Verify contracts on Sepolia

# Production
pnpm start                 # Start production servers
pnpm pm2:start            # Start with PM2
pnpm pm2:stop             # Stop PM2 processes
pnpm health               # Check system health
```

## 📁 Project Structure

```
qamini/
├── apps/
│   ├── api/              # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── users/    # User management
│   │   │   ├── finance/  # Core business logic
│   │   │   ├── blockchain/ # Blockchain integration
│   │   │   ├── database/ # Database services
│   │   │   └── health/   # Health monitoring
│   │   └── package.json
│   └── web/              # Next.js Frontend
│       ├── app/          # App router pages
│       ├── components/   # React components
│       ├── hooks/        # Custom hooks
│       └── package.json
├── packages/
│   ├── contracts/       # Smart contracts (Hardhat)
│   ├── database/        # Prisma schema
│   ├── shared/          # Shared utilities
│   └── ui/              # UI components
├── scripts/             # Utility scripts
├── ecosystem.config.js  # PM2 configuration
└── package.json         # Root package
```

## 🤝 Contributing

This is a minimal version extracted from the full QAAPP. For development:

1. Keep the scope minimal - only add essential features
2. Maintain the modular architecture
3. Follow existing code patterns
4. Update this README when adding new features

## 📄 License

Private - Internal use only

---

**QAMini** - Web3固定收益平台精简版 | Simplified Web3 Fixed-Income Platform
