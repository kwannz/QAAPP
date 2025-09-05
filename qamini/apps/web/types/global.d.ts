// Global type declarations for the web app

declare global {
  interface Window {
    ethereum?: {
      request: (arguments_: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (data: any) => void) => void
      removeListener: (event: string, callback: (data: any) => void) => void
      isMetaMask?: boolean
    }
    google?: any
  }
}

export {};