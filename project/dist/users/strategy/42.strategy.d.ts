declare const FtStrategy_base: new (...args: any[]) => any;
export declare class FtStrategy extends FtStrategy_base {
    constructor();
    validate(accessToken: string, refreshToken: string, profile: any): Promise<void>;
}
export {};
