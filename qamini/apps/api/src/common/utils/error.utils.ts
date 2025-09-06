/**
 * 类型安全的错误处理工具
 */

// 错误类型守护
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// 安全提取错误信息
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

// 安全提取错误堆栈
export function getErrorStack(error: unknown): string | undefined {
  if (isError(error)) {
    return error.stack;
  }
  return undefined;
}

// 错误对象标准化
export function normalizeError(error: unknown): {
  message: string;
  stack?: string;
  code?: string;
} {
  return {
    message: getErrorMessage(error),
    stack: getErrorStack(error),
    code: isError(error) && 'code' in error ? String(error.code) : undefined,
  };
}