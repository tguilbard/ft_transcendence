import { Response } from 'express';
declare const FtStrategy_base: any;
export declare class FtStrategy extends FtStrategy_base {
    constructor();
    validate(accessToken: string, refreshToken: string, profile: any, response: Response): Promise<{
        username: any;
    }>;
}
export {};
