'use client';

import { isBrowserEnvironment } from './browser-polyfills';

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
  success: async (message: string, options?: any) => {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        toastInstance.success(message, options);
      }
    } else {
      console.log('Toast (success):', message);
    }
  },
  
  error: async (message: string, options?: any) => {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        toastInstance.error(message, options);
      }
    } else {
      console.error('Toast (error):', message);
    }
  },
  
  loading: async (message: string, options?: any) => {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        return toastInstance.loading(message, options);
      }
    } else {
      console.log('Toast (loading):', message);
    }
    return 'mock-toast-id';
  },
  
  dismiss: async (toastId?: string) => {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        toastInstance.dismiss(toastId);
      }
    }
  },
  
  promise: async <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: (data: T) => string;
      error: (err: any) => string;
    },
    options?: any
  ) => {
    if (isBrowserEnvironment()) {
      const toastInstance = await getToast();
      if (toastInstance) {
        return toastInstance.promise(promise, msgs, options);
      }
    } else {
      console.log('Toast (promise loading):', msgs.loading);
    }
    return promise.then(
      (data) => {
        console.log('Toast (promise success):', msgs.success(data));
        return data;
      },
      (err) => {
        console.error('Toast (promise error):', msgs.error(err));
        throw err;
      }
    );
  }
};

// Synchronous versions for backward compatibility (but less safe)
export const safeToastSync = {
  success: (message: string, options?: any) => {
    if (isBrowserEnvironment()) {
      // Use immediate import only if already cached
      if (toast) {
        toast.success(message, options);
      } else {
        console.log('Toast (success - sync fallback):', message);
      }
    } else {
      console.log('Toast (success):', message);
    }
  },
  
  error: (message: string, options?: any) => {
    if (isBrowserEnvironment()) {
      if (toast) {
        toast.error(message, options);
      } else {
        console.error('Toast (error - sync fallback):', message);
      }
    } else {
      console.error('Toast (error):', message);
    }
  }
};