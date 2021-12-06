import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete, Res, Req } from '@nestjs/common';
import { AddUserDTO } from './dto/Add-user.dto';
import { UpdateUserDTO } from './dto/Update-user.dto';
import { UserEntity } from './entities/users.entity';
import { UsersService } from './users.service';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

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

	@Get('recover/:id')
	async RestoreUser(@Param("id", ParseIntPipe) id: number)
	{
		return await this.usersService.RestoreUser(id);
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

	@Get(":id")
	async GetUserById(@Param("id", ParseIntPipe) id: number) : Promise<UserEntity> {
		return await this.usersService.FindUserById(id);
	}


/////////////////////////////////////////////////////

@Post('register')
async register(@Res() response: Response)
{
	const body = {lol: 'jd'};
  console.log('je suis dans post register');
  console.log('login = ',);
  this.usersService.register(body, response);
}

@Post('isRegister')
async isRegister(@Res() response: Response)
{
  this.usersService.isRegister(response);
}

@Get('isLogin')
async isLogin(@Res() response: Response)
{
  console.log('je suis dans islogin');
  this.usersService.isLogin(response);
}

@Post('upload')
@UseInterceptors(FileInterceptor('img'))
async addAvatar(@UploadedFile() file: Express.Multer.File, @Body() body: Body) {
	console.log('je suis dans upload');
	//console.log('body with file = ', body);
	//return this.usersService.addAvatar(file.buffer, file.originalname);
  }

@Get('img')
async getAvatar(@Res() res: Response) {
	console.log("je suis dans getAvatar");
	const avatar = await this.usersService.getAvatar();
	console.log("avatar = ", avatar);
	res.writeHead(200, {
	 'Content-Type': 'image/*',
	 'Content-Length': avatar.data.length
	});
	res.end(avatar.data); 
  }

 @Post('login')
  async login(@Res() response: Response, @Req() request: Request) {
	this.usersService.login(response, request);
  }

}
