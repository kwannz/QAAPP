'use client'

import { useState, useEffect } from 'react'
import { Code, X, ChevronUp, ChevronDown, Settings, Zap } from 'lucide-react'
import { DevNavigation } from './DevNavigation'
import { useAuthStore } from '../../lib/auth-context'

export function DevBar() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { user } = useAuthStore()

  // 只在开发模式下显示
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (!isDevelopment) return null

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D 切换 DevBar 显示
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setIsVisible(!isVisible)
      }
      
      // Ctrl+Alt+H 切换展开/收起
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'h') {
        e.preventDefault()
        if (isVisible) {
          setIsExpanded(!isExpanded)
        }
      }
      
      // ESC 键关闭
      if (e.key === 'Escape' && isVisible) {
        if (isExpanded) {
          setIsExpanded(false)
        } else {
          setIsVisible(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, isExpanded])

  // 角色颜色
  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500'
      case 'AGENT':
        return 'bg-purple-500'
      case 'USER':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
      {/* 浮动触发按钮 */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`
            group relative flex items-center gap-2 px-3 py-2 
            rounded-full shadow-lg transition-all duration-300
            ${isVisible 
              ? 'bg-orange-600 text-white shadow-orange-200' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }
          `}
          title="开发工具栏 (Ctrl+Shift+D)"
        >
          <Code className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:block">Dev</span>
          
          {/* 用户角色指示器 */}
          {user && (
            <div className={`w-2 h-2 rounded-full ${getRoleColor(user.role)}`} title={`当前角色: ${user.role}`} />
          )}
          
          {/* 环境标识 */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="开发环境" />
        </button>
      </div>

      {/* 开发工具栏面板 */}
      {isVisible && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute bottom-20 right-4 pointer-events-auto">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-h-[70vh] overflow-hidden">
              {/* 头部控制栏 */}
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-sm text-gray-700">开发工具栏</span>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {user?.role || '游客'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="展开/收起导航"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="关闭工具栏"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* 快速操作按钮 */}
              <div className="p-3 border-b bg-gray-50">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded transition-colors"
                    title="返回首页"
                  >
                    <Code className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">首页</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded transition-colors"
                    title="用户面板"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">面板</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin'}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded transition-colors"
                    title="管理后台"
                  >
                    <Zap className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">后台</span>
                  </button>
                  <button
                    onClick={() => window.open('/api', '_blank')}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded transition-colors"
                    title="API文档"
                  >
                    <Code className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">API</span>
                  </button>
                </div>
              </div>

              {/* 完整导航面板 */}
              {isExpanded && (
                <div className="max-h-96 overflow-y-auto">
                  <DevNavigation />
                </div>
              )}

              {/* 快捷键提示 */}
              <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Ctrl+Shift+D: 切换</span>
                  <span>ESC: 关闭</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}