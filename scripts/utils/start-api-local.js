#!/usr/bin/env node

// Local API starter for development/e2e
// - Ensures API is built
// - Sets sane defaults for JWT secrets
// - Starts compiled server on PORT (default 3001)

const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '../..');
const API_DIR = path.join(ROOT, 'apps/api');
const DIST_MAIN = path.join(ROOT, 'apps/api/dist/apps/api/src/main.js');

function ensureBuilt() {
  if (!fs.existsSync(DIST_MAIN)) {
    console.log('📦 Building API...');
    const r = spawnSync('pnpm', ['--filter=@qa-app/api', 'build'], { stdio: 'inherit', cwd: ROOT });
    if (r.status !== 0) process.exit(r.status || 1);
  } else {
    console.log('✅ API build found');
  }
}

function start() {
  process.env.PORT = process.env.PORT || '3001';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'development-jwt-secret-change-in-production';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-change-in-production';
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://qa_user:qa_password@localhost:5433/qa_database?schema=public';
  }

  console.log(`🚀 Starting API on :${process.env.PORT}`);
  console.log(`🔐 JWT configured (refresh secret present: ${!!process.env.JWT_REFRESH_SECRET})`);
  const proc = spawn('node', [DIST_MAIN], { cwd: ROOT, stdio: 'inherit', env: process.env });

  proc.on('close', (code) => process.exit(code || 0));
  process.on('SIGINT', () => proc.kill('SIGTERM'));
}

ensureBuilt();
start();

