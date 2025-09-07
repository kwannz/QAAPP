'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect, useState } from 'react';

import { sendToAnalytics } from '../../lib/web-vitals';
import { logger } from '@/lib/verbose-logger';

export function WebVitalsReporter() {
  const [isMounted, setIsMounted] = useState(false);

  useReportWebVitals((metric) => {
    if (typeof window !== 'undefined') {
      sendToAnalytics(metric);
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // 只在客户端环境且组件已挂载时初始化性能监控
    if (!isMounted || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      // 监控首次交互时间
      const markFirstInteraction = () => {
        if (typeof performance !== 'undefined' && performance.mark) {
          performance.mark('first-interaction');
        }
        document.removeEventListener('click', markFirstInteraction);
        document.removeEventListener('keydown', markFirstInteraction);
      };

      document.addEventListener('click', markFirstInteraction, { once: true, passive: true });
      document.addEventListener('keydown', markFirstInteraction, { once: true, passive: true });

      // 监控资源加载 - 检查 PerformanceObserver 是否可用
      let observer: PerformanceObserver | null = null;
      
      if (typeof PerformanceObserver !== 'undefined') {
        observer = new PerformanceObserver((list) => {
          try {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'navigation') {
                const nav = entry as PerformanceNavigationTiming;
                const metrics = {
                  dns: nav.domainLookupEnd - nav.domainLookupStart,
                  connection: nav.connectEnd - nav.connectStart,
                  tls: nav.secureConnectionStart ? nav.connectEnd - nav.secureConnectionStart : 0,
                  request: nav.responseStart - nav.requestStart,
                  response: nav.responseEnd - nav.responseStart,
                  processing: nav.loadEventStart - nav.responseEnd,
                  load: nav.loadEventEnd - nav.loadEventStart,
                };

                logger.info('WebVitals', 'Navigation Performance', metrics);
              }
            }
          } catch (error) {
            logger.warn('WebVitals', 'Performance observation error', { error });
          }
        });

        try {
          observer.observe({ entryTypes: ['navigation', 'resource'] });
        } catch (error) {
          logger.warn('WebVitals', 'Performance observer initialization failed', { error });
          observer = null;
        }
      }

      return () => {
        if (observer) {
          try {
            observer.disconnect();
          } catch (error) {
            logger.warn('WebVitals', 'Performance observer disconnect error', { error });
          }
        }
      };
    } catch (error) {
      logger.warn('WebVitals', 'Initialization error', { error });
    }
  }, [isMounted]);

  return null; // 这是一个隐形的监控组件
}
