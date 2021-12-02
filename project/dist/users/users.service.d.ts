/// <reference types="node" />
import { Repository } from 'typeorm';
import { UsersEntity } from './entitys/users.entity';
import DatabaseFilesService from '../Photo/databaseFiles.service';
export declare class UsersService {
    private usersRepository;
    private readonly databaseFilesService;
    constructor(usersRepository: Repository<UsersEntity>, databaseFilesService: DatabaseFilesService);
    addAvatar(imageBuffer: Buffer, filename: string): Promise<import("../Photo/databaseFile.entity").default>;
    register(): Promise<void>;
}
