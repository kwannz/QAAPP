import { useEffect, useRef, useCallback } from 'react'

// 性能指标类型
interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  totalBlockingTime: number
}

interface PerformanceHookReturn {
  measurePageLoad: (pageName: string) => void
  measureFunction: (fnName: string, fn: () => void | Promise<void>) => Promise<void>
  measureComponent: (componentName: string) => {
    start: () => void
    end: () => void
  }
  getMetrics: () => Partial<PerformanceMetrics>
}

// 性能监控 Hook
export function usePerformance(): PerformanceHookReturn {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({})
  const timersRef = useRef<Map<string, number>>(new Map())

  // 获取性能指标
  const collectWebVitals = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return

    // 获取 Navigation Timing API 数据
    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      metricsRef.current.pageLoadTime = navigation.loadEventEnd - navigation.navigationStart
    }

    // 获取 Paint Timing API 数据
    const paintEntries = window.performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcpEntry) {
      metricsRef.current.firstContentfulPaint = fcpEntry.startTime
    }

    // 获取 Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          metricsRef.current.largestContentfulPaint = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[]
          entries.forEach((entry) => {
            metricsRef.current.firstInputDelay = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          metricsRef.current.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

      } catch (error) {
        console.warn('Performance Observer not fully supported:', error)
      }
    }
  }, [])

  // 初始化时收集指标
  useEffect(() => {
    // 页面加载完成后收集指标
    if (document.readyState === 'complete') {
      collectWebVitals()
    } else {
      window.addEventListener('load', collectWebVitals)
      return () => window.removeEventListener('load', collectWebVitals)
    }
  }, [collectWebVitals])

  // 测量页面加载时间
  const measurePageLoad = useCallback((pageName: string) => {
    const startTime = performance.now()
    
    // 使用 requestIdleCallback 或 setTimeout 来测量渲染完成时间
    const measure = () => {
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      console.log(`📊 Page Load: ${pageName} - ${loadTime.toFixed(2)}ms`)
      
      // 发送到分析服务（可选）
      if (process.env.NODE_ENV === 'production') {
        // 这里可以发送到 Google Analytics, Sentry 等
        reportPerformanceMetric('page_load_time', pageName, loadTime)
      }
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(measure)
    } else {
      setTimeout(measure, 0)
    }
  }, [])

  // 测量函数执行时间
  const measureFunction = useCallback(async (fnName: string, fn: () => void | Promise<void>) => {
    const startTime = performance.now()
    
    try {
      await fn()
    } finally {
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      console.log(`⚡ Function: ${fnName} - ${executionTime.toFixed(2)}ms`)
      
      if (process.env.NODE_ENV === 'production' && executionTime > 100) {
        // 记录慢函数调用
        reportPerformanceMetric('slow_function', fnName, executionTime)
      }
    }
  }, [])

  // 测量组件渲染时间
  const measureComponent = useCallback((componentName: string) => {
    return {
      start: () => {
        timersRef.current.set(componentName, performance.now())
      },
      end: () => {
        const startTime = timersRef.current.get(componentName)
        if (startTime) {
          const endTime = performance.now()
          const renderTime = endTime - startTime
          
          console.log(`🎨 Component: ${componentName} - ${renderTime.toFixed(2)}ms`)
          
          timersRef.current.delete(componentName)
          
          if (process.env.NODE_ENV === 'production' && renderTime > 50) {
            reportPerformanceMetric('slow_render', componentName, renderTime)
          }
        }
      }
    }
  }, [])

  // 获取当前性能指标
  const getMetrics = useCallback((): Partial<PerformanceMetrics> => {
    return { ...metricsRef.current }
  }, [])

  return {
    measurePageLoad,
    measureFunction,
    measureComponent,
    getMetrics
  }
}

// 性能指标报告函数
function reportPerformanceMetric(metricType: string, name: string, value: number) {
  // 这里可以集成具体的分析服务
  try {
    // Google Analytics 4 示例
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_type: metricType,
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter_1: navigator.userAgent,
      })
    }

    // 也可以发送到自定义分析端点
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: metricType,
          name,
          value,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.pathname
        })
      }).catch(() => {}) // 静默失败，不影响用户体验
    }
  } catch (error) {
    console.warn('Failed to report performance metric:', error)
  }
}

// 组件性能监控装饰器
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component'
  
  const PerformanceMonitoredComponent: React.FC<P> = (props) => {
    const { measureComponent } = usePerformance()
    const monitor = measureComponent(displayName)

    useEffect(() => {
      monitor.start()
      return () => monitor.end()
    }, [monitor])

    return <WrappedComponent {...props} />
  }

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`
  
  return PerformanceMonitoredComponent
}

// React DevTools Profiler 集成
export function ProfilerComponent({ 
  id, 
  children, 
  onRender 
}: { 
  id: string
  children: React.ReactNode
  onRender?: (id: string, phase: 'mount' | 'update', actualDuration: number) => void 
}) {
  const handleRender = useCallback((
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<any>
  ) => {
    console.log(`🔍 Profiler [${id}]:`, {
      phase,
      actualDuration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`,
    })

    onRender?.(id, phase, actualDuration)

    // 报告慢渲染
    if (actualDuration > 16 && process.env.NODE_ENV === 'production') {
      reportPerformanceMetric('slow_render', id, actualDuration)
    }
  }, [onRender])

  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>
  }

  return (
    <React.Profiler id={id} onRender={handleRender}>
      {children}
    </React.Profiler>
  )
}

export default usePerformance