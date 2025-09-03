#!/usr/bin/env node
/**
 * Create Admin Account Script
 * Creates the initial admin account using credentials from .env.local
 */

const path = require('path');
const { config } = require('dotenv');

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

// Change working directory to database package for Prisma client access
process.chdir(path.join(__dirname, '../packages/database'));

const { PrismaClient, UserRole, KycStatus } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function generateUniqueReferralCode() {
  let referralCode;
  let isUnique = false;

  do {
    // Generate 8-character random string
    referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Check if unique
    const existing = await prisma.user.findUnique({
      where: { referralCode },
    });
    
    isUnique = !existing;
  } while (!isUnique);

  return referralCode;
}

async function createAdminAccount() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@qa-app.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  try {
    console.log('🔍 Checking if admin account already exists...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`✅ Admin account already exists: ${adminEmail}`);
      console.log(`📋 Admin ID: ${existingAdmin.id}`);
      console.log(`🎯 Role: ${existingAdmin.role}`);
      console.log(`📊 Status: ${existingAdmin.isActive ? 'Active' : 'Inactive'}`);
      return existingAdmin;
    }

    console.log('🔐 Creating admin account...');
    
    // Hash password
    const passwordHash = await hash(adminPassword, 12);
    
    // Generate referral code
    const referralCode = await generateUniqueReferralCode();

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
        referralCode,
        kycStatus: KycStatus.APPROVED, // Admin starts with approved KYC
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create audit log for admin creation
    await prisma.auditLog.create({
      data: {
        actorId: adminUser.id,
        actorType: 'SYSTEM',
        action: 'ADMIN_CREATE',
        resourceType: 'USER',
        resourceId: adminUser.id,
        metadata: {
          email: adminEmail,
          role: UserRole.ADMIN,
          createdBy: 'SYSTEM_SCRIPT',
          timestamp: new Date().toISOString(),
        },
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`📋 Admin ID: ${adminUser.id}`);
    console.log(`🎫 Referral Code: ${adminUser.referralCode}`);
    console.log(`📊 KYC Status: ${adminUser.kycStatus}`);
    
    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting admin account creation...');
    console.log(`📍 Using database: ${process.env.DATABASE_URL}`);
    
    await createAdminAccount();
    
    console.log('🎉 Admin account setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the API server: pnpm --filter=@qa-app/api dev');
    console.log('2. Start the web app: pnpm --filter=@qa-app/web dev');
    console.log('3. Login at http://localhost:3000 with the admin credentials');
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createAdminAccount };