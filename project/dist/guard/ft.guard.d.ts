import { CanActivate, ExecutionContext } from '@nestjs/common';
declare const FtAuthGuard_base: any;
export declare class FtAuthGuard extends FtAuthGuard_base {
}
export declare class AuthenticatedGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<any>;
}
export {};
