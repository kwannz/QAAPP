import { useEffect, useCallback, useRef } from 'react'
import logger, { LogLevel } from '../lib/logger'

interface UseLoggerOptions {
  module: string
  verbose?: boolean
  trackPerformance?: boolean
  trackUserActions?: boolean
}

export function useLogger(options: UseLoggerOptions) {
  const { module, verbose = false, trackPerformance = true, trackUserActions = true } = options
  const mountTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    // 记录组件挂载
    mountTime.current = performance.now()
    logger.debug(module, 'Component mounted', {
      verbose,
      trackPerformance,
      trackUserActions,
    })

    // 记录组件性能
    if (trackPerformance) {
      logger.time(`${module}_mount`)
    }

    return () => {
      // 记录组件卸载
      const lifetime = performance.now() - mountTime.current
      logger.debug(module, 'Component unmounted', {
        lifetime: `${lifetime.toFixed(2)}ms`,
        renderCount: renderCount.current,
      })

      if (trackPerformance) {
        logger.timeEnd(`${module}_mount`)
      }
    }
  }, [module, verbose, trackPerformance, trackUserActions])

  useEffect(() => {
    // 记录每次渲染
    renderCount.current++
    if (verbose) {
      logger.debug(module, `Component rendered (${renderCount.current})`)
    }
  })

  // 日志方法
  const debug = useCallback((message: string, metadata?: any) => {
    logger.debug(module, message, metadata)
  }, [module])

  const info = useCallback((message: string, metadata?: any) => {
    logger.info(module, message, metadata)
  }, [module])

  const warn = useCallback((message: string, metadata?: any) => {
    logger.warn(module, message, metadata)
  }, [module])

  const error = useCallback((message: string, error?: Error | any, metadata?: any) => {
    logger.error(module, message, error, metadata)
  }, [module])

  const fatal = useCallback((message: string, error?: Error | any, metadata?: any) => {
    logger.fatal(module, message, error, metadata)
  }, [module])

  // 性能计时
  const time = useCallback((label: string) => {
    logger.time(`${module}_${label}`)
  }, [module])

  const timeEnd = useCallback((label: string, metadata?: any) => {
    return logger.timeEnd(`${module}_${label}`, metadata)
  }, [module])

  // 用户操作日志
  const logAction = useCallback((action: string, target?: string, metadata?: any) => {
    if (trackUserActions) {
      logger.logUserAction(`${module}:${action}`, target, metadata)
    }
  }, [module, trackUserActions])

  // API日志
  const logApiRequest = useCallback((method: string, url: string, data?: any) => {
    return logger.logApiRequest(method, url, data)
  }, [])

  const logApiResponse = useCallback((requestId: string, status: number, data?: any, duration?: number) => {
    logger.logApiResponse(requestId, status, data, duration)
  }, [])

  const logApiError = useCallback((requestId: string, error: any) => {
    logger.logApiError(requestId, error)
  }, [])

  // 表格输出
  const table = useCallback((data: any[], columns?: string[]) => {
    logger.table(module, data, columns)
  }, [module])

  // 分组
  const group = useCallback((groupName: string) => {
    logger.group(module, groupName)
  }, [module])

  const groupEnd = useCallback((groupName: string) => {
    logger.groupEnd(module, groupName)
  }, [module])

  return {
    debug,
    info,
    warn,
    error,
    fatal,
    time,
    timeEnd,
    logAction,
    logApiRequest,
    logApiResponse,
    logApiError,
    table,
    group,
    groupEnd,
    logger, // 暴露原始logger实例
  }
}

// 专门用于性能监控的Hook
export function usePerformanceLogger(module: string) {
  const startTime = useRef<number>(0)
  const metrics = useRef<{ [key: string]: number }>({})

  useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      const totalTime = performance.now() - startTime.current
      logger.info(`${module}:Performance`, 'Component lifecycle', {
        totalTime: `${totalTime.toFixed(2)}ms`,
        metrics: metrics.current,
      })
    }
  }, [module])

  const measureRender = useCallback(() => {
    const renderStart = performance.now()
    
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart
      metrics.current.lastRender = renderTime
      
      if (renderTime > 16) { // 超过16ms可能导致掉帧
        logger.warn(`${module}:Performance`, 'Slow render detected', {
          renderTime: `${renderTime.toFixed(2)}ms`,
        })
      }
    })
  }, [module])

  const measureAsync = useCallback(async <T,>(
    label: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now()
    
    try {
      const result = await asyncFn()
      const duration = performance.now() - start
      metrics.current[label] = duration
      
      logger.debug(`${module}:Performance`, `Async operation: ${label}`, {
        duration: `${duration.toFixed(2)}ms`,
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      logger.error(`${module}:Performance`, `Async operation failed: ${label}`, error, {
        duration: `${duration.toFixed(2)}ms`,
      })
      throw error
    }
  }, [module])

  return {
    measureRender,
    measureAsync,
    metrics: metrics.current,
  }
}

// 专门用于错误边界的Hook
export function useErrorLogger(module: string) {
  const logError = useCallback((error: Error, errorInfo?: any) => {
    logger.error(`${module}:ErrorBoundary`, 'Component error caught', error, {
      componentStack: errorInfo?.componentStack,
      errorBoundary: true,
    })
  }, [module])

  const logWarning = useCallback((message: string, details?: any) => {
    logger.warn(`${module}:Warning`, message, details)
  }, [module])

  return {
    logError,
    logWarning,
  }
}