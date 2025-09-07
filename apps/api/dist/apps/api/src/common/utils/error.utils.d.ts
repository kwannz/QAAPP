export declare function isError(error: unknown): error is Error;
export declare function getErrorMessage(error: unknown): string;
export declare function getErrorStack(error: unknown): string | undefined;
export declare function normalizeError(error: unknown): {
    message: string;
    stack?: string;
    code?: string;
};
