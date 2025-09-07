import { UserRole } from '@qa-app/database';
export declare function Auth(...roles: (UserRole | string)[]): ClassDecorator & MethodDecorator;
