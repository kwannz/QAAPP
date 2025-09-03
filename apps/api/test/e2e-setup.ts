// Mock bcrypt before any other imports to prevent native binding issues
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((data: string, saltRounds: number) => 
    Promise.resolve(`hashed_${data}_${saltRounds}`)
  ),
  compare: jest.fn().mockImplementation((data: string, encrypted: string) => 
    Promise.resolve(encrypted.startsWith('hashed_'))
  ),
  genSalt: jest.fn().mockImplementation((rounds: number) => 
    Promise.resolve(`salt_${rounds}`)
  ),
  hashSync: jest.fn().mockImplementation((data: string, saltRounds: number) => 
    `hashed_${data}_${saltRounds}`
  ),
  compareSync: jest.fn().mockImplementation((data: string, encrypted: string) => 
    encrypted.startsWith('hashed_')
  ),
  genSaltSync: jest.fn().mockImplementation((rounds: number) => 
    `salt_${rounds}`
  ),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

// Global test application instance
let app: INestApplication;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  // Store app in global for access in tests
  (global as any).app = app;
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

// Mock external services for e2e tests
jest.mock('ethers', () => ({
  Contract: jest.fn(),
  JsonRpcProvider: jest.fn(),
  Wallet: jest.fn(),
}));

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  })),
}));

// Mock performance optimization services
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
    disconnect: jest.fn().mockResolvedValue(undefined),
    status: 'ready',
  }));
});

jest.mock('lru-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    has: jest.fn().mockReturnValue(false),
  }));
});