-- Performance optimization indexes migration
-- Sprint 1: Database query optimization

-- 1. Orders table performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status_created 
ON orders(user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_product_status 
ON orders(product_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_referrer_success 
ON orders(referrer_id, status) WHERE status = 'SUCCESS';

-- 2. Positions table performance indexes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_user_product_status
ON positions(user_id, product_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_user_active
ON positions(user_id, status, created_at DESC) WHERE status = 'ACTIVE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_next_payout_active
ON positions(next_payout_at, status) WHERE status = 'ACTIVE' AND next_payout_at IS NOT NULL;

-- 3. Payouts table performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payouts_user_claimable_period
ON payouts(user_id, is_claimable, period_start DESC) WHERE is_claimable = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payouts_position_period
ON payouts(position_id, period_start DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payouts_batch_claimable
ON payouts(batch_id, is_claimable) WHERE batch_id IS NOT NULL;

-- 4. Users table performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_referral_active
ON users(referred_by_id, is_active) WHERE referred_by_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_agent_active  
ON users(agent_id, is_active) WHERE agent_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_kyc_status_created
ON users(kyc_status, created_at DESC);

-- 5. Commissions table performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_user_type_status
ON commissions(user_id, commission_type, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_order_status
ON commissions(order_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_batch_status
ON commissions(batch_id, status) WHERE batch_id IS NOT NULL;

-- 6. Withdrawals table performance indexes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_user_status_requested
ON withdrawals(user_id, status, requested_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_status_risk_level
ON withdrawals(status, risk_level, requested_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawals_reviewer_pending
ON withdrawals(reviewer_id, status) WHERE status IN ('PENDING', 'REVIEWING');

-- 7. Audit logs performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_actor_action_time
ON audit_logs(actor_id, action, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource_time
ON audit_logs(resource_type, resource_id, created_at DESC);

-- 8. Wallets table performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_user_primary
ON wallets(user_id, is_primary) WHERE is_primary = true;

-- 9. Performance monitoring queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_performance_stats
ON orders(status, created_at) WHERE status IN ('SUCCESS', 'FAILED');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_performance_stats  
ON positions(status, created_at, principal) WHERE status = 'ACTIVE';

-- 10. Recent activity indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recent_orders
ON orders(created_at DESC) WHERE created_at > (NOW() - INTERVAL '30 days');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recent_payouts
ON payouts(created_at DESC) WHERE created_at > (NOW() - INTERVAL '30 days');

-- Index creation completed
-- Run ANALYZE to update query planner statistics
ANALYZE users, orders, positions, payouts, commissions, withdrawals, audit_logs, wallets;