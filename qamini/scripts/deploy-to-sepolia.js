#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Deploying contracts to Sepolia testnet...');

// Check environment variables
const requiredEnvVars = ['PRIVATE_KEY', 'SEPOLIA_RPC_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('💡 Please set these in your .env file');
  process.exit(1);
}

const contractsPath = path.join(__dirname, '..', 'packages', 'contracts');

// Change to contracts directory
process.chdir(contractsPath);

console.log('📦 Compiling contracts...');
const compileProcess = spawn('npx', ['hardhat', 'compile'], {
  stdio: 'inherit',
  shell: true
});

compileProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Compilation failed');
    process.exit(1);
  }
  
  console.log('🚀 Deploying to Sepolia...');
  const deployProcess = spawn('npx', ['hardhat', 'deploy', '--network', 'sepolia'], {
    stdio: 'inherit',
    shell: true
  });
  
  deployProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Deployment completed successfully!');
      console.log('🔗 View on Etherscan: https://sepolia.etherscan.io');
    } else {
      console.error('❌ Deployment failed');
      process.exit(1);
    }
  });
});

compileProcess.on('error', (err) => {
  console.error('❌ Failed to start compilation:', err);
  process.exit(1);
});