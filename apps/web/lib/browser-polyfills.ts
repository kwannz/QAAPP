/**
 * Browser API polyfills for SSR/SSG compatibility
 *
 * Provides safe fallbacks for browser-only APIs that may be accessed
 * during server-side rendering or static site generation.
 */

// IndexedDB Mock for server-side environments
class MockIDBRequest {
  result: any = null;
  error: any = null;
  readyState = 'done';

  onsuccess: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  addEventListener() {}
  removeEventListener() {}
}

class MockIDBDatabase {
  name = 'mock-db';
  version = 1;

  close() {}
  createObjectStore() {
    return new MockIDBObjectStore();
  }
  transaction() {
    return new MockIDBTransaction();
  }
}

class MockIDBObjectStore {
  add() { return new MockIDBRequest(); }
  put() { return new MockIDBRequest(); }
  get() { return new MockIDBRequest(); }
  delete() { return new MockIDBRequest(); }
  clear() { return new MockIDBRequest(); }
  count() { return new MockIDBRequest(); }
  createIndex() { return new MockIDBIndex(); }
}

class MockIDBTransaction {
  objectStore() {
    return new MockIDBObjectStore();
  }

  abort() {}

  oncomplete: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onabort: ((event: any) => void) | null = null;
}

class MockIDBIndex {
  get() { return new MockIDBRequest(); }
  getAll() { return new MockIDBRequest(); }
  count() { return new MockIDBRequest(); }
}

class MockIDBFactory {
  open(name: string, version?: number) {
    const request = new MockIDBRequest();

    // Simulate async behavior
    setTimeout(() => {
      request.result = new MockIDBDatabase();
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    }, 0);
    return request;
  }

  deleteDatabase(name: string) {
    const request = new MockIDBRequest();
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    }, 0);
    return request;
  }

  cmp() { return 0; }
}

// Web Storage Mock
class MockStorage implements Storage {
  private store: { [key: string]: string } = {};

  get length() {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

// Navigator Mock
const mockNavigator = {
  userAgent: 'MockNavigator',
  language: 'en-US',
  languages: ['en-US'],
  onLine: true,
  platform: 'MockPlatform',
  cookieEnabled: true,
};

/**
 * Install browser API polyfills for server-side environments
 */
export function installBrowserPolyfills() {
  if (typeof window === 'undefined') {
    // We're in a server environment, provide mocks

    // IndexedDB polyfill
    global.indexedDB = new MockIDBFactory() as any;
    global.IDBRequest = MockIDBRequest as any;
    global.IDBDatabase = MockIDBDatabase as any;
    global.IDBObjectStore = MockIDBObjectStore as any;
    global.IDBTransaction = MockIDBTransaction as any;
    global.IDBIndex = MockIDBIndex as any;

    // Storage polyfills
    global.localStorage = new MockStorage();
    global.sessionStorage = new MockStorage();

    // Navigator polyfill - 使用 defineProperty 以避免 readonly 属性错误
    if (!global.navigator) {
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
        configurable: true,
      });
    }

    // Window object basics - 使用 defineProperty 以避免属性冲突
    if (!global.window) {
      Object.defineProperty(global, 'window', {
        value: {
          localStorage: global.localStorage,
          sessionStorage: global.sessionStorage,
          navigator: global.navigator,
          indexedDB: global.indexedDB,
          location: {
            origin: 'http://localhost:3002',
            href: 'http://localhost:3002',
            protocol: 'http:',
            host: 'localhost:3002',
            pathname: '/',
            search: '',
            hash: '',
          },
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
          getComputedStyle: () => ({}),
          matchMedia: () => ({
            matches: false,
            addEventListener: () => {},
            removeEventListener: () => {},
          }),
        },
        writable: true,
        configurable: true,
      });
    }

    // Document basics
    global.document = global.document || {
      createElement: () => ({
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: () => {},
        removeChild: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        click: () => {},
        focus: () => {},
        blur: () => {},
        style: {},
      }),
      createTextNode: (text: string) => ({
        nodeValue: text,
        textContent: text,
        parentNode: null,
      }),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      body: {},
      head: {},
    } as any;

    // MutationObserver mock
    global.MutationObserver = global.MutationObserver || class MockMutationObserver {
      constructor(callback: any) {}
      observe() {}
      disconnect() {}
      takeRecords() { return []; }
    } as any;

    // PerformanceObserver mock
    global.PerformanceObserver = global.PerformanceObserver || class MockPerformanceObserver {
      constructor(callback: any) {}
      observe() {}
      disconnect() {}
    } as any;

    // ResizeObserver mock
    global.ResizeObserver = global.ResizeObserver || class MockResizeObserver {
      constructor(callback: any) {}
      observe() {}
      disconnect() {}
      unobserve() {}
    } as any;
  }
}

/**
 * Check if we're in a browser environment
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && window.indexedDB !== undefined;
}

/**
 * Safe IndexedDB access that works in both server and client environments
 */
export function getSafeIndexedDB(): IDBFactory | MockIDBFactory {
  if (isBrowserEnvironment()) {
    return window.indexedDB;
  }
  return new MockIDBFactory();
}

/**
 * Safe localStorage access
 */
export function getSafeLocalStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return new MockStorage();
}

/**
 * Safe sessionStorage access
 */
export function getSafeSessionStorage(): Storage {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage;
  }
  return new MockStorage();
}

// Auto-install polyfills when this module is loaded
installBrowserPolyfills();
