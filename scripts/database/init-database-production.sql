-- QA投资平台生产环境数据库初始化脚本
-- Production Database Initialization for QA Investment Platform
-- 创建时间: 2025-08-29

-- =============================================================================
-- 数据库和用户设置
-- =============================================================================

-- 切换到生产数据库
\connect qa_app_prod;

-- 创建必要的数据库扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- 性能监控
CREATE EXTENSION IF NOT EXISTS "pg_trgm";              -- 全文搜索

-- 创建数据库用户权限
DO $$
BEGIN
    -- 创建只读用户 (用于监控)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'qa_readonly') THEN
        CREATE USER qa_readonly WITH PASSWORD '${READONLY_PASSWORD}';
    END IF;
    
    -- 创建备份用户
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'qa_backup') THEN
        CREATE USER qa_backup WITH PASSWORD '${BACKUP_PASSWORD}';
    END IF;
END
$$;

-- 设置用户权限
GRANT CONNECT ON DATABASE qa_app_prod TO qa_readonly;
GRANT USAGE ON SCHEMA public TO qa_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO qa_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO qa_readonly;

GRANT CONNECT ON DATABASE qa_app_prod TO qa_backup;
GRANT USAGE ON SCHEMA public TO qa_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO qa_backup;

-- =============================================================================
-- 创建生产环境初始管理员用户
-- =============================================================================

-- 创建系统管理员用户
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    role, 
    referral_code, 
    kyc_status, 
    is_active, 
    two_factor_enabled,
    email_verified,
    metadata,
    created_at, 
    updated_at
)
VALUES 
    (
        uuid_generate_v4()::text, 
        'admin@qa-app.com', 
        crypt('${ADMIN_PASSWORD}', gen_salt('bf', 12)), 
        'ADMIN', 
        'ADMIN001', 
        'APPROVED', 
        true,
        true,
        true,
        jsonb_build_object(
            'created_by', 'system',
            'environment', 'production',
            'initial_setup', true
        ),
        now(), 
        now()
    ),
    (
        uuid_generate_v4()::text, 
        'system@qa-app.com', 
        crypt('${SYSTEM_PASSWORD}', gen_salt('bf', 12)), 
        'SYSTEM', 
        'SYSTEM01', 
        'APPROVED', 
        true,
        true,
        true,
        jsonb_build_object(
            'created_by', 'system',
            'environment', 'production',
            'system_account', true
        ),
        now(), 
        now()
    )
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 创建生产环境系统配置
-- =============================================================================

-- 系统安全配置
INSERT INTO system_configs (id, key, value, category, is_active, created_at, updated_at)
VALUES 
    (
        uuid_generate_v4()::text, 
        'security_settings', 
        jsonb_build_object(
            'max_login_attempts', 5,
            'lockout_duration_minutes', 30,
            'password_min_length', 12,
            'require_2fa_for_admin', true,
            'session_timeout_minutes', 60,
            'jwt_expiry_hours', 24
        ), 
        'security', 
        true, 
        now(), 
        now()
    ),
    
    -- 费用配置
    (
        uuid_generate_v4()::text, 
        'fee_structure', 
        jsonb_build_object(
            'withdrawal_fees', jsonb_build_object(
                'EARNINGS', 0.005,
                'PRINCIPAL', 0.001,
                'COMMISSION', 0.003
            ),
            'platform_fees', jsonb_build_object(
                'management_fee', 0.002,
                'performance_fee', 0.15
            )
        ), 
        'financial', 
        true, 
        now(), 
        now()
    ),
    
    -- 风险管理配置
    (
        uuid_generate_v4()::text, 
        'risk_management', 
        jsonb_build_object(
            'thresholds', jsonb_build_object(
                'LOW', 25,
                'MEDIUM', 50,
                'HIGH', 75,
                'CRITICAL', 90
            ),
            'daily_limits', jsonb_build_object(
                'max_investment_per_user', 100000,
                'max_withdrawal_per_user', 50000,
                'max_total_daily_withdrawals', 1000000
            )
        ), 
        'risk', 
        true, 
        now(), 
        now()
    ),
    
    -- 合规配置
    (
        uuid_generate_v4()::text, 
        'compliance_settings', 
        jsonb_build_object(
            'kyc_required', true,
            'aml_screening_enabled', true,
            'max_transaction_without_kyc', 1000,
            'auto_report_suspicious_amount', 10000,
            'audit_log_retention_days', 2555
        ), 
        'compliance', 
        true, 
        now(), 
        now()
    ),
    
    -- 平台运营配置
    (
        uuid_generate_v4()::text, 
        'platform_operations', 
        jsonb_build_object(
            'maintenance_mode', false,
            'registration_open', true,
            'max_concurrent_users', 10000,
            'rate_limit_per_minute', 100,
            'backup_frequency_hours', 6
        ), 
        'operations', 
        true, 
        now(), 
        now()
    )
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = now();

-- =============================================================================
-- 创建生产环境初始审计记录
-- =============================================================================

INSERT INTO audit_logs (
    id, 
    actor_id, 
    actor_type, 
    action, 
    resource_type, 
    resource_id, 
    ip_address, 
    user_agent, 
    metadata, 
    created_at
)
VALUES (
    uuid_generate_v4()::text,
    (SELECT id FROM users WHERE email = 'system@qa-app.com' LIMIT 1),
    'SYSTEM', 
    'DATABASE_INITIALIZED', 
    'DATABASE', 
    'qa_app_prod', 
    '127.0.0.1', 
    'Production-Setup/1.0', 
    jsonb_build_object(
        'action', 'production_database_initialized',
        'version', '1.0.0',
        'environment', 'production',
        'timestamp', extract(epoch from now()),
        'admin_users_created', 2,
        'system_configs_created', 5
    ), 
    now()
);

-- =============================================================================
-- 创建数据库索引 (性能优化)
-- =============================================================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- 审计日志索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

-- 系统配置索引
CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(key);
CREATE INDEX IF NOT EXISTS idx_system_configs_category ON system_configs(category);
CREATE INDEX IF NOT EXISTS idx_system_configs_active ON system_configs(is_active);

-- =============================================================================
-- 创建数据库统计视图 (监控用)
-- =============================================================================

CREATE OR REPLACE VIEW system_health_stats AS
SELECT 
    'users' as table_name,
    count(*) as total_records,
    count(*) FILTER (WHERE is_active = true) as active_records,
    count(*) FILTER (WHERE created_at > now() - interval '24 hours') as created_last_24h
FROM users
UNION ALL
SELECT 
    'audit_logs' as table_name,
    count(*) as total_records,
    count(*) FILTER (WHERE created_at > now() - interval '1 hour') as active_records,
    count(*) FILTER (WHERE created_at > now() - interval '24 hours') as created_last_24h
FROM audit_logs
UNION ALL
SELECT 
    'system_configs' as table_name,
    count(*) as total_records,
    count(*) FILTER (WHERE is_active = true) as active_records,
    count(*) FILTER (WHERE updated_at > now() - interval '24 hours') as created_last_24h
FROM system_configs;

-- 授权只读用户访问统计视图
GRANT SELECT ON system_health_stats TO qa_readonly;

-- =============================================================================
-- 创建数据验证函数
-- =============================================================================

CREATE OR REPLACE FUNCTION validate_production_setup()
RETURNS TABLE(
    check_name text,
    status text,
    details text
) AS $$
BEGIN
    -- 检查管理员用户
    RETURN QUERY
    SELECT 
        'Admin Users'::text as check_name,
        CASE 
            WHEN count(*) >= 1 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        format('Found %s admin users', count(*))::text as details
    FROM users WHERE role = 'ADMIN' AND is_active = true;
    
    -- 检查系统配置
    RETURN QUERY
    SELECT 
        'System Configs'::text as check_name,
        CASE 
            WHEN count(*) >= 5 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        format('Found %s system configurations', count(*))::text as details
    FROM system_configs WHERE is_active = true;
    
    -- 检查数据库扩展
    RETURN QUERY
    SELECT 
        'Database Extensions'::text as check_name,
        CASE 
            WHEN count(*) >= 4 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        format('Found %s required extensions', count(*))::text as details
    FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements', 'pg_trgm');
    
    -- 检查用户权限
    RETURN QUERY
    SELECT 
        'Database Users'::text as check_name,
        CASE 
            WHEN count(*) >= 2 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        format('Found %s database users (readonly, backup)', count(*))::text as details
    FROM pg_user WHERE usename IN ('qa_readonly', 'qa_backup');
    
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 输出初始化结果
-- =============================================================================

-- 显示初始化结果
SELECT 
    '🚀 QA投资平台生产环境数据库初始化完成' as "状态",
    now()::timestamp(0) as "完成时间",
    current_database() as "数据库名称",
    version() as "PostgreSQL版本";

-- 显示创建的用户统计
SELECT 
    '📊 用户统计' as "类别",
    role as "角色",
    count(*) as "用户数量",
    count(*) FILTER (WHERE is_active = true) as "活跃用户"
FROM users 
GROUP BY role
ORDER BY role;

-- 显示系统配置统计
SELECT 
    '⚙️ 系统配置' as "类别",
    category as "配置类别",
    count(*) as "配置项数量"
FROM system_configs 
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- 运行验证检查
SELECT 
    '🔍 ' || check_name as "验证项目",
    CASE 
        WHEN status = 'PASS' THEN '✅ ' || status
        ELSE '❌ ' || status
    END as "状态",
    details as "详细信息"
FROM validate_production_setup();

-- 显示数据库健康状态
SELECT 
    '📈 数据库健康状态' as "类别",
    table_name as "表名",
    total_records as "总记录数",
    active_records as "活跃记录数"
FROM system_health_stats
ORDER BY table_name;

-- 显示警告和建议
SELECT 
    '⚠️ 生产环境注意事项' as "提醒",
    unnest(ARRAY[
        '请确保修改默认密码',
        '定期备份数据库',
        '监控系统资源使用情况',
        '启用SSL连接',
        '配置防火墙规则',
        '定期更新安全补丁'
    ]) as "建议";