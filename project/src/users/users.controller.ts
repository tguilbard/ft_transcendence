import { Controller, Get, UploadedFile, UseInterceptors, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'

@Controller('user')
export class UsersController {
    constructor(private userService: UsersService)
    {
    }
    @Post('upload')
    @UseInterceptors(FileInterceptor('img'))
    async addAvatar(@UploadedFile() file: Express.Multer.File) {
        return this.userService.addAvatar(file.buffer, file.originalname);
      }
    
}
