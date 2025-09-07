import React, { useEffect, useRef, useCallback } from 'react';
import { logger } from '../verbose-logger';
declare const gtag: any;

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
  measureFunction: (functionName: string, function_: () => void | Promise<void>) => Promise<void>
  measureComponent: (componentName: string) => {
    start: () => void
    end: () => void
  }
  getMetrics: () => Partial<PerformanceMetrics>
}

// 性能监控 Hook
export function usePerformance(): PerformanceHookReturn {
  const metricsReference = useRef<Partial<PerformanceMetrics>>({});
  const timersReference = useRef<Map<string, number>>(new Map());

  // 获取性能指标
  const collectWebVitals = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    // 获取 Navigation Timing API 数据
    const navigation = window.performance.getEntriesByType('navigation')[0];
    if (navigation) {
      metricsReference.current.pageLoadTime = navigation.loadEventEnd - navigation.startTime;
    }

    // 获取 Paint Timing API 数据
    const paintEntries = window.performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metricsReference.current.firstContentfulPaint = fcpEntry.startTime;
    }

    // 获取 Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries.at(-1) as any;
          metricsReference.current.largestContentfulPaint = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          for (const entry of entries) {
            metricsReference.current.firstInputDelay = entry.processingStart - entry.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          metricsReference.current.cumulativeLayoutShift = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        logger.warn('Performance', 'Performance Observer not fully supported', { error });
      }
    }
  }, []);

  // 初始化时收集指标
  useEffect(() => {
    // 页面加载完成后收集指标
    if (document.readyState === 'complete') {
      collectWebVitals();
    } else {
      window.addEventListener('load', collectWebVitals);
      return () => window.removeEventListener('load', collectWebVitals);
    }
  }, [collectWebVitals]);

  // 测量页面加载时间
  const measurePageLoad = useCallback((pageName: string) => {
    const startTime = performance.now();

    // 使用 requestIdleCallback 或 setTimeout 来测量渲染完成时间
    const measure = () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      const DECIMALS_TWO = 2;
      logger.info('Performance', `Page Load: ${pageName} - ${loadTime.toFixed(DECIMALS_TWO)}ms`);

      // 发送到分析服务（可选）
      if (process.env.NODE_ENV === 'production') {
        // 这里可以发送到 Google Analytics, Sentry 等
        reportPerformanceMetric('page_load_time', pageName, loadTime);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(measure);
    } else {
      setTimeout(measure, 0);
    }
  }, []);

  // 测量函数执行时间
  const DECIMALS_TWO = 2;
  const SLOW_FUNCTION_MS = 100;
  const SLOW_RENDER_MS = 50;
  const measureFunction = useCallback(async (functionName: string, function_: () => void | Promise<void>) => {
    const startTime = performance.now();

    try {
      await function_();
    } finally {
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      logger.info('Performance', `Function: ${functionName} - ${executionTime.toFixed(DECIMALS_TWO)}ms`);

      if (process.env.NODE_ENV === 'production' && executionTime > SLOW_FUNCTION_MS) {
        // 记录慢函数调用
        reportPerformanceMetric('slow_function', functionName, executionTime);
      }
    }
  }, []);

  // 测量组件渲染时间
  const measureComponent = useCallback((componentName: string) => {
    return {
      start: () => {
        timersReference.current.set(componentName, performance.now());
      },
      end: () => {
        const startTime = timersReference.current.get(componentName);
        if (startTime) {
          const endTime = performance.now();
          const renderTime = endTime - startTime;

          logger.info('Performance', `Component: ${componentName} - ${renderTime.toFixed(DECIMALS_TWO)}ms`);

          timersReference.current.delete(componentName);

          if (process.env.NODE_ENV === 'production' && renderTime > SLOW_RENDER_MS) {
            reportPerformanceMetric('slow_render', componentName, renderTime);
          }
        }
      },
    };
  }, []);

  // 获取当前性能指标
  const getMetrics = useCallback((): Partial<PerformanceMetrics> => {
    return { ...metricsReference.current };
  }, []);

  return {
    measurePageLoad,
    measureFunction,
    measureComponent,
    getMetrics,
  };
}

// 性能指标报告函数
function reportPerformanceMetric(metricType: string, name: string, value: number) {
  // 这里可以集成具体的分析服务
  try {
    // Google Analytics 4 示例
    if (gtag !== undefined) {
      gtag('event', 'performance_metric', {
        metric_type: metricType,
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter_1: navigator.userAgent,
      });
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
          url: window.location.pathname,
        }),
      }).catch(() => {}); // 静默失败，不影响用户体验
    }
  } catch (error) {
    logger.warn('Performance', 'Failed to report performance metric', { error });
  }
}

// 组件性能监控装饰器
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string,
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const PerformanceMonitoredComponent: React.FC<P> = (properties) => {
    const { measureComponent } = usePerformance();
    const monitor = measureComponent(displayName);

    useEffect(() => {
      monitor.start();
      return () => monitor.end();
    }, [monitor]);

    return React.createElement(WrappedComponent as any, { ...(properties as any) });
  };

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;

  return PerformanceMonitoredComponent;
}

// React DevTools Profiler 集成
export function ProfilerComponent({
  id,
  children,
  onRender,
}: {
  id: string
  children: React.ReactNode
  onRender?: (id: string, phase: 'mount' | 'update', actualDuration: number) => void
}) {
  const handleRender = useCallback((
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    _baseDuration: number,
    _startTime: number,
    _commitTime: number,
    _interactions: Set<any>,
  ) => {
    const DECIMALS_TWO = 2;
    logger.info('Performance', `Profiler [${id}]`, {
      phase,
      actualDuration: `${actualDuration.toFixed(DECIMALS_TWO)}ms`,
      baseDuration: `${_baseDuration.toFixed(DECIMALS_TWO)}ms`,
    });

    onRender?.(id, phase, actualDuration);

    // 报告慢渲染
    const FRAME_60HZ_BUDGET_MS = 16;
    if (actualDuration > FRAME_60HZ_BUDGET_MS && process.env.NODE_ENV === 'production') {
      reportPerformanceMetric('slow_render', id, actualDuration);
    }
  }, [onRender]);

  if (process.env.NODE_ENV !== 'development') {
    return React.createElement(React.Fragment, null, children);
  }

  return React.createElement(React.Profiler as any, { id, onRender: handleRender }, children);
}

export default usePerformance;
