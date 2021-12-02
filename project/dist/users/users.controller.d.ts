/// <reference types="multer" />
import { UsersService } from './users.service';
export declare class UsersController {
    private userService;
    constructor(userService: UsersService);
    addAvatar(file: Express.Multer.File): Promise<import("../Photo/databaseFile.entity").default>;
}
