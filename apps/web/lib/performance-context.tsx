'use client';

import type { ReactNode, ComponentType } from 'react';
import { createContext, useContext, useCallback, useMemo, useRef, useEffect } from 'react';

import { createPerformanceMarker } from './web-vitals';

interface PerformanceContextValue {
  measureComponent: (componentName: string) => { end: () => void }
  markInteraction: (interactionName: string) => void
  memoizedCallback: <T extends (...arguments_: any[]) => any>(callback: T, deps: any[]) => T
  isPerformanceMode: boolean
}

const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined);

interface PerformanceProviderProperties {
  children: ReactNode
  enableProfiling?: boolean
}

export function PerformanceProvider({ children, enableProfiling = false }: PerformanceProviderProperties) {
  const interactionCount = useRef(0);
  const componentRenders = useRef<Map<string, number>>(new Map());

  const measureComponent = useCallback((componentName: string) => {
    if (!enableProfiling) return { end: () => {} };

    const renderCount = (componentRenders.current.get(componentName) || 0) + 1;
    componentRenders.current.set(componentName, renderCount);

    return createPerformanceMarker(`component-${componentName}-render-${renderCount}`);
  }, [enableProfiling]);

  const markInteraction = useCallback((interactionName: string) => {
    if (!enableProfiling) return;

    interactionCount.current += 1;
    const marker = createPerformanceMarker(`interaction-${interactionName}-${interactionCount.current}`);

    // 自动结束交互测量
    setTimeout(() => marker.end(), 0);
  }, [enableProfiling]);

  // 注意：为遵循 Hooks 规范，避免在回调内调用 Hook。
  // 这里返回原始回调以保持行为稳定；如需真正 memo 化，请在组件中直接使用 useCallback。
  const memoizedCallback = useCallback(<T extends (...arguments_: any[]) => any>(callback: T): T => {
    return callback;
  }, []);

  const value = useMemo(() => ({
    measureComponent,
    markInteraction,
    memoizedCallback,
    isPerformanceMode: enableProfiling,
  }), [measureComponent, markInteraction, memoizedCallback, enableProfiling]);

  useEffect(() => {
    if (enableProfiling) {
      // eslint-disable-next-line no-console
      console.log('🎯 Performance profiling enabled');
    }
  }, [enableProfiling]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

export function withPerformanceTracking<P extends object>(
  Component: ComponentType<P>,
  componentName?: string,
) {
  const PerformanceTrackedComponent: ComponentType<P> = (properties: P) => {
    const { measureComponent } = usePerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const marker = useMemo(() => measureComponent(componentName || Component.name), [measureComponent, componentName]);

    useEffect(() => {
      return () => marker.end();
    }, [marker]);

    return <Component {...properties} />;
  };

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName || Component.displayName || Component.name})`;

  return PerformanceTrackedComponent;
}

export function useComponentPerformance(componentName: string) {
  const { measureComponent, markInteraction } = usePerformance();

  const measureRender = useCallback(() => {
    return measureComponent(componentName);
  }, [measureComponent, componentName]);

  const trackInteraction = useCallback((interactionType: string) => {
    markInteraction(`${componentName}-${interactionType}`);
  }, [markInteraction, componentName]);

  return { measureRender, trackInteraction };
}
