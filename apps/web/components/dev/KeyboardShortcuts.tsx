'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 只在按下 Ctrl/Cmd + Alt + 数字键时触发
      if ((event.ctrlKey || event.metaKey) && event.altKey) {
        switch (event.key) {
          case '0':
            event.preventDefault()
            router.push('/')
            break
          case '1':
            event.preventDefault()
            router.push('/products')
            break
          case '2':
            event.preventDefault()
            router.push('/auth/login')
            break
          case '3':
            event.preventDefault()
            router.push('/auth/register')
            break
          case '4':
            event.preventDefault()
            router.push('/dashboard')
            break
          case '5':
            event.preventDefault()
            router.push('/dashboard/wallets')
            break
          case '6':
            event.preventDefault()
            router.push('/dashboard/earnings')
            break
          case '7':
            event.preventDefault()
            router.push('/test-enhanced')
            break
          case 'h':
            event.preventDefault()
            // 显示帮助信息
            console.log(`
🚀 QA App 开发快捷键:
Ctrl/Cmd + Alt + 0: 首页
Ctrl/Cmd + Alt + 1: 产品中心
Ctrl/Cmd + Alt + 2: 登录页面
Ctrl/Cmd + Alt + 3: 注册页面
Ctrl/Cmd + Alt + 4: 仪表板
Ctrl/Cmd + Alt + 5: 钱包管理
Ctrl/Cmd + Alt + 6: 收益管理
Ctrl/Cmd + Alt + 7: 测试页面
Ctrl/Cmd + Alt + H: 显示此帮助
`)
            alert('快捷键帮助已在控制台中显示。请按 F12 打开开发者工具查看。')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    // 在控制台显示快捷键提示
    console.log(`
🎯 QA App 开发快捷键已激活！
使用 Ctrl/Cmd + Alt + H 查看所有快捷键
`)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  return null // 这个组件不渲染任何UI，只处理键盘事件
}