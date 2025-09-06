import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals'

export interface PerformanceBudget {
  LCP: number // Largest Contentful Paint - 目标 < 2.5s
  INP: number // Interaction to Next Paint - 目标 < 200ms
  CLS: number // Cumulative Layout Shift - 目标 < 0.1
  FCP: number // First Contentful Paint - 目标 < 1.8s
  TTFB: number // Time to First Byte - 目标 < 800ms
}

const PERFORMANCE_BUDGETS: PerformanceBudget = {
  LCP: 2500,
  INP: 200,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 800,
}

export function sendToAnalytics(metric: Metric) {
  const isExceedingBudget = checkBudgetViolation(metric)
  
  // 发送到分析服务
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // 可以集成Google Analytics, Vercel Analytics等
    console.log(`Performance Metric: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      exceedingBudget: isExceedingBudget,
      budgetLimit: PERFORMANCE_BUDGETS[metric.name as keyof PerformanceBudget]
    })
    
    // 如果超出预算，发送警告
    if (isExceedingBudget) {
      reportPerformanceIssue(metric)
    }
  }
}

export function checkBudgetViolation(metric: Metric): boolean {
  const budget = PERFORMANCE_BUDGETS[metric.name as keyof PerformanceBudget]
  if (!budget) return false
  
  return metric.value > budget
}

export function reportPerformanceIssue(metric: Metric) {
  const issue = {
    type: 'performance_budget_violation',
    metric: metric.name,
    value: metric.value,
    budget: PERFORMANCE_BUDGETS[metric.name as keyof PerformanceBudget],
    url: window.location.href,
    timestamp: Date.now(),
  }
  
  // 发送到监控服务
  if (typeof fetch !== 'undefined') {
    fetch('/api/performance/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue),
    }).catch(err => console.warn('Failed to report performance issue:', err))
  }
}

export function initializeWebVitals() {
  if (typeof window === 'undefined') return
  
  // 收集所有Web Vitals指标
  onCLS(sendToAnalytics)
  onINP(sendToAnalytics)
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
  
  console.log('🚀 Web Vitals monitoring initialized')
}

export function getPerformanceScore(): number {
  // 基于多个指标计算综合性能分数
  const metrics = {
    lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
    fcp: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0,
  }
  
  let score = 100
  
  if (metrics.lcp > PERFORMANCE_BUDGETS.LCP) score -= 20
  if (metrics.fcp > PERFORMANCE_BUDGETS.FCP) score -= 15
  
  return Math.max(0, score)
}

export function createPerformanceMarker(name: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${name}-start`)
    
    return {
      end: () => {
        performance.mark(`${name}-end`)
        performance.measure(name, `${name}-start`, `${name}-end`)
        
        const measure = performance.getEntriesByName(name)[0]
        if (measure) {
          console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`)
          
          // 清理performance entries
          performance.clearMarks(`${name}-start`)
          performance.clearMarks(`${name}-end`)
          performance.clearMeasures(name)
        }
      }
    }
  }
  
  return { end: () => {} }
}