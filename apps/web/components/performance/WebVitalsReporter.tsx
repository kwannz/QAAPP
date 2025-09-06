'use client'

import { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'
import { sendToAnalytics } from '../../lib/web-vitals'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    sendToAnalytics(metric)
  })

  useEffect(() => {
    // 初始化自定义性能监控
    if (typeof window !== 'undefined') {
      // 监控首次交互时间
      const markFirstInteraction = () => {
        performance.mark('first-interaction')
        document.removeEventListener('click', markFirstInteraction)
        document.removeEventListener('keydown', markFirstInteraction)
      }
      
      document.addEventListener('click', markFirstInteraction, { once: true, passive: true })
      document.addEventListener('keydown', markFirstInteraction, { once: true, passive: true })
      
      // 监控资源加载
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const nav = entry as PerformanceNavigationTiming
            const metrics = {
              dns: nav.domainLookupEnd - nav.domainLookupStart,
              connection: nav.connectEnd - nav.connectStart,
              tls: nav.secureConnectionStart ? nav.connectEnd - nav.secureConnectionStart : 0,
              request: nav.responseStart - nav.requestStart,
              response: nav.responseEnd - nav.responseStart,
              processing: nav.loadEventStart - nav.responseEnd,
              load: nav.loadEventEnd - nav.loadEventStart,
            }
            
            console.log('🌐 Navigation Performance:', metrics)
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation', 'resource'] })
      
      return () => observer.disconnect()
    }
  }, [])

  return null // 这是一个隐形的监控组件
}