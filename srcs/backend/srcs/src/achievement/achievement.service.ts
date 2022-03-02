import { forwardRef, HttpServer, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Achievement } from './enums/achievement.enum';
import { numberOfFriend, NumberOfGame, PerfectGame } from './enums/achievement-value-to-success.ts';
import { Octokit } from 'octokit';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class AchievementService {

	constructor(
		@Inject(forwardRef(() => UsersService))
		private usersService: UsersService,
		private httpService: HttpService
	){}

	static achievementList = AchievementService.SetUpAchievementList()
	private static SetUpAchievementList()
	{
		const achievementList =
		[
			[Achievement.novice, "Novice", `Play ${NumberOfGame.novice} game`, "novice-unlock.png", "novice-lock.png"],
			[Achievement.apprentice, "Apprentice", `Play ${NumberOfGame.apprentice} game`, "apprentice-unlock.png", "apprentice-lock.png"],
			[Achievement.expert, "Expert", `Play ${NumberOfGame.expert} game`, "expert-unlock.png", "expert-lock.png"],
			[Achievement.master, "Master", `Play ${NumberOfGame.master} game`, "master-unlock.png", "master-lock.png"],
			[Achievement.conqueror, "Conqueror", `Win ${PerfectGame.winnerScore}-${PerfectGame.loserScore}`, "conqueror-unlock.png", "conqueror-lock.png"],
			[Achievement.loser, "Loser", `Lose ${PerfectGame.winnerScore}-${PerfectGame.loserScore}`, "loser-unlock.png", "loser-lock.png"],
			[Achievement.locker, "Locker", "Enable two-factor authentication", "locker-unlock.png", "locker-lock.png"],
			[Achievement.fashion, "Fashion", "Have a custom avatar", "fashion-unlock.png",  "fashion-lock.png"],
			[Achievement.galaxie, "Galaxie", "Star the Github projet", "galaxy-unlock.png", "galaxy-lock.png"],
			[Achievement.follower, "Follower", "Follow tayschee, mapapin, kane53 et tguilbard on Github",
			"follower-unlock.png", "follower-lock.png"],

			[Achievement.notAlone, "Not Alone", `Have ${numberOfFriend.notAlone} friend`, "not-alone-unlock.png", "not-alone-lock.png"],
			[Achievement.socialist, "Socialist", `Have ${numberOfFriend.socialist} friends`, "socialist-unlock.png", "socialist-lock.png"],

			[Achievement.perfectionnist, "Perfectionnist", "Have all other achievements except hacker",
			"perfectionnist-unlock.png", "perfectionnist-lock.png"],

			[Achievement.hacker, "Hacker", "...", "hacker-unlock.png", "hacker-lock.png"]
		]

		const achievement = [];
		for(let i = 0; achievementList[i] != null; i++)
		{
			achievement[i] = {
				name: achievementList[i][1],
				description: achievementList[i][2],
				imageUnlockName: achievementList[i][3],
				imageLockName: achievementList[i][4]
			}
		}
		return achievement;
	}

	GetAchievements()
	{
		return AchievementService.achievementList;
	}

	async CheckNumberOfGame(user: UserEntity)
	{
		console.log ("nb partie = " + user.numberOfGame + " et unlock novice a " + NumberOfGame.novice);
		if (this.usersService.AchievementIsSet(user, Achievement.novice) == false && user.numberOfGame + 1 >= NumberOfGame.novice)
		{
			console.log("UNLOCK NOVICE")
			await this.usersService.UnlockAchievement(user.id, Achievement.novice);
		}
		if (this.usersService.AchievementIsSet(user, Achievement.apprentice) == false && user.numberOfGame + 1 >= NumberOfGame.apprentice)
		{
			console.log("UNLOCK APPRENTICE")
			await this.usersService.UnlockAchievement(user.id, Achievement.apprentice);
		}
		if (this.usersService.AchievementIsSet(user, Achievement.expert) == false && user.numberOfGame + 1 >= NumberOfGame.expert)
		{
			console.log("UNLOCK EXPERT")
			await this.usersService.UnlockAchievement(user.id, Achievement.expert);
		}
		if (this.usersService.AchievementIsSet(user, Achievement.master) == false && user.numberOfGame + 1 >= NumberOfGame.master)
		{
			console.log("UNLOCK MASTER")
			await this.usersService.UnlockAchievement(user.id, Achievement.master);
		}
	}

	async CheckScore(user: UserEntity, userScore: number, opponentScore: number)
	{
		console.log("conqueror is set: ", this.usersService.AchievementIsSet(user, Achievement.conqueror), "\nuserScore: ", userScore, "\nopponentScore: ", opponentScore)
		if (this.usersService.AchievementIsSet(user, Achievement.conqueror) == false && userScore == PerfectGame.winnerScore && opponentScore == PerfectGame.loserScore)
		{
			console.log("UNLOCK CONQUEROR")
			await this.usersService.UnlockAchievement(user.id, Achievement.conqueror);
		}
		console.log("loser is set: ", this.usersService.AchievementIsSet(user, Achievement.conqueror), "\nuserScore: ", userScore, "\nopponentScore: ", opponentScore)
		if (this.usersService.AchievementIsSet(user, Achievement.loser) == false && userScore == PerfectGame.loserScore && opponentScore == PerfectGame.winnerScore)
		{
			console.log("UNLOCK LOSER")
			await this.usersService.UnlockAchievement(user.id, Achievement.loser);
		}
	}

	async UnlockGameAchievementIfPossible(user: UserEntity, userScore: number, opponentScore: number)
	{
		await this.CheckNumberOfGame(user);
		//console.log("its okay: ", user, " ", userScore, " ", opponentScore);
		await this.CheckScore(user, userScore, opponentScore);
	}

	async CheckNumberOfFriend(user: UserEntity)
	{
		if (this.usersService.AchievementIsSet(user, Achievement.notAlone) == false && user.numberOfFriend == numberOfFriend.notAlone)
		{
			await this.usersService.UnlockAchievement(user.id, Achievement.notAlone);
		}
		else if (this.usersService.AchievementIsSet(user, Achievement.loser) == false && user.numberOfFriend == numberOfFriend.socialist)
		{
			await this.usersService.UnlockAchievement(user.id, Achievement.socialist);
		}
	}

	async UnlockFashion(user: UserEntity)
	{
		console.log("je suis dans unlock fashion")
		await this.usersService.UnlockAchievement(user.id, Achievement.fashion);
	}

	async UnlockLocker(user: UserEntity)
	{
		await this.usersService.UnlockAchievement(user.id, Achievement.locker);
	}

	async GetGithubAccess(param)
	{

		const headerRequest = {
			'Accept': 'application/json',
		};
	

		const githubReturn = await lastValueFrom(this.httpService.post('https://github.com/login/oauth/access_token', {
										client_id: "658433bca8c14c8f8d2a",
										client_secret: "cdb0e5b3551336a2d0c0fd1a9615402802d0015a",
										code: param,
										},
										{headers: headerRequest}
									)
									.pipe(map(response => response.data)))
		console.log(githubReturn);

		return githubReturn;
  	}

  async FollowGithubUser(githubAccess, githubUsername: string)
  {
	console.log(githubAccess)
	const octokit = new Octokit({ auth: githubAccess.token_type + " " + githubAccess.access_token });
	const resultFollowing = await octokit.request('PUT /user/following/{username}', {
		username: githubUsername
		})
	console.log("verify2")
	return resultFollowing;
  }

  async StarGithubProject(githubAccess, githubUsername: string, githubProject: string)
  {
	const octokit = new Octokit({ auth: githubAccess.token_type + " " + githubAccess.access_token });

	const resultFollowing = await octokit.request('PUT https://api.github.com/user/starred/{owner}/{repo}', {
		owner: githubUsername,
		repo: githubProject
	  })

	return resultFollowing;
  }
}