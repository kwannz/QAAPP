import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db?schema=public';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  
  // Disable logging in tests
  process.env.LOG_LEVEL = 'error';
  
  // Web3 test configuration
  process.env.WEB3_RPC_URL = 'http://localhost:8545';
  process.env.PRIVATE_KEY = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
});

// Global test teardown
afterAll(async () => {
  // Cleanup after all tests
  jest.clearAllTimers();
  jest.restoreAllMocks();
});

// Setup test timeout
jest.setTimeout(30000);

// Mock external dependencies
jest.mock('ethers', () => ({
  Contract: jest.fn().mockImplementation(() => ({
    methods: {},
    call: jest.fn(),
    send: jest.fn(),
  })),
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1337 }),
    getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
  })),
  Wallet: jest.fn().mockImplementation(() => ({
    address: '0x1234567890123456789012345678901234567890',
    connect: jest.fn(),
  })),
  utils: {
    parseEther: jest.fn((value) => value),
    formatEther: jest.fn((value) => value),
  },
}));

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    flushall: jest.fn().mockResolvedValue('OK'),
  })),
}));

// Mock Prisma client
jest.mock('@qa-app/database', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock Winston logger
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

// Mock LRU Cache for performance optimization
jest.mock('lru-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    has: jest.fn().mockReturnValue(false),
  }));
});

// Mock ioredis for Redis caching
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    flushall: jest.fn().mockResolvedValue('OK'),
    pipeline: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
    multi: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
    disconnect: jest.fn().mockResolvedValue(undefined),
    status: 'ready',
  }));
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});