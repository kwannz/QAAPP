// Using simple mock tokens for testing

export interface MockUser {
  id: string;
  email: string;
  password: string;
  walletAddress: string;
  role: 'USER' | 'ADMIN';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isActive: boolean;
}

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  type: 'FIXED_INCOME' | 'BONDS' | 'CRYPTO_STAKING';
  expectedReturn: number;
  minInvestment: number;
  maxInvestment: number;
  duration: number;
  isActive: boolean;
}

export interface MockOrder {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  usdtAmount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  txHash?: string;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: generateId(),
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    walletAddress: generateWalletAddress(),
    role: 'USER',
    kycStatus: 'PENDING',
    isActive: true,
    ...overrides,
  };
}

export function createMockProduct(overrides: Partial<MockProduct> = {}): MockProduct {
  return {
    id: generateId(),
    name: `Test Product ${Date.now()}`,
    description: 'Test product description',
    type: 'FIXED_INCOME',
    expectedReturn: 8.5,
    minInvestment: 1000,
    maxInvestment: 100000,
    duration: 365,
    isActive: true,
    ...overrides,
  };
}

export function createMockOrder(overrides: Partial<MockOrder> = {}): MockOrder {
  return {
    id: generateId(),
    userId: generateId(),
    productId: generateId(),
    amount: 1000,
    usdtAmount: 1000,
    status: 'PENDING',
    ...overrides,
  };
}

export function createMockJwtToken(
  payload: Record<string, any> = {},
  secret: string = 'test-jwt-secret-for-testing'
): string {
  const defaultPayload = {
    sub: generateId(),
    email: 'test@example.com',
    role: 'USER',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    ...payload,
  };

  // Create a simple mock JWT token for testing
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify(defaultPayload)).toString('base64url');
  const signature = Buffer.from(`mock-signature-${Date.now()}`).toString('base64url');
  
  return `${header}.${payloadStr}.${signature}`;
}

export function createMockAdminToken(
  payload: Record<string, any> = {},
  secret: string = 'test-jwt-secret-for-testing'
): string {
  return createMockJwtToken(
    {
      ...payload,
      role: 'ADMIN',
      email: 'admin@example.com',
    },
    secret
  );
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateWalletAddress(): string {
  const hex = '0x' + Array.from({length: 40}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return hex;
}

export function mockPrismaQueryResult<T>(data: T): T {
  return data;
}

export function createMockPaginationResult<T>(
  data: T[], 
  page: number = 1, 
  limit: number = 10
) {
  const total = data.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: endIndex < total,
      hasPrev: page > 1,
    },
  };
}

export function expectValidationError(response: any, field: string) {
  expect(response.status).toBe(400);
  expect(response.body.message).toBeInstanceOf(Array);
  const errorMessage = response.body.message.join(' ').toLowerCase();
  expect(errorMessage).toContain(field.toLowerCase());
}

export function expectAuthenticationError(response: any) {
  expect(response.status).toBe(401);
  expect(response.body.message).toMatch(/unauthorized|invalid|token/i);
}

export function expectForbiddenError(response: any) {
  expect(response.status).toBe(403);
  expect(response.body.message).toMatch(/forbidden|access denied|permission/i);
}

export async function cleanupTestData(httpServer: any, adminToken: string) {
  // Helper to clean up test data between tests
  try {
    // This would typically clean test database entries
    // Implementation depends on your specific cleanup needs
  } catch (error) {
    console.warn('Test cleanup warning:', error.message);
  }
}