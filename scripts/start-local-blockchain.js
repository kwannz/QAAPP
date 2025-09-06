#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting local Hardhat blockchain...');

const contractsPath = path.join(__dirname, '..', 'packages', 'contracts');

// Change to contracts directory and start hardhat node
process.chdir(contractsPath);

const hardhatProcess = spawn('npx', ['hardhat', 'node'], {
  stdio: 'inherit',
  shell: true
});

hardhatProcess.on('close', (code) => {
  console.log(`🏁 Blockchain process exited with code ${code}`);
});

hardhatProcess.on('error', (err) => {
  console.error('❌ Failed to start blockchain:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down blockchain...');
  hardhatProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down blockchain...');
  hardhatProcess.kill('SIGTERM');
});