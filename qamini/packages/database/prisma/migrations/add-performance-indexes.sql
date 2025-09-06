-- 性能优化索引 - Sprint 2 第三周
-- 这些索引专门优化频繁查询的性能

-- 用户表复合索引优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_kyc_active 
ON users (role, kyc_status, is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower 
ON users (LOWER(email)) 
WHERE email IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_referral_code_lower 
ON users (LOWER(referral_code));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_id 
ON users (created_at DESC, id ASC);

-- 审计日志表复合索引优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_actor_created 
ON audit_logs (actor_id, created_at DESC) 
WHERE actor_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_created 
ON audit_logs (action, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource_created 
ON audit_logs (resource_type, resource_id, created_at DESC) 
WHERE resource_type IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_id 
ON audit_logs (created_at DESC, id DESC);

-- 订单表性能索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status_created 
ON orders (user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_product_status 
ON orders (product_id, status) 
WHERE status IN ('PENDING', 'SUCCESS');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_tx_hash 
ON orders (tx_hash) 
WHERE tx_hash IS NOT NULL;

-- 钱包表索引优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_user_primary 
ON wallets (user_id, is_primary DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_address_chain 
ON wallets (LOWER(address), chain_id);

-- 提现表复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_user_status_requested 
ON withdrawals (user_id, status, requested_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_status_risk_level 
ON withdrawals (status, risk_level) 
WHERE status IN ('PENDING', 'REVIEWING');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_reviewer_reviewed 
ON withdrawals (reviewer_id, reviewed_at DESC) 
WHERE reviewer_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_batch_status 
ON withdrawals (batch_id, status) 
WHERE batch_id IS NOT NULL;

-- 佣金表性能索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_user_type_status 
ON commissions (user_id, commission_type, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_order_amount 
ON commissions (order_id, amount DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_status_settled 
ON commissions (status, settled_at DESC) 
WHERE status IN ('READY', 'PAID');

-- 收益分发表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payouts_user_claimable 
ON payouts (user_id, is_claimable, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payouts_position_period 
ON payouts (position_id, period_start, period_end);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payouts_batch_distribution 
ON payouts (batch_id, distribution_tx) 
WHERE batch_id IS NOT NULL;

-- 持仓表性能索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_user_status_next_payout 
ON positions (user_id, status, next_payout_at ASC) 
WHERE status = 'ACTIVE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_product_status 
ON positions (product_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_end_date 
ON positions (end_date ASC) 
WHERE status IN ('ACTIVE', 'REDEEMING');

-- 产品表查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_starts_ends 
ON products (is_active, starts_at ASC, ends_at ASC) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_symbol_active 
ON products (LOWER(symbol)) 
WHERE is_active = true;

-- 批次任务表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batch_jobs_type_status_created 
ON batch_jobs (type, status, created_at DESC);

-- 分析查询支持索引（用于报表和统计）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_success_amount_created 
ON orders (created_at DESC, usdt_amount DESC) 
WHERE status = 'SUCCESS';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_completed_amount_date 
ON withdrawals (completed_at DESC, actual_amount DESC) 
WHERE status = 'COMPLETED';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_paid_amount_date 
ON commissions (settled_at DESC, amount DESC) 
WHERE status = 'PAID';

-- 时间范围查询优化索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_hour_bucket 
ON audit_logs (DATE_TRUNC('hour', created_at), action);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_day_bucket 
ON orders (DATE_TRUNC('day', created_at), status, usdt_amount);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_day_bucket 
ON withdrawals (DATE_TRUNC('day', requested_at), status, amount);

-- 用户活动分析索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login_role 
ON users (last_login_at DESC, role) 
WHERE is_active = true AND last_login_at IS NOT NULL;

-- 风险评估查询索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_risk_score_amount 
ON withdrawals (risk_score DESC, amount DESC) 
WHERE risk_level IN ('HIGH', 'CRITICAL');