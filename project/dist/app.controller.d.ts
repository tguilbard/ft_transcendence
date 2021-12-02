import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
export declare class AppController {
    private readonly httpService;
    private readonly jwt;
    constructor(httpService: HttpService, jwt: JwtService);
    salut(request: Request): Promise<any>;
    register(body: Body, response: Response): Promise<void>;
    isRegister(request: Request, response: Response): Promise<void>;
    login(res: Response, request: Request): Promise<Response<any, Record<string, any>>>;
}
