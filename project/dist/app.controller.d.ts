import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
export declare class AppController {
    private readonly httpService;
    private readonly jwt;
    private readonly usersService;
    constructor(httpService: HttpService, jwt: JwtService, usersService: UsersService);
    salut(request: Request): Promise<any>;
    register(body: Body, response: Response): Promise<void>;
    isRegister(request: Request, response: Response): Promise<void>;
    login(res: Response, request: Request): Promise<Response<any, Record<string, any>>>;
}
