"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = isError;
exports.getErrorMessage = getErrorMessage;
exports.getErrorStack = getErrorStack;
exports.normalizeError = normalizeError;
function isError(error) {
    return error instanceof Error;
}
function getErrorMessage(error) {
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
function getErrorStack(error) {
    if (isError(error)) {
        return error.stack;
    }
    return undefined;
}
function normalizeError(error) {
    return {
        message: getErrorMessage(error),
        stack: getErrorStack(error),
        code: isError(error) && 'code' in error ? String(error.code) : undefined,
    };
}
//# sourceMappingURL=error.utils.js.map