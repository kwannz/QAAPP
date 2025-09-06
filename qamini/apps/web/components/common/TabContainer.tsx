'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  badge?: string | number
}

interface TabContainerProperties {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  children: ReactNode
  className?: string
}

export function TabContainer({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: TabContainerProperties) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* 标签导航 */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative px-1 pb-4 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <div className="flex items-center space-x-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {tab.badge}
                  </span>
                )}
              </div>

              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
