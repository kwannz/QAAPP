#!/usr/bin/env node

/**
 * Production Start Script
 * Starts both API and Web applications in production mode using PM2
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const PM2_ECOSYSTEM_FILE = path.join(PROJECT_ROOT, 'ecosystem.config.js');

console.log('🚀 Starting QA App in Production Mode');
console.log(`📁 Project Root: ${PROJECT_ROOT}`);

// Check if PM2 is installed
function checkPM2() {
  return new Promise((resolve) => {
    exec('which pm2', (error) => {
      if (error) {
        console.log('⚠️  PM2 not found, starting with Node.js directly...');
        resolve(false);
      } else {
        console.log('✅ PM2 found, using PM2 for process management');
        resolve(true);
      }
    });
  });
}

// Start with PM2
function startWithPM2() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting applications with PM2...');
    
    if (!fs.existsSync(PM2_ECOSYSTEM_FILE)) {
      console.error('❌ PM2 ecosystem.config.js not found!');
      return reject(new Error('PM2 ecosystem file missing'));
    }

    const pm2Process = spawn('pm2', ['start', PM2_ECOSYSTEM_FILE], {
      stdio: 'inherit',
      cwd: PROJECT_ROOT
    });

    pm2Process.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Applications started successfully with PM2');
        console.log('📊 Run "pm2 status" to check application status');
        console.log('📋 Run "pm2 logs" to view application logs');
        resolve();
      } else {
        reject(new Error(`PM2 start failed with code ${code}`));
      }
    });
  });
}

// Start without PM2 (fallback)
function startWithoutPM2() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting applications directly...');

    // Set production environment
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'production-jwt-secret-change-in-production';

    // Start API server
    console.log('🚀 Starting API server...');
    const apiProcess = spawn('npm', ['run', 'start:prod'], {
      cwd: path.join(PROJECT_ROOT, 'apps/api'),
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    apiProcess.stdout.on('data', (data) => {
      console.log(`[API] ${data.toString().trim()}`);
    });

    apiProcess.stderr.on('data', (data) => {
      console.error(`[API ERROR] ${data.toString().trim()}`);
    });

    // Start Web server
    console.log('🌐 Starting Web server...');
    const webProcess = spawn('npm', ['run', 'start'], {
      cwd: path.join(PROJECT_ROOT, 'apps/web'),
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    webProcess.stdout.on('data', (data) => {
      console.log(`[WEB] ${data.toString().trim()}`);
    });

    webProcess.stderr.on('data', (data) => {
      console.error(`[WEB ERROR] ${data.toString().trim()}`);
    });

    // Handle process cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down applications...');
      apiProcess.kill('SIGTERM');
      webProcess.kill('SIGTERM');
      process.exit(0);
    });

    // Wait for both processes to start
    setTimeout(() => {
      console.log('✅ Applications started successfully');
      console.log('🌐 Web: http://localhost:3000');
      console.log('🔌 API: http://localhost:3001');
      resolve();
    }, 5000);
  });
}

// Main function
async function main() {
  try {
    console.log('🔍 Checking for PM2...');
    const hasPM2 = await checkPM2();

    if (hasPM2) {
      await startWithPM2();
    } else {
      await startWithoutPM2();
    }

  } catch (error) {
    console.error('❌ Failed to start applications:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}