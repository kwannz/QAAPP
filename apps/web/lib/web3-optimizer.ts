'use client'

/**
 * Web3性能优化工具
 * 解决WalletConnect重复初始化等性能问题
 */

// 全局状态跟踪
let walletConnectInitialized = false;
let walletConnectCore: any = null;

// WalletConnect初始化锁
const walletConnectLock = {
  isInitializing: false,
  initialized: false,
  instance: null as any,
};

/**
 * 防止WalletConnect重复初始化的单例模式
 */
export function getWalletConnectCore() {
  if (walletConnectLock.initialized && walletConnectLock.instance) {
    return walletConnectLock.instance;
  }
  
  if (walletConnectLock.isInitializing) {
    return null; // 正在初始化中，避免重复
  }
  
  return null;
}

/**
 * 标记WalletConnect为已初始化
 */
export function markWalletConnectInitialized(instance: any) {
  walletConnectLock.initialized = true;
  walletConnectLock.isInitializing = false;
  walletConnectLock.instance = instance;
}

/**
 * 组件卸载时清理WalletConnect
 */
export function cleanupWalletConnect() {
  if (walletConnectLock.instance) {
    try {
      // 清理WalletConnect实例
      if (typeof walletConnectLock.instance.disconnect === 'function') {
        walletConnectLock.instance.disconnect();
      }
    } catch (error) {
      console.warn('WalletConnect清理失败:', error);
    }
  }
}

/**
 * 页面预加载优化
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;
  
  // 预加载关键CSS和JS资源
  const criticalResources = [
    '/fonts/inter-var.woff2',
    '/_next/static/css/app/globals.css',
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.woff2') ? 'font' : 'style';
    if (resource.endsWith('.woff2')) {
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}

/**
 * 内存优化工具
 */
export class MemoryOptimizer {
  private cleanupTasks: (() => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor() {
    this.startMemoryMonitoring();
  }
  
  // 添加清理任务
  addCleanupTask(task: () => void) {
    this.cleanupTasks.push(task);
  }
  
  // 执行内存清理
  cleanup() {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('内存清理任务执行失败:', error);
      }
    });
    this.cleanupTasks = [];
  }
  
  // 开始内存监控
  private startMemoryMonitoring() {
    if (typeof window === 'undefined') return;
    
    this.intervalId = setInterval(() => {
      // @ts-ignore
      if ((performance as any).memory) {
        // @ts-ignore
        const memInfo = (performance as any).memory;
        const usedMB = Math.round(memInfo.usedJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024);
        
        // 如果内存使用超过限制的70%，执行清理
        if (usedMB > limitMB * 0.7) {
          console.warn(`内存使用率过高: ${usedMB}MB / ${limitMB}MB，执行清理...`);
          this.cleanup();
          
          // 触发垃圾回收（如果支持）
          if ('gc' in window) {
            // @ts-ignore
            window.gc();
          }
        }
      }
    }, 30000); // 每30秒检查一次
  }
  
  // 停止监控
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.cleanup();
  }
}

// 全局内存优化器实例
let memoryOptimizer: MemoryOptimizer | null = null;

/**
 * 获取内存优化器实例
 */
export function getMemoryOptimizer(): MemoryOptimizer {
  if (!memoryOptimizer) {
    memoryOptimizer = new MemoryOptimizer();
  }
  return memoryOptimizer;
}

/**
 * 组件级性能优化Hook
 */
export function usePerformanceOptimization() {
  if (typeof window === 'undefined') return;
  
  // 预加载资源
  preloadCriticalResources();
  
  // 获取内存优化器
  const optimizer = getMemoryOptimizer();
  
  // 返回清理函数
  return () => {
    cleanupWalletConnect();
    optimizer.cleanup();
  };
}

/**
 * 页面性能监控
 */
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  // 开始测量
  startMeasure(name: string) {
    this.metrics.set(`${name}_start`, performance.now());
  }
  
  // 结束测量
  endMeasure(name: string): number {
    const startTime = this.metrics.get(`${name}_start`);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.set(name, duration);
      return duration;
    }
    return 0;
  }
  
  // 获取测量结果
  getMeasure(name: string): number {
    return this.metrics.get(name) || 0;
  }
  
  // 获取所有指标
  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      if (!key.endsWith('_start')) {
        result[key] = value;
      }
    });
    return result;
  }
  
  // 清理指标
  clear() {
    this.metrics.clear();
  }
}

// 全局性能监控器
const globalPerformanceMonitor = new PerformanceMonitor();

export { globalPerformanceMonitor as performanceMonitor };

/**
 * Web Vitals监控
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;
  
  // 监听性能指标
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      // 记录关键性能指标
      switch (entry.entryType) {
        case 'paint':
          console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
          break;
        case 'largest-contentful-paint':
          console.log(`LCP: ${entry.startTime.toFixed(2)}ms`);
          break;
        case 'first-input':
          console.log(`FID: ${(entry as any).processingStart - entry.startTime}ms`);
          break;
        case 'layout-shift':
          console.log(`CLS: ${(entry as any).value}`);
          break;
      }
    });
  });
  
  try {
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch (error) {
    console.warn('Web Vitals监控启动失败:', error);
  }
}