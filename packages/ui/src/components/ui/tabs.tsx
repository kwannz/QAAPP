'use client';

import * as React from 'react';

import { cn } from '../../utils/cn';

const TabsContext = React.createContext<{
  value: string
  onValueChange:(value: string) => void
}>({
  value: '',
  onValueChange: () => {
    // Default empty function - will be overridden by provider
  },
});

interface TabsProperties {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProperties>(
  ({ value, onValueChange, children, className }, reference) => {
    return (
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div ref={reference} className={cn('w-full', className)}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = 'Tabs';

interface TabsListProperties {
  children: React.ReactNode
  className?: string
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProperties>(
  ({ children, className }, reference) => {
    return (
      <div
        ref={reference}
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProperties {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProperties>(
  ({ value, children, className, disabled = false }, reference) => {
    const context = React.useContext(TabsContext);
    const isActive = context.value === value;

    return (
      <button
        ref={reference}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          isActive && 'bg-background text-foreground shadow-sm',
          className,
        )}
        disabled={disabled}
        onClick={() => context.onValueChange(value)}
      >
        {children}
      </button>
    );
  },
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProperties {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProperties>(
  ({ value, children, className }, reference) => {
    const context = React.useContext(TabsContext);

    if (context.value !== value) {
      return;
    }

    return (
      <div
        ref={reference}
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
