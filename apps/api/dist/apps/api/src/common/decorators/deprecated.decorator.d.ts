export declare const DEPRECATION_KEY = "deprecation";
export interface DeprecationOptions {
    since: string;
    until: string;
    replacement: string;
    reason?: string;
}
export declare const Deprecated: (options: DeprecationOptions) => ClassDecorator & MethodDecorator;
