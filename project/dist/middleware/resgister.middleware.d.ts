import { NestMiddleware } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Request, Response } from 'express';
export declare class AuthMiddleware implements NestMiddleware {
    private userService;
    constructor(userService: UsersService);
    use(req: Request, res: Response, next: () => void): void | Response<any, Record<string, any>>;
}
