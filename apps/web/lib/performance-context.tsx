'use client'

import { createContext, useContext, ReactNode, useCallback, useMemo, useRef, useEffect } from 'react'
import { createPerformanceMarker } from './web-vitals'

interface PerformanceContextValue {
  measureComponent: (componentName: string) => { end: () => void }
  markInteraction: (interactionName: string) => void
  memoizedCallback: <T extends (...args: any[]) => any>(callback: T, deps: any[]) => T
  isPerformanceMode: boolean
}

const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined)

interface PerformanceProviderProps {
  children: ReactNode
  enableProfiling?: boolean
}

export function PerformanceProvider({ children, enableProfiling = false }: PerformanceProviderProps) {
  const interactionCount = useRef(0)
  const componentRenders = useRef<Map<string, number>>(new Map())

  const measureComponent = useCallback((componentName: string) => {
    if (!enableProfiling) return { end: () => {} }
    
    const renderCount = (componentRenders.current.get(componentName) || 0) + 1
    componentRenders.current.set(componentName, renderCount)
    
    return createPerformanceMarker(`component-${componentName}-render-${renderCount}`)
  }, [enableProfiling])

  const markInteraction = useCallback((interactionName: string) => {
    if (!enableProfiling) return
    
    interactionCount.current += 1
    const marker = createPerformanceMarker(`interaction-${interactionName}-${interactionCount.current}`)
    
    // 自动结束交互测量
    setTimeout(() => marker.end(), 0)
  }, [enableProfiling])

  const memoizedCallback = useCallback(<T extends (...args: any[]) => any>(callback: T, deps: any[]): T => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(callback, deps) as T
  }, [])

  const value = useMemo(() => ({
    measureComponent,
    markInteraction,
    memoizedCallback,
    isPerformanceMode: enableProfiling,
  }), [measureComponent, markInteraction, memoizedCallback, enableProfiling])

  useEffect(() => {
    if (enableProfiling) {
      console.log('🎯 Performance profiling enabled')
    }
  }, [enableProfiling])

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

export function withPerformanceTracking<P extends object>(
  Component: ComponentType<P>,
  componentName?: string
) {
  const PerformanceTrackedComponent: ComponentType<P> = (props: P) => {
    const { measureComponent } = usePerformance()
    const marker = useMemo(() => measureComponent(componentName || Component.name), [measureComponent, componentName])
    
    useEffect(() => {
      return () => marker.end()
    }, [marker])
    
    return <Component {...props} />
  }
  
  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName || Component.displayName || Component.name})`
  
  return PerformanceTrackedComponent
}

export function useComponentPerformance(componentName: string) {
  const { measureComponent, markInteraction } = usePerformance()
  
  const measureRender = useCallback(() => {
    return measureComponent(componentName)
  }, [measureComponent, componentName])
  
  const trackInteraction = useCallback((interactionType: string) => {
    markInteraction(`${componentName}-${interactionType}`)
  }, [markInteraction, componentName])
  
  return { measureRender, trackInteraction }
}