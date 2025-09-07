'use client';

import { isBrowserEnvironment } from './browser-polyfills';
import { logger } from './verbose-logger';

// Dynamic import of react-hot-toast to prevent SSR issues
let toast: any = null;

const getToast = async () => {
  if (!toast && isBrowserEnvironment()) {
    const toastModule = await import('react-hot-toast');
    toast = toastModule.toast;
  }
  return toast;
};

// Safe toast wrapper for SSR compatibility
export const safeToast = {
  async success(message: string, options?: any) {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        toastInstance.success(message, options);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Toast', 'Toast success (SSR fallback)', { message });
      }
    }
  },
  
  async error(message: string, options?: any) {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        toastInstance.error(message, options);
      }
    } else {
      logger.error('Toast', 'Toast error (SSR fallback)', { message });
    }
  },
  
  async loading(message: string, options?: any) {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        return toastInstance.loading(message, options);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Toast', 'Toast loading (SSR fallback)', { message });
      }
    }
    return 'mock-toast-id';
  },
  
  async dismiss(toastId?: string) {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        toastInstance.dismiss(toastId);
      }
    }
  },
  
  async promise<T>(
    p: Promise<T>,
    msgs: {
      loading: string;
      success: (data: T) => string;
      error: (err: any) => string;
    },
    options?: any
  ) {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        return toastInstance.promise(p, msgs as any, options);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Toast', 'Toast promise loading', { message: msgs.loading });
      }
    }
    return p.then(
      (data) => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Toast', 'Toast promise success', { message: msgs.success(data), data });
        }
        return data;
      },
      (err) => {
        logger.error('Toast', 'Toast promise error', { message: msgs.error(err), error: err });
        throw err;
      }
    );
  },
};

// Synchronous versions for backward compatibility (but less safe)
export const safeToastSync = {
  success: (message: string, options?: any) => {
    if (isBrowserEnvironment()) {
      // Use immediate import only if already cached
      if (toast) {
        toast.success(message, options);
      } else {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Toast', 'Toast success (sync fallback)', { message });
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Toast', 'Toast success (SSR fallback)', { message });
      }
    }
  },
  
  error: (message: string, options?: any) => {
    if (isBrowserEnvironment()) {
      if (toast) {
        toast.error(message, options);
      } else {
        logger.error('Toast', 'Toast error (sync fallback)', { message });
      }
    } else {
      logger.error('Toast', 'Toast error (SSR fallback)', { message });
    }
  },
};
