#!/usr/bin/env node

/**
 * Test Data Generation Script
 * 
 * Generates comprehensive test data for the QA App including:
 * - Users with various profiles
 * - Investment orders 
 * - Transactions and balances
 * - Referral relationships
 * - Commission records
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

// Database configuration
const DATABASE_CONFIG = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  database: process.env.DATABASE_NAME || 'qa_database',
  user: process.env.DATABASE_USER || 'qa_user',
  password: process.env.DATABASE_PASSWORD || 'qa_password_2024'
};

// Test data configuration
const CONFIG = {
  USERS_COUNT: 100,
  ORDERS_COUNT: 500,
  TRANSACTIONS_COUNT: 1000,
  MAX_REFERRAL_DEPTH: 3,
  BATCH_SIZE: 20
};

class TestDataGenerator {
  constructor() {
    this.prisma = new PrismaClient();
    this.verboseLogging = process.env.LOG_LEVEL === 'VERBOSE';
    this.startTime = Date.now();
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logLevels = ['VERBOSE', 'INFO', 'WARN', 'ERROR'];
    const levelNum = logLevels.indexOf(level.toUpperCase());
    const enabledLevel = logLevels.indexOf((process.env.LOG_LEVEL || 'INFO').toUpperCase());
    
    if (levelNum >= enabledLevel) {
      console.log(`[${timestamp}] [${level.padEnd(7)}] [TestDataGen] ${message}`);
      if (data && this.verboseLogging) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  async connect() {
    this.log('INFO', 'Connecting to database...');
    try {
      await this.client.connect();
      this.log('INFO', 'Database connection established');
      
      // Test connection
      const result = await this.client.query('SELECT NOW()');
      this.log('VERBOSE', 'Database connection test successful', { serverTime: result.rows[0].now });
    } catch (error) {
      this.log('ERROR', 'Failed to connect to database', { error: error.message });
      throw error;
    }
  }

  async disconnect() {
    await this.client.end();
    this.log('INFO', 'Database connection closed');
  }

  // Generate realistic user data
  generateUserData(index) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    return {
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: 'Test123!', // Will be hashed
      firstName,
      lastName,
      phone: faker.phone.number('+1##########'),
      dateOfBirth: faker.date.between({ from: '1980-01-01', to: '2000-12-31' }),
      country: faker.location.countryCode(),
      city: faker.location.city(),
      isEmailVerified: faker.datatype.boolean(0.8), // 80% verified
      kycStatus: faker.helpers.arrayElement(['PENDING', 'VERIFIED', 'REJECTED']),
      kycLevel: faker.helpers.arrayElement([1, 2, 3]),
      status: faker.helpers.arrayElement(['ACTIVE', 'SUSPENDED', 'INACTIVE']),
      role: index < 5 ? 'ADMIN' : (index < 15 ? 'MANAGER' : 'USER'), // Some admins and managers
      referralCode: this.generateReferralCode(),
      totalInvested: faker.number.float({ min: 0, max: 100000, fractionDigits: 2 }),
      totalEarned: faker.number.float({ min: 0, max: 50000, fractionDigits: 2 }),
      createdAt: faker.date.between({ from: '2023-01-01', to: new Date() }),
    };
  }

  generateReferralCode() {
    return faker.string.alphanumeric(8).toUpperCase();
  }

  // Generate investment order data
  generateOrderData(userId, index) {
    const productTypes = ['USDT_STABLE', 'ETH_GROWTH', 'HIGH_YIELD_COMBO'];
    const productType = faker.helpers.arrayElement(productTypes);
    
    let amount, currency, expectedReturn;
    
    switch (productType) {
      case 'USDT_STABLE':
        amount = faker.number.float({ min: 100, max: 50000, fractionDigits: 2 });
        currency = 'USDT';
        expectedReturn = 0.085; // 8.5%
        break;
      case 'ETH_GROWTH':
        amount = faker.number.float({ min: 0.1, max: 10, fractionDigits: 4 });
        currency = 'ETH';
        expectedReturn = 0.123; // 12.3%
        break;
      case 'HIGH_YIELD_COMBO':
        amount = faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 });
        currency = 'USDT';
        expectedReturn = 0.189; // 18.9%
        break;
    }

    return {
      userId,
      productType,
      amount,
      currency,
      expectedReturn,
      duration: faker.helpers.arrayElement([30, 90, 180]), // days
      status: faker.helpers.arrayElement(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
      riskLevel: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
      investmentDate: faker.date.between({ from: '2023-06-01', to: new Date() }),
      maturityDate: null, // Will calculate based on duration
      actualReturn: null, // Will calculate for completed orders
      notes: faker.lorem.sentence(),
    };
  }

  // Generate transaction data
  generateTransactionData(userId, orderId = null) {
    const types = ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'RETURN', 'COMMISSION'];
    const type = faker.helpers.arrayElement(types);
    
    let amount, currency, status;
    
    switch (type) {
      case 'DEPOSIT':
        amount = faker.number.float({ min: 100, max: 10000, fractionDigits: 2 });
        currency = faker.helpers.arrayElement(['USDT', 'ETH', 'BTC']);
        status = faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'FAILED']);
        break;
      case 'WITHDRAWAL':
        amount = faker.number.float({ min: 50, max: 5000, fractionDigits: 2 });
        currency = faker.helpers.arrayElement(['USDT', 'ETH']);
        status = faker.helpers.arrayElement(['PENDING', 'PROCESSED', 'REJECTED']);
        break;
      case 'INVESTMENT':
      case 'RETURN':
      case 'COMMISSION':
        amount = faker.number.float({ min: 10, max: 50000, fractionDigits: 2 });
        currency = faker.helpers.arrayElement(['USDT', 'ETH']);
        status = 'CONFIRMED';
        break;
    }

    return {
      userId,
      orderId,
      type,
      amount,
      currency,
      status,
      transactionHash: faker.string.hexadecimal({ length: 64, prefix: '0x' }),
      blockNumber: faker.number.int({ min: 18000000, max: 19000000 }),
      gasUsed: type === 'DEPOSIT' || type === 'WITHDRAWAL' ? faker.number.int({ min: 21000, max: 100000 }) : null,
      gasFee: type === 'DEPOSIT' || type === 'WITHDRAWAL' ? faker.number.float({ min: 0.001, max: 0.05, fractionDigits: 6 }) : null,
      fromAddress: faker.finance.ethereumAddress(),
      toAddress: faker.finance.ethereumAddress(),
      memo: faker.lorem.words(3),
      createdAt: faker.date.between({ from: '2023-01-01', to: new Date() }),
    };
  }

  async clearTestData() {
    this.log('WARN', 'Clearing existing test data...');
    
    const tables = [
      'commissions',
      'transactions', 
      'orders',
      'user_wallets',
      'users'
    ];

    try {
      await this.client.query('BEGIN');
      
      for (const table of tables) {
        const result = await this.client.query(`DELETE FROM ${table} WHERE email LIKE '%test%' OR email LIKE '%fake%'`);
        this.log('VERBOSE', `Cleared ${table}`, { deletedRows: result.rowCount });
      }
      
      await this.client.query('COMMIT');
      this.log('INFO', 'Test data cleared successfully');
    } catch (error) {
      await this.client.query('ROLLBACK');
      this.log('ERROR', 'Failed to clear test data', { error: error.message });
      throw error;
    }
  }

  async generateUsers() {
    this.log('INFO', `Generating ${CONFIG.USERS_COUNT} test users...`);
    const users = [];
    
    for (let i = 0; i < CONFIG.USERS_COUNT; i++) {
      const userData = this.generateUserData(i);
      userData.password = await bcrypt.hash(userData.password, 10);
      users.push(userData);
      
      if (this.verboseLogging && i % 10 === 0) {
        this.log('VERBOSE', `Generated user ${i + 1}/${CONFIG.USERS_COUNT}`, { 
          email: userData.email,
          role: userData.role 
        });
      }
    }

    // Batch insert users
    const userIds = [];
    for (let i = 0; i < users.length; i += CONFIG.BATCH_SIZE) {
      const batch = users.slice(i, i + CONFIG.BATCH_SIZE);
      
      try {
        await this.client.query('BEGIN');
        
        for (const user of batch) {
          const query = `
            INSERT INTO users (
              email, password, first_name, last_name, phone, date_of_birth,
              country, city, is_email_verified, kyc_status, kyc_level, status,
              role, referral_code, total_invested, total_earned, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING id, email
          `;
          
          const values = [
            user.email, user.password, user.firstName, user.lastName,
            user.phone, user.dateOfBirth, user.country, user.city,
            user.isEmailVerified, user.kycStatus, user.kycLevel,
            user.status, user.role, user.referralCode,
            user.totalInvested, user.totalEarned, user.createdAt
          ];
          
          const result = await this.client.query(query, values);
          userIds.push(result.rows[0]);
        }
        
        await this.client.query('COMMIT');
        this.log('VERBOSE', `Inserted batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}`, { count: batch.length });
        
      } catch (error) {
        await this.client.query('ROLLBACK');
        this.log('ERROR', `Failed to insert user batch ${i}`, { error: error.message });
        throw error;
      }
    }
    
    this.log('INFO', `Successfully created ${userIds.length} users`);
    return userIds;
  }

  async generateOrders(userIds) {
    this.log('INFO', `Generating ${CONFIG.ORDERS_COUNT} investment orders...`);
    const orders = [];

    for (let i = 0; i < CONFIG.ORDERS_COUNT; i++) {
      const randomUser = faker.helpers.arrayElement(userIds);
      const orderData = this.generateOrderData(randomUser.id, i);
      
      // Calculate maturity date
      orderData.maturityDate = new Date(orderData.investmentDate);
      orderData.maturityDate.setDate(orderData.maturityDate.getDate() + orderData.duration);
      
      // Calculate actual return for completed orders
      if (orderData.status === 'COMPLETED') {
        const variance = faker.number.float({ min: 0.8, max: 1.2 }); // ±20% variance
        orderData.actualReturn = orderData.expectedReturn * variance;
      }
      
      orders.push(orderData);
    }

    // Batch insert orders
    const orderIds = [];
    for (let i = 0; i < orders.length; i += CONFIG.BATCH_SIZE) {
      const batch = orders.slice(i, i + CONFIG.BATCH_SIZE);
      
      try {
        await this.client.query('BEGIN');
        
        for (const order of batch) {
          const query = `
            INSERT INTO orders (
              user_id, product_type, amount, currency, expected_return,
              duration, status, risk_level, investment_date, maturity_date,
              actual_return, notes, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, user_id
          `;
          
          const values = [
            order.userId, order.productType, order.amount, order.currency,
            order.expectedReturn, order.duration, order.status, order.riskLevel,
            order.investmentDate, order.maturityDate, order.actualReturn,
            order.notes, order.investmentDate
          ];
          
          const result = await this.client.query(query, values);
          orderIds.push(result.rows[0]);
        }
        
        await this.client.query('COMMIT');
        this.log('VERBOSE', `Inserted order batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}`, { count: batch.length });
        
      } catch (error) {
        await this.client.query('ROLLBACK');
        this.log('ERROR', `Failed to insert order batch ${i}`, { error: error.message });
        throw error;
      }
    }
    
    this.log('INFO', `Successfully created ${orderIds.length} orders`);
    return orderIds;
  }

  async generateTransactions(userIds, orderIds) {
    this.log('INFO', `Generating ${CONFIG.TRANSACTIONS_COUNT} transactions...`);
    
    for (let i = 0; i < CONFIG.TRANSACTIONS_COUNT; i += CONFIG.BATCH_SIZE) {
      const batch = [];
      const batchSize = Math.min(CONFIG.BATCH_SIZE, CONFIG.TRANSACTIONS_COUNT - i);
      
      for (let j = 0; j < batchSize; j++) {
        const randomUser = faker.helpers.arrayElement(userIds);
        const randomOrder = faker.datatype.boolean(0.6) ? faker.helpers.arrayElement(orderIds) : null;
        const transactionData = this.generateTransactionData(randomUser.id, randomOrder?.id);
        batch.push(transactionData);
      }
      
      try {
        await this.client.query('BEGIN');
        
        for (const transaction of batch) {
          const query = `
            INSERT INTO transactions (
              user_id, order_id, type, amount, currency, status,
              transaction_hash, block_number, gas_used, gas_fee,
              from_address, to_address, memo, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `;
          
          const values = [
            transaction.userId, transaction.orderId, transaction.type,
            transaction.amount, transaction.currency, transaction.status,
            transaction.transactionHash, transaction.blockNumber,
            transaction.gasUsed, transaction.gasFee, transaction.fromAddress,
            transaction.toAddress, transaction.memo, transaction.createdAt
          ];
          
          await this.client.query(query, values);
        }
        
        await this.client.query('COMMIT');
        this.log('VERBOSE', `Inserted transaction batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}`, { count: batch.length });
        
      } catch (error) {
        await this.client.query('ROLLBACK');
        this.log('ERROR', `Failed to insert transaction batch ${i}`, { error: error.message });
        throw error;
      }
    }
    
    this.log('INFO', `Successfully created ${CONFIG.TRANSACTIONS_COUNT} transactions`);
  }

  async generateReferrals(userIds) {
    this.log('INFO', 'Setting up referral relationships...');
    
    // Create referral tree structure
    const referralPairs = [];
    const usedUsers = new Set();
    
    // Create some referral chains
    for (let i = 0; i < Math.min(50, userIds.length / 2); i++) {
      const referrer = userIds[i];
      const maxReferrals = faker.number.int({ min: 1, max: 8 });
      
      for (let j = 0; j < maxReferrals && (i + j + 50) < userIds.length; j++) {
        const referred = userIds[i + j + 50];
        if (!usedUsers.has(referred.id)) {
          referralPairs.push({
            referrerId: referrer.id,
            referredId: referred.id
          });
          usedUsers.add(referred.id);
        }
      }
    }

    // Update users with referral relationships
    try {
      await this.client.query('BEGIN');
      
      for (const pair of referralPairs) {
        await this.client.query(
          'UPDATE users SET referred_by = $1 WHERE id = $2',
          [pair.referrerId, pair.referredId]
        );
      }
      
      await this.client.query('COMMIT');
      this.log('INFO', `Created ${referralPairs.length} referral relationships`);
      
    } catch (error) {
      await this.client.query('ROLLBACK');
      this.log('ERROR', 'Failed to create referral relationships', { error: error.message });
      throw error;
    }
  }

  async generateCommissions(userIds, orderIds) {
    this.log('INFO', 'Generating commission records...');
    
    // Generate commissions for referral relationships
    const commissionsQuery = `
      SELECT DISTINCT 
        u1.id as referrer_id,
        u2.id as referred_id,
        o.id as order_id,
        o.amount,
        o.currency
      FROM users u1
      JOIN users u2 ON u2.referred_by = u1.id
      JOIN orders o ON o.user_id = u2.id
      WHERE o.status IN ('ACTIVE', 'COMPLETED')
      LIMIT 200
    `;
    
    const result = await this.client.query(commissionsQuery);
    const commissionData = result.rows;
    
    try {
      await this.client.query('BEGIN');
      
      for (const comm of commissionData) {
        const commissionRate = 0.05; // 5% commission
        const commissionAmount = comm.amount * commissionRate;
        
        const query = `
          INSERT INTO commissions (
            referrer_id, referred_user_id, order_id, commission_rate,
            commission_amount, currency, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        const values = [
          comm.referrer_id, comm.referred_id, comm.order_id,
          commissionRate, commissionAmount, comm.currency,
          faker.helpers.arrayElement(['PENDING', 'PAID', 'CANCELLED']),
          faker.date.between({ from: '2023-01-01', to: new Date() })
        ];
        
        await this.client.query(query, values);
      }
      
      await this.client.query('COMMIT');
      this.log('INFO', `Generated ${commissionData.length} commission records`);
      
    } catch (error) {
      await this.client.query('ROLLBACK');
      this.log('ERROR', 'Failed to generate commissions', { error: error.message });
      throw error;
    }
  }

  async verifyDataIntegrity() {
    this.log('INFO', 'Verifying data integrity...');
    
    const checks = [
      { name: 'Users', query: 'SELECT COUNT(*) as count FROM users WHERE email LIKE \'%test%\' OR email LIKE \'%fake%\'' },
      { name: 'Orders', query: 'SELECT COUNT(*) as count FROM orders' },
      { name: 'Transactions', query: 'SELECT COUNT(*) as count FROM transactions' },
      { name: 'Commissions', query: 'SELECT COUNT(*) as count FROM commissions' },
      { name: 'Referrals', query: 'SELECT COUNT(*) as count FROM users WHERE referred_by IS NOT NULL' }
    ];
    
    const results = {};
    
    for (const check of checks) {
      try {
        const result = await this.client.query(check.query);
        results[check.name] = parseInt(result.rows[0].count);
        this.log('VERBOSE', `${check.name} count`, { count: results[check.name] });
      } catch (error) {
        this.log('ERROR', `Failed to check ${check.name}`, { error: error.message });
        results[check.name] = 0;
      }
    }
    
    return results;
  }

  async generateTestData() {
    const startTime = Date.now();
    
    try {
      await this.connect();
      
      // Clear existing test data
      await this.clearTestData();
      
      // Generate data in sequence
      this.log('INFO', '=== Starting Test Data Generation ===');
      
      const userIds = await this.generateUsers();
      const orderIds = await this.generateOrders(userIds);
      await this.generateTransactions(userIds, orderIds);
      await this.generateReferrals(userIds);
      await this.generateCommissions(userIds, orderIds);
      
      // Verify data integrity
      const results = await this.verifyDataIntegrity();
      
      const totalTime = Date.now() - startTime;
      
      this.log('INFO', '=== Test Data Generation Complete ===');
      this.log('INFO', 'Summary:', {
        ...results,
        executionTime: `${totalTime}ms`,
        averageTimePerUser: `${Math.round(totalTime / CONFIG.USERS_COUNT)}ms`
      });
      
      return results;
      
    } finally {
      await this.disconnect();
    }
  }
}

// Run the script
if (require.main === module) {
  const generator = new TestDataGenerator();
  
  generator.generateTestData()
    .then((results) => {
      console.log('\n✅ Test data generation completed successfully!');
      console.log('📊 Final Results:', JSON.stringify(results, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test data generation failed:', error.message);
      if (process.env.LOG_LEVEL === 'VERBOSE') {
        console.error(error.stack);
      }
      process.exit(1);
    });
}

module.exports = TestDataGenerator;