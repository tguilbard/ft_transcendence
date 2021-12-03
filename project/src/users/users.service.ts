import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './entitys/users.entity';
import DatabaseFilesService from '../Photo/databaseFiles.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersEntity)
        private usersRepository: Repository<UsersEntity>,
        private readonly databaseFilesService: DatabaseFilesService,
      ) {}
     
      async addAvatar(imageBuffer: Buffer, filename: string) {
        console.log('je suis dans addAvatar');
        console.log(imageBuffer);
        const avatar = await this.databaseFilesService.uploadDatabaseFile(imageBuffer, filename);
        console.log('ID = ', avatar.id);
        await this.usersRepository.update(5, {
          avatarId: avatar.id
        });
        return avatar;
      }

      async getAvatar() {
        const avatar = await this.databaseFilesService.getFileById(31)
        return avatar;
      }

    async register()
    {
        await console.log("je suis dans register de userService");
    }
}
