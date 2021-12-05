import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';


@Controller()
export class AppController {
  constructor (private readonly httpService: HttpService, private readonly jwt: JwtService,
	private readonly usersService: UsersService){}

  @Get('salut')
   async salut(@Req() request: Request): Promise<any> {

	const { cookies, headers } = request;
	   await console.log('JE SUIS DANS SALUT');
      return await {'message': 'Hello World!',
					'cookie': cookies['access_token'],
					'token': headers['x-xsrf-token']
	};
  }

	@Post('register')
	async register(@Body() body: Body, @Res() response: Response)
	{
		console.log('je suis dans register');

			console.log(body);
			response.redirect('http://localhost:8080');
	}

	@Get('register')
	async isRegister(@Req() request: Request, @Res() response: Response)
	{
		console.log('user dans isregister', response.get('User'));
		response.redirect('http://localhost:8080/register');
	}
}
