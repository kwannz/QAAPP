// Token管理器 - 用于在React Context外部访问token
import { logger } from './verbose-logger';

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // 设置tokens
  setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // 获取access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // 获取refresh token
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // 清除tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  // 从localStorage恢复tokens
  restoreFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('qa-auth-storage');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          this.accessToken = parsedState.accessToken || null;
          this.refreshToken = parsedState.refreshToken || null;
        }
      } catch (error) {
        logger.warn('TokenManager', 'Failed to restore tokens from storage', { error });
      }
    }
  }
}

// 导出单例实例
export const tokenManager = new TokenManager();

// 初始化时从localStorage恢复
if (typeof window !== 'undefined') {
  tokenManager.restoreFromStorage();
}
