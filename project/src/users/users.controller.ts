import { Controller, Get, UploadedFile, UseInterceptors, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response,   } from 'express';
import { Res, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'

@Controller('user')
export class UsersController {
    constructor(private userService: UsersService)
    {
    }

    @Post('register')
    async register(@Body() body: Body, @Res() response: Response)
    {
      console.log('je suis dans post register');
      this.userService.register(body, response);
    }

    @Post('isRegister')
    async isRegister(@Res() response: Response)
    {
      this.userService.isRegister(response);
    }

    @Get('isLogin')
    async isLogin(@Res() response: Response)
    {
      console.log('je suis dans islogin');
      this.userService.isLogin(response);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('img'))
    async addAvatar(@UploadedFile() file: Express.Multer.File, @Body() body: Body) {
        console.log('body with file = ', body);
        return this.userService.addAvatar(file.buffer, file.originalname);
      }

    @Get('img')
    async getAvatar(@Res() res: Response) {
        console.log("je suis dans getAvatar");
        const avatar = await this.userService.getAvatar();
        console.log("avatar = ", avatar);
        res.writeHead(200, {
         'Content-Type': 'image/*',
         'Content-Length': avatar.data.length
        });
        res.end(avatar.data); 
      }

     @Post('login')
      async login(@Res() response: Response, @Req() request: Request) {
        this.userService.login(response, request);
      }
}
