-- QA投资平台数据库初始化脚本
-- 创建影子数据库用于Prisma迁移

-- 创建影子数据库
CREATE DATABASE qa_app_shadow WITH TEMPLATE qa_app_dev;

-- 创建开发环境数据库扩展
\connect qa_app_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 切换到影子数据库并创建扩展
\connect qa_app_shadow;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 切换回开发数据库
\connect qa_app_dev;

-- 创建基础用户角色
INSERT INTO users (id, email, password_hash, role, referral_code, kyc_status, is_active, created_at, updated_at)
VALUES 
  ('clm123admin001', 'admin@qa-app.com', '$2b$10$example.hash.for.admin', 'ADMIN', 'ADMIN001', 'APPROVED', true, now(), now()),
  ('clm123agent001', 'agent@qa-app.com', '$2b$10$example.hash.for.agent', 'AGENT', 'AGENT001', 'APPROVED', true, now(), now()),
  ('clm123user0001', 'user1@qa-app.com', '$2b$10$example.hash.for.user1', 'USER', 'USER0001', 'APPROVED', true, now(), now()),
  ('clm123user0002', 'user2@qa-app.com', '$2b$10$example.hash.for.user2', 'USER', 'USER0002', 'PENDING', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 创建示例产品
INSERT INTO products (id, symbol, name, description, min_amount, max_amount, apr_bps, lock_days, total_supply, current_supply, is_active, starts_at, ends_at, created_at, updated_at)
VALUES 
  ('prod_btc_30d', 'BTC-30D', 'BTC稳健理财30天', '低风险BTC理财产品', 100.00, 50000.00, 800, 30, 1000, 0, true, now(), now() + interval '90 days', now(), now()),
  ('prod_eth_90d', 'ETH-90D', 'ETH增强理财90天', '中等风险ETH理财产品', 500.00, 100000.00, 1200, 90, 500, 0, true, now(), now() + interval '180 days', now(), now()),
  ('prod_usdc_7d', 'USDC-7D', 'USDC灵活理财7天', '超低风险USDC理财产品', 50.00, 10000.00, 400, 7, 2000, 0, true, now(), now() + interval '30 days', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 创建系统配置
INSERT INTO system_configs (id, key, value, category, is_active, created_at, updated_at)
VALUES 
  ('cfg_withdrawal_fees', 'withdrawal_fees', '{"EARNINGS": 0.005, "PRINCIPAL": 0.001, "COMMISSION": 0.003}', 'fee', true, now(), now()),
  ('cfg_risk_thresholds', 'risk_thresholds', '{"LOW": 25, "MEDIUM": 50, "HIGH": 75, "CRITICAL": 80}', 'risk', true, now(), now()),
  ('cfg_auto_approval', 'auto_approval_settings', '{"max_amount": 1000, "min_risk_score": 0, "max_risk_score": 20}', 'approval', true, now(), now()),
  ('cfg_platform_settings', 'platform_settings', '{"maintenance": false, "max_daily_withdrawals": 10, "min_withdrawal": 10}', 'platform', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 创建审计日志示例
INSERT INTO audit_logs (id, actor_id, actor_type, action, resource_type, resource_id, ip_address, user_agent, metadata, created_at)
VALUES 
  ('audit_001', 'clm123admin001', 'ADMIN', 'SYSTEM_INIT', 'SYSTEM', 'qa_app_dev', '127.0.0.1', 'System/Init', '{"action": "database_initialized", "version": "1.0.0"}', 'now())
ON CONFLICT (id) DO NOTHING;

-- 输出初始化完成信息
SELECT 
  'QA投资平台数据库初始化完成' as status,
  count(*) as user_count 
FROM users;