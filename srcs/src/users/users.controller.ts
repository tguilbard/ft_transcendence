import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete } from '@nestjs/common';
import { AddUserDTO } from './dto/Add-user.dto';
import { UpdateUserDTO } from './dto/Update-user.dto';
import { UserEntity } from './entities/users.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor (
		private readonly usersService : UsersService
	){}

	@Get()
	async GetUsers() : Promise<UserEntity[]> {
		return await this.usersService.GetUsers();
	}

	@Post()
	async AddUser(@Body() addUserDTO : AddUserDTO) : Promise<UserEntity> {
		return await this.usersService.AddUser(addUserDTO);
	}

	@Patch(":id")
	async UpdateUser(
		@Body() updateUserDTO : UpdateUserDTO,
		@Param('id', ParseIntPipe) id : number) : Promise<UserEntity> {
		return await this.usersService.UpdateUser(id, updateUserDTO);
	}

	@Delete(":id")
	async RemoveUser(@Param('id', ParseIntPipe) id: number)
	{
		return await this.usersService.SoftDeleteUser(id);
	}

	@Get('recover/:id')
	async RestoreUser(@Param("id", ParseIntPipe) id: number)
	{
		return await this.usersService.RestoreUser(id);
	}


}
