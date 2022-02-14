import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly usersService: UsersService
    ) {}

  @Get('access/:page')
	async isAcess(@Param("page") page: string, @Req() req: Request) {
		if (page == 'profil')
		{
			if (!req.User || req.User.state != "ok")
				return {log: false};
		}
		else if (page == 'authLogin')
		{
			const user = await this.usersService.FindUserById(req.User.id);
			if ((!req.User || req.User.state != "2fa") || !user.tfaActivated)
				return {log: false};
		}
		else if (page == 'auth')
		{
			if (!req.User || req.User.state != "register")
				return {log: false};
		}
		else if (page == 'register')
		{
			if (!req.User || req.User.state != "register")
				return {log: false};
		}
		return {log: true};
	}
}
