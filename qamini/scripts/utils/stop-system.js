#!/usr/bin/env node

/**
 * System Stop Script
 * Stops all running QA App processes
 */

const { exec } = require('child_process');

console.log('🛑 Stopping QA App System...');

// Stop PM2 processes
exec('pm2 stop all && pm2 delete all', (error) => {
  if (!error) {
    console.log('✅ PM2 processes stopped');
  }
});

// Kill any remaining Node.js processes
const killCommands = [
  'pkill -f "next"',
  'pkill -f "nest"',
  'pkill -f "pnpm.*dev"',
  'pkill -f "pnpm.*start"'
];

killCommands.forEach(cmd => {
  exec(cmd, () => {
    // Silent execution
  });
});

console.log('✅ System stopped');
process.exit(0);