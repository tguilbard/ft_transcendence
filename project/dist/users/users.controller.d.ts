/// <reference types="multer" />
import { UsersService } from './users.service';
import { Request, Response } from 'express';
export declare class UsersController {
    private userService;
    constructor(userService: UsersService);
    register(body: Body, response: Response): Promise<void>;
    isRegister(response: Response): Promise<void>;
    isLogin(response: Response): Promise<void>;
    addAvatar(file: Express.Multer.File, body: Body): Promise<import("../Photo/databaseFile.entity").default>;
    getAvatar(res: Response): Promise<void>;
    login(response: Response, request: Request): Promise<void>;
}
