-- AddPerformanceIndexes Migration
-- 为QAAPP平台高频查询添加复合索引以优化性能

-- 提现相关索引优化
-- 1. 状态和创建时间复合索引（用于统计查询和时间范围筛选）
CREATE INDEX CONCURRENTLY IF NOT EXISTS "withdrawal_status_created_idx" 
ON "Withdrawal" ("status", "createdAt");

-- 2. 用户ID和状态复合索引（用于用户提现历史查询）
CREATE INDEX CONCURRENTLY IF NOT EXISTS "withdrawal_user_status_idx" 
ON "Withdrawal" ("userId", "status");

-- 3. 风险等级和状态复合索引（用于风险管理统计）
CREATE INDEX CONCURRENTLY IF NOT EXISTS "withdrawal_risk_status_idx" 
ON "Withdrawal" ("riskLevel", "status");

-- 4. 创建时间索引优化（用于时间范围查询和排序）
CREATE INDEX CONCURRENTLY IF NOT EXISTS "withdrawal_created_desc_idx" 
ON "Withdrawal" ("createdAt" DESC);

-- 用户相关索引优化
-- 5. 用户角色和活跃状态复合索引（用于用户管理查询）
CREATE INDEX CONCURRENTLY IF NOT EXISTS "user_role_active_idx" 
ON "User" ("role", "isActive");

-- 6. KYC状态和创建时间复合索引（用于KYC管理统计）
CREATE INDEX CONCURRENTLY IF NOT EXISTS "user_kyc_created_idx" 
ON "User" ("kycStatus", "createdAt");

-- 7. 推荐人ID索引（用于推荐关系查询）
CREATE INDEX CONCURRENTLY IF NOT EXISTS "user_referred_by_idx" 
ON "User" ("referredById") WHERE "referredById" IS NOT NULL;

-- 8. 代理人ID索引（用于代理关系查询）
CREATE INDEX CONCURRENTLY IF NOT EXISTS "user_agent_idx" 
ON "User" ("agentId") WHERE "agentId" IS NOT NULL;

-- 订单相关索引优化（如果存在Order表）
-- 9. 用户ID和订单状态复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS "order_user_status_idx" 
ON "Order" ("userId", "status") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Order');

-- 10. 订单状态和创建时间复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS "order_status_created_idx" 
ON "Order" ("status", "createdAt") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Order');

-- 交易相关索引优化
-- 11. 用户钱包地址索引（用于Web3交易查询）
CREATE INDEX CONCURRENTLY IF NOT EXISTS "wallet_address_idx" 
ON "Wallet" ("address") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Wallet');

-- 12. 钱包用户ID和链ID复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS "wallet_user_chain_idx" 
ON "Wallet" ("userId", "chainId") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Wallet');

-- 审计日志索引优化（如果存在AuditLog表）
-- 13. 操作者ID和时间复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_actor_time_idx" 
ON "AuditLog" ("actorId", "createdAt") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AuditLog');

-- 14. 资源类型和操作复合索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS "audit_resource_action_idx" 
ON "AuditLog" ("resourceType", "action") WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AuditLog');

-- 性能优化说明
-- CONCURRENTLY选项确保索引创建不会锁定表
-- 使用条件索引(WHERE子句)可以减少索引大小和维护成本
-- 复合索引的字段顺序基于查询模式的选择性进行优化

-- 索引使用监控查询（可用于后续性能分析）
/*
-- 查看索引使用统计
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- 查看未使用的索引
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' AND idx_scan = 0
ORDER BY tablename;
*/