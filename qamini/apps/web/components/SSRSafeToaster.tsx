'use client';

import { useState, useEffect } from 'react';
import { isBrowserEnvironment } from '../lib/browser-polyfills';

// SSR-safe Toaster component that prevents hydration mismatches
export function SSRSafeToaster() {
  const [Toaster, setToaster] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const loadToaster = async () => {
      // Only load on client-side
      if (!isBrowserEnvironment()) {
        setIsMounted(true);
        return;
      }

      try {
        const toastModule = await import('react-hot-toast');
        setToaster(() => toastModule.Toaster);
        setIsMounted(true);
      } catch (error) {
        console.warn('Failed to load react-hot-toast, toasts disabled:', error);
        setIsMounted(true);
      }
    };

    loadToaster();
  }, []);

  // Don't render anything until mounted to prevent SSR/hydration issues
  if (!isMounted || !Toaster) {
    return null;
  }

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}