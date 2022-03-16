import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AchievementService } from './achievement.service';

@Controller('achievements')
export class AchievementController {
	constructor(
		private readonly achievementService: AchievementService
	){}

	@Get()
	async GetAchievementList()
	{
		return await this.achievementService.GetAchievements();
	}

	@Get(":directory/:imageName")
	getFileUnlock(@Param("imageName") imageName : string, @Param("directory") directory: string, @Res() res: Response) {
		res.sendFile(process.cwd() + "/src/achievement/images/" + directory + "/" + imageName)
	}

	@Post("follow")
	async follow(@Req() req: Request) {
	  const githubAccess = await this.achievementService.GetGithubAccess(req.body['code']);
		await this.achievementService.FollowGithubUser(githubAccess, "kane35");
		await this.achievementService.FollowGithubUser(githubAccess, "mapapin");
		await this.achievementService.FollowGithubUser(githubAccess, "tayschee");
		await this.achievementService.FollowGithubUser(githubAccess, "tguilbard");
	}

	@Post("star")
	async star(@Req() req: Request) {
	  const githubAccess = await this.achievementService.GetGithubAccess(req.body['code']);
		await this.achievementService.StarGithubProject(githubAccess, "tguilbard", "ft_transcendence");
	}
}
