/// <reference types="node" />
import { Repository } from 'typeorm';
import DatabaseFile from './databaseFile.entity';
declare class DatabaseFilesService {
    private databaseFilesRepository;
    constructor(databaseFilesRepository: Repository<DatabaseFile>);
    uploadDatabaseFile(dataBuffer: Buffer, filename: string): Promise<DatabaseFile>;
    getFileById(fileId: number): Promise<DatabaseFile>;
}
export default DatabaseFilesService;
