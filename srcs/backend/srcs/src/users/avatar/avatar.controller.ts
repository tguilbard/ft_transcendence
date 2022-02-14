import { Controller, Get, Param, Patch, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { UsersService } from '../users.service';
import AvatarService from './avatar.service';

@Controller('avatar')
export class AvatarController {
    constructor(
		private readonly usersService: UsersService,
		private readonly avatarService: AvatarService,
	) { }
    @Patch()
	@UseInterceptors(FileInterceptor('img'))
	async UpdateAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
		await this.avatarService.addAvatar(file.buffer, file.originalname, req);
		return({ "resultat": 'ok' });
	}

	@Get()
	async getAvatar(@Res() res: Response, @Req() req: Request) {
		const user = await this.usersService.FindUserById(req.User.id);
		const avatar = await this.avatarService.getAvatar(user.avatarId);
		res.writeHead(200, {
			'Content-Type': 'image/*',
			'Content-Length': avatar.data.length
		});
		res.end(avatar.data);
	}

    @Get(':username')
	async getAvatarByUsername(@Param("username") username: string, @Res() res: Response, @Req() req: Request) {
		const user = await this.usersService.FindUserByUsername(username);
		console.log("username = ", username, " et avatarId = ", user.avatarId);
		const avatar = await this.avatarService.getAvatar(user.avatarId);
		res.writeHead(200, {
			'Content-Type': 'image/*',
			'Content-Length': avatar.data.length
		});
		res.end(avatar.data);
	}
}
