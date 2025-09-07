'use client';

import { useState, useEffect, useCallback } from 'react';
import { isBrowserEnvironment } from './browser-polyfills';
import { logger } from './verbose-logger';

// Types for toast functions
export interface SafeToastAPI {
  success: (message: string) => void;
  error: (message: string) => void;
  loading: (message: string) => void;
  dismiss: () => void;
}

// SSR-safe toast hook that prevents hydration mismatches
export function useSafeToast(): SafeToastAPI {
  const [toast, setToast] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadToast = async () => {
      // Only load on client-side to prevent SSR issues
      if (!isBrowserEnvironment()) {
        setIsLoaded(true);
        return;
      }

      try {
        const toastModule = await import('react-hot-toast');
        setToast(toastModule.default);
        setIsLoaded(true);
      } catch (error) {
        logger.warn('SafeToast', 'Failed to load react-hot-toast, toasts disabled', { error });
        setIsLoaded(true);
      }
    };

    loadToast();
  }, []);

  const safeToastAPI: SafeToastAPI = {
    success: useCallback((message: string) => {
      if (isLoaded && toast) {
        toast.success(message);
      } else {
        // Fallback for when toast is not loaded
        if (process.env.NODE_ENV === 'development') {
          logger.debug('SafeToast', 'Toast Success (fallback)', { message });
        }
      }
    }, [isLoaded, toast]),

    error: useCallback((message: string) => {
      if (isLoaded && toast) {
        toast.error(message);
      } else {
        // Fallback for when toast is not loaded
        logger.error('SafeToast', 'Toast Error (fallback)', { message });
      }
    }, [isLoaded, toast]),

    loading: useCallback((message: string) => {
      if (isLoaded && toast) {
        return toast.loading(message);
      } else {
        // Fallback for when toast is not loaded
        if (process.env.NODE_ENV === 'development') {
          logger.debug('SafeToast', 'Toast Loading (fallback)', { message });
        }
      }
    }, [isLoaded, toast]),

    dismiss: useCallback(() => {
      if (isLoaded && toast) {
        toast.dismiss();
      }
    }, [isLoaded, toast]),
  };

  return safeToastAPI;
}