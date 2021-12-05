/// <reference types="node" />
import { Repository } from 'typeorm';
import { UsersEntity } from './entitys/users.entity';
import DatabaseFilesService from '../Photo/databaseFiles.service';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
export declare class UsersService {
    private usersRepository;
    private readonly databaseFilesService;
    private readonly httpService;
    private readonly jwt;
    constructor(usersRepository: Repository<UsersEntity>, databaseFilesService: DatabaseFilesService, httpService: HttpService, jwt: JwtService);
    addAvatar(imageBuffer: Buffer, filename: string): Promise<import("../Photo/databaseFile.entity").default>;
    register(body: any, response: any): Promise<void>;
    isLogin(response: any): Promise<any>;
    getAvatar(): Promise<import("../Photo/databaseFile.entity").default>;
    isRegister(username: any): Promise<boolean>;
    login(response: any, request: any): Promise<any>;
}
