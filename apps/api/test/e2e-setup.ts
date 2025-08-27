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