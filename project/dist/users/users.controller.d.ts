/// <reference types="multer" />
import { UsersService } from './users.service';
import { Response } from 'express';
export declare class UsersController {
    private userService;
    constructor(userService: UsersService);
    addAvatar(file: Express.Multer.File): Promise<import("../Photo/databaseFile.entity").default>;
    getAvatar(res: Response): Promise<void>;
}
