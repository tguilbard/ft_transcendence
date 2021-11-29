import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/users.entity';
import { AddUserDTO } from './dto/add-user.dto';
import { UpdateUserDTO } from './dto/Update-user.dto';

@Injectable()
export class UsersService {
	constructor (
		@InjectRepository(UserEntity)
		private usersRepositories : Repository<UserEntity>
	){}

	async GetUsers() : Promise<UserEntity[]> {
		return await this.usersRepositories.find();
	}

	async AddUser(newUser: AddUserDTO) : Promise<UserEntity> {
		return await this.usersRepositories.save(newUser);
	}

	async UpdateUser(id : number, userMofidication: UpdateUserDTO) : Promise<UserEntity> {
		const userChanged =  await this.usersRepositories.preload({
			id,
			...userMofidication,
		});
		return await this.usersRepositories.save(userChanged);
	}
}
