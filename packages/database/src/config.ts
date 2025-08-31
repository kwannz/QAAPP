/**
 * 数据库连接配置管理
 * 根据环境变量自动选择合适的数据库连接
 */

export interface DatabaseConfig {
  url: string
  poolSize?: number
  connectionTimeout?: number
  ssl?: boolean
  schema?: string
}

/**
 * 获取当前环境
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV || 'development'
}

/**
 * 获取数据库连接URL
 */
export function getDatabaseUrl(): string {
  const env = getEnvironment()
  
  // 优先使用显式设置的DATABASE_URL
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  // 根据环境选择合适的数据库URL
  switch (env) {
    case 'production':
      return process.env.DATABASE_PROD_URL || 
             process.env.DATABASE_AWS_URL ||
             process.env.DATABASE_SUPABASE_URL ||
             process.env.DATABASE_RAILWAY_URL ||
             'postgresql://localhost:5432/qa_app_prod'

    case 'test':
      return process.env.DATABASE_TEST_URL || 
             'postgresql://localhost:5432/qa_app_test'

    case 'staging':
      return process.env.DATABASE_STAGING_URL || 
             'postgresql://localhost:5432/qa_app_staging'

    case 'development':
    default:
      return process.env.DATABASE_DEV_URL || 
             'postgresql://qa_user:qa_password@localhost:5432/qa_app_dev?schema=public'
  }
}

/**
 * 获取完整的数据库配置
 */
export function getDatabaseConfig(): DatabaseConfig {
  const url = getDatabaseUrl()
  
  return {
    url,
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
    ssl: process.env.NODE_ENV === 'production',
    schema: 'public'
  }
}

/**
 * 验证数据库配置
 */
export function validateDatabaseConfig(): boolean {
  try {
    const config = getDatabaseConfig()

    // 在启用 Mock 数据库或非生产环境下，允许跳过严格校验或使用 SQLite
    const useMock = process.env.USE_MOCK_DATABASE === 'true'
    const isProd = getEnvironment() === 'production'

    if (!config.url) {
      console.error('❌ 数据库URL未配置')
      return false
    }

    // 生产环境强制使用 PostgreSQL
    if (isProd) {
      if (!config.url.startsWith('postgresql://')) {
        console.error('❌ 生产环境必须使用PostgreSQL格式的URL')
        return false
      }
    } else {
      // 非生产环境允许 postgresql / sqlite / file: URL
      const allowed = (
        config.url.startsWith('postgresql://') ||
        config.url.startsWith('sqlite:') ||
        config.url.startsWith('file:')
      )
      if (!allowed && !useMock) {
        console.error('❌ 开发环境数据库URL不被支持，请使用 postgresql:// 或 sqlite/file: URL')
        return false
      }
    }

    console.log(`✅ 数据库配置验证通过`)
    console.log(`   环境: ${getEnvironment()}`)
    console.log(`   连接池大小: ${config.poolSize}`)
    console.log(`   连接超时: ${config.connectionTimeout}ms`)
    console.log(`   SSL: ${config.ssl ? '启用' : '禁用'}`)
    console.log(`   URL: ${config.url.replace(/(:)[^:@]*(@)/, '$1****$2')}`) // 隐藏密码
    
    return true
  } catch (error) {
    console.error('❌ 数据库配置验证失败:', error)
    return false
  }
}

/**
 * 数据库健康检查配置
 */
export const HEALTH_CHECK_CONFIG = {
  enabled: process.env.DB_HEALTH_CHECK_ENABLED !== 'false',
  interval: parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '60000'), // 1分钟
  timeout: parseInt(process.env.DB_HEALTH_CHECK_TIMEOUT || '5000'), // 5秒
  retries: parseInt(process.env.DB_HEALTH_CHECK_RETRIES || '3')
}

/**
 * 迁移配置
 */
export const MIGRATION_CONFIG = {
  autoMigrate: process.env.AUTO_MIGRATE === 'true',
  seedOnMigrate: process.env.SEED_ON_MIGRATE === 'true',
  backupBeforeMigrate: process.env.BACKUP_BEFORE_MIGRATE === 'true'
}