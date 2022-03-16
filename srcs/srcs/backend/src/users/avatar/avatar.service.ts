import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/users.entity';
import DatabaseFile from './entities/avatar.entity'
import { UsersService } from '../users.service';

 
@Injectable()
export class AvatarService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(DatabaseFile)
    private databaseFilesRepository: Repository<DatabaseFile>,
    @InjectRepository(UserEntity)
		private usersRepositories: Repository<UserEntity>
  ) {}
 
  async uploadDatabaseFile(dataBuffer: Buffer, filename: string, avatarId: number) {
    
    const avatar = {
      filename,
      data: dataBuffer,
      id: avatarId
    }
    return await this.databaseFilesRepository.save(avatar)
  }
 
  async getFileById(fileId: number) {
    const file = await this.databaseFilesRepository.findOne(fileId);
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async getAvatar(id: number) {
		const avatar = await this.getFileById(id)
		return avatar;
	}

  async addAvatar(imageBuffer: Buffer, filename: string, req) {
    const user = await this.usersService.FindUserByLogin(req.User.login);
    if (!user)
      return null;
		const avatar = await this.uploadDatabaseFile(imageBuffer, filename, user.avatarId);
		await this.usersRepositories.update(user.id, {
			avatarId: avatar.id
		});
		return avatar;
	}

}
export default AvatarService;