import { Strategy } from 'passport-custom';
import { UsersService } from '../../users/users.service';
export interface Web3AuthRequest {
    address: string;
    message: string;
    signature: string;
}
declare const Web3Strategy_base: new (...args: any[]) => Strategy;
export declare class Web3Strategy extends Web3Strategy_base {
    private usersService;
    constructor(usersService: UsersService);
    validate(req: any): Promise<any>;
    private verifySignature;
}
export {};
