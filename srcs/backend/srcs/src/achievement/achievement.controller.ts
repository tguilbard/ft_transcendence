import { Body, Controller, Get, Param, Post, Req, Res, StreamableFile, UploadedFiles } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Readable } from 'typeorm/platform/PlatformTools';
import { AchievementService } from './achievement.service';

@Controller('achievements')
export class AchievementController {
	constructor(
		private readonly achievementService: AchievementService
	){}

	@Get()
	async GetAchievementList()
	{
		console.log("coucou")
		return await this.achievementService.GetAchievements();
	}

	// @Get("setup")
	// async SetUpAchievementList()
	// {
	// 	await this.achievementService.SetUpAchievementList();
	// 	return "ok"
	// }

	@Get(":directory/:imageName")
	getFileUnlock(@Param("imageName") imageName : string, @Param("directory") directory: string, @Res() res: Response) {
		console.log(process.cwd() + "/src/achievement/images/" + directory + "/" + imageName);
		res.sendFile(process.cwd() + "/src/achievement/images/" + directory + "/" + imageName)
	}
}
