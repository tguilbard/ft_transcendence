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

	// @Get("follow") //useless
	// follow(@Res() res: Response)
	// {
	//   console.log("follow")
	//   res.redirect(301, 'https://github.com/login/oauth/authorize?scope=user:follow&client_id=658433bca8c14c8f8d2a');
	// }
  
	// @Get("star")
	// star(@Res() res: Response)
	// {
	//   res.redirect(301, 'https://github.com/login/oauth/authorize?client_id=658433bca8c14c8f8d2a');
	// }
  
	@Post("follow")
	async follow(@Req() req: Request) {

	  console.log("body code: ", req.body['code'])
	  const githubAccess = await this.achievementService.GetGithubAccess(req.body['code']);
	  console.log(githubAccess);
		await this.achievementService.FollowGithubUser(githubAccess, "kane35");
		await this.achievementService.FollowGithubUser(githubAccess, "mapapin");
		await this.achievementService.FollowGithubUser(githubAccess, "tayschee");
		await this.achievementService.FollowGithubUser(githubAccess, "tguilbard");
  
		// await this.appService.StarGithubProject(githubAccess, "tguilbard", "ft_transcendence");
	  console.log("youpi")
	  //return githubAccess;
	}

	@Post("star")
	async star(@Req() req: Request) {

	//  console.log("body code: ", req.body['code'])
	  const githubAccess = await this.achievementService.GetGithubAccess(req.body['code']);
	//   console.log(githubAccess);
	// 	await this.achievementService.FollowGithubUser(githubAccess, "kane35");
	// 	await this.achievementService.FollowGithubUser(githubAccess, "mapapin");
	// 	await this.achievementService.FollowGithubUser(githubAccess, "tayschee");
	// 	await this.achievementService.FollowGithubUser(githubAccess, "tguilbard");
  
	await this.achievementService.StarGithubProject(githubAccess, "tguilbard", "ft_transcendence");
	  console.log("youpi")
	  //return githubAccess;
	}
}
