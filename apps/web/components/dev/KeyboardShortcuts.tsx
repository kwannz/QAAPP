'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/auth-context'

// 快捷键映射配置
const shortcutMappings = {
  // 数字键快捷方式
  numbers: {
    '0': { path: '/', name: '首页', category: '导航' },
    '1': { path: '/products', name: '产品中心', category: '导航' },
    '2': { path: '/auth/login', name: '登录页面', category: '认证' },
    '3': { path: '/auth/register', name: '注册页面', category: '认证' },
    '4': { path: '/dashboard', name: '用户仪表板', category: '用户' },
    '5': { path: '/dashboard/wallets', name: '钱包管理', category: '用户' },
    '6': { path: '/dashboard/earnings', name: '收益管理', category: '用户' },
    '7': { path: '/admin', name: '管理后台', category: '管理', permission: 'ADMIN' },
    '8': { path: '/test-enhanced', name: '测试页面', category: '开发' },
    '9': { path: '/withdrawals', name: '提现页面', category: '用户' },
  },
  
  // 字母键快捷方式
  letters: {
    'a': { path: '/admin', name: '管理后台', category: '管理', permission: 'ADMIN' },
    'd': { path: '/dashboard', name: '用户面板', category: '用户' },
    'p': { path: '/products', name: '产品页面', category: '导航' },
    'l': { path: '/auth/login', name: '登录页面', category: '认证' },
    'r': { path: '/referral', name: '推荐页面', category: '用户' },
    't': { path: '/test-enhanced', name: '测试页面', category: '开发' },
    'w': { path: '/withdrawals', name: '提现页面', category: '用户' },
    'u': { path: '/admin/users', name: '用户管理', category: '管理', permission: 'ADMIN' },
    'o': { path: '/admin/orders', name: '订单管理', category: '管理', permission: 'ADMIN' },
    's': { path: '/admin/settings', name: '系统设置', category: '管理', permission: 'ADMIN' },
  }
}

export function KeyboardShortcuts() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isHelpVisible, setIsHelpVisible] = useState(false)

  // 权限检查
  const hasPermission = (permission?: string) => {
    if (!permission) return true
    if (!user) return false
    
    switch (permission) {
      case 'ADMIN':
        return user.role === 'ADMIN'
      case 'AGENT':
        return ['AGENT', 'ADMIN'].includes(user.role)
      case 'USER':
        return ['USER', 'AGENT', 'ADMIN'].includes(user.role)
      default:
        return true
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 排除在输入框中的按键事件
      const isInInput = (event.target as HTMLElement)?.tagName?.toLowerCase() === 'input' ||
                        (event.target as HTMLElement)?.tagName?.toLowerCase() === 'textarea' ||
                        (event.target as HTMLElement)?.contentEditable === 'true'
      
      if (isInInput && !((event.ctrlKey || event.metaKey) && event.shiftKey)) {
        return
      }

      // Ctrl/Cmd + Alt + 数字/字母键导航
      if ((event.ctrlKey || event.metaKey) && event.altKey) {
        // 数字键导航
        if (shortcutMappings.numbers[event.key as keyof typeof shortcutMappings.numbers]) {
          const mapping = shortcutMappings.numbers[event.key as keyof typeof shortcutMappings.numbers]
          if (hasPermission(mapping.permission)) {
            event.preventDefault()
            router.push(mapping.path)
          }
        }
        
        // 字母键导航
        if (shortcutMappings.letters[event.key as keyof typeof shortcutMappings.letters]) {
          const mapping = shortcutMappings.letters[event.key as keyof typeof shortcutMappings.letters]
          if (hasPermission(mapping.permission)) {
            event.preventDefault()
            router.push(mapping.path)
          }
        }

        // 帮助信息
        if (event.key === 'h') {
          event.preventDefault()
          setIsHelpVisible(!isHelpVisible)
          showHelpInConsole()
        }
      }

      // Ctrl/Cmd + K 快速搜索
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        // 触发搜索功能（如果有搜索输入框的话）
        const searchInput = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
    }

    const showHelpInConsole = () => {
      const availableNumbers = Object.entries(shortcutMappings.numbers)
        .filter(([_, mapping]) => hasPermission(mapping.permission))
        .map(([key, mapping]) => `Ctrl/Cmd + Alt + ${key}: ${mapping.name}`)
        .join('\n')
      
      const availableLetters = Object.entries(shortcutMappings.letters)
        .filter(([_, mapping]) => hasPermission(mapping.permission))
        .map(([key, mapping]) => `Ctrl/Cmd + Alt + ${key.toUpperCase()}: ${mapping.name}`)
        .join('\n')

      console.log(`
🚀 QA App 开发快捷键 (当前用户: ${user?.role || '游客'}):

📱 数字键导航:
${availableNumbers}

🔤 字母键导航:
${availableLetters}

⚡ 功能快捷键:
Ctrl/Cmd + Alt + H: 显示/隐藏此帮助
Ctrl/Cmd + K: 快速搜索
Ctrl/Cmd + Shift + D: 开发工具栏
ESC: 关闭弹窗/面板
`)
    }

    window.addEventListener('keydown', handleKeyDown)
    
    // 在控制台显示快捷键提示
    console.log(`
🎯 QA App 开发快捷键已激活！ (用户: ${user?.role || '游客'})
使用 Ctrl/Cmd + Alt + H 查看所有快捷键
`)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router, user, isHelpVisible])

  // 在页面上显示快捷键帮助（可选）
  if (isHelpVisible) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsHelpVisible(false)}>
        <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">🚀 开发快捷键</h2>
            <button 
              onClick={() => setIsHelpVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">📱 数字键导航</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(shortcutMappings.numbers)
                  .filter(([_, mapping]) => hasPermission(mapping.permission))
                  .map(([key, mapping]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">Ctrl+Alt+{key}</span>
                      <span className="text-gray-800">{mapping.name}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">🔤 字母键导航</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(shortcutMappings.letters)
                  .filter(([_, mapping]) => hasPermission(mapping.permission))
                  .map(([key, mapping]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">Ctrl+Alt+{key.toUpperCase()}</span>
                      <span className="text-gray-800">{mapping.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium text-gray-700 mb-2">⚡ 功能快捷键</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ctrl+Alt+H</span>
                <span className="text-gray-800">显示/隐藏此帮助</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ctrl+K</span>
                <span className="text-gray-800">快速搜索</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ctrl+Shift+D</span>
                <span className="text-gray-800">开发工具栏</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ESC</span>
                <span className="text-gray-800">关闭弹窗/面板</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            当前用户权限: {user?.role || '游客'} • 按 ESC 或点击外部区域关闭
          </div>
        </div>
      </div>
    )
  }

  return null // 这个组件主要处理键盘事件，UI是条件性渲染
}