-- QA投资平台 PostgreSQL数据库初始化脚本
-- 从SQLite迁移到PostgreSQL

-- 创建数据库和用户
CREATE DATABASE qa_database;
CREATE USER qa_user WITH PASSWORD 'qa_password';
GRANT ALL PRIVILEGES ON DATABASE qa_database TO qa_user;

-- 连接到数据库
\c qa_database;

-- 创建必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 创建schema
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO qa_user;

-- 设置权限
ALTER DEFAULT PRIVILEGES FOR USER qa_user IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO qa_user;
ALTER DEFAULT PRIVILEGES FOR USER qa_user IN SCHEMA public GRANT USAGE ON SEQUENCES TO qa_user;

-- 优化PostgreSQL配置项
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 记录超过1秒的查询

-- 重新加载配置
SELECT pg_reload_conf();

-- 创建监控视图
CREATE OR REPLACE VIEW performance_stats AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- 创建索引监控视图
CREATE OR REPLACE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY tablename;

-- 输出成功信息
\echo 'PostgreSQL数据库初始化完成'
\echo '数据库: qa_database'
\echo '用户: qa_user'
\echo '扩展已安装: uuid-ossp, pg_stat_statements'