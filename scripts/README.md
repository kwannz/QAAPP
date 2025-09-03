# Scripts Directory Organization

This directory contains all automation scripts organized by functional category.

## Directory Structure

### 📦 deployment/
Production deployment and VPS management scripts
- `deploy-backend.sh` - Backend deployment automation
- `deploy-frontend.sh` - Frontend deployment automation  
- `setup-vps.sh` - VPS environment setup
- `validate-deployment.sh` - Deployment validation checks
- `validate-env.sh` - Environment configuration validation
- `vps-deploy.sh` - Complete VPS deployment script

### 🗄️ database/
Database management and migration scripts
- `backup-db.sh` - Database backup automation
- `migrate-db.sh` - Production database migrations
- `setup-database.js` - Database initialization
- `init-database-production.sql` - Production schema setup
- `init-database.sql` - Development schema setup
- `migrate-to-postgresql.sql` - PostgreSQL migration

### 🛠️ dev/
Development and testing automation scripts
- `check-production.sh` - Production readiness checks
- `health-check.sh` - System health monitoring
- `run-tests.sh` - Test suite execution

### 🔧 utils/
Utility scripts for maintenance and administration
- `code-quality-check.sh` - Code quality analysis
- `create-admin.js` - Admin user creation
- `install-git-hooks.sh` - Git hooks installation
- `start-production.js` - Production startup script
- `stop-system.js` - System shutdown script

## Usage

Run scripts from the project root using:
```bash
# Database operations
npm run db:setup
npm run db:backup
npm run db:migrate:prod

# Deployment operations  
npm run setup:vps
npm run deploy:vps
npm run validate:vps

# Development operations
npm run health
```

All package.json scripts have been updated to reflect the new file locations.