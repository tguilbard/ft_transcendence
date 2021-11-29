import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/users.entity';
import { AddUserDTO } from './dto/Add-user.dto';
import { UpdateUserDTO } from './dto/Update-user.dto';

@Injectable()
export class UsersService {
	constructor (
		@InjectRepository(UserEntity)
		private usersRepositories : Repository<UserEntity>
	){}

	async FindUserById(id : number) {
		const userToFind = await  this.usersRepositories.findOne(id);
		if (!userToFind)
		{
			throw new NotFoundException(`Le User ${id} n'existe pas`);
		}
		return userToFind;
	}

	async GetUsers() : Promise<UserEntity[]> {
		return await this.usersRepositories.find();
	}

	async AddUser(newUser: AddUserDTO) : Promise<UserEntity> {
		return await this.usersRepositories.save(newUser);
	}

	async UpdateUser(id : number, userMofidication: UpdateUserDTO) : Promise<UserEntity> {
		console.log(userMofidication);
		const userChanged =  await this.usersRepositories.preload({
			id : id,
			...userMofidication
		});
		return await this.usersRepositories.save(userChanged);
	}

	async RemoveUser(id : number) {
		const userToRemove = await this.FindUserById(id);
		return await this.usersRepositories.remove(userToRemove);
	}

	async DeleteUser(id : number) {
		return await this.usersRepositories.delete(id);
	}

	async SoftRemoveUser(id : number) {
		const userToRemove = await this.FindUserById(id);
		return await this.usersRepositories.softRemove(userToRemove);
	}

	async SoftDeleteUser(id : number) {
		return await this.usersRepositories.softDelete(id);
	}

	async RestoreUser(id : number) {
		//const userToRecover = await this.FindUserById(id);
		return await this.usersRepositories.restore(id);
	}
}
