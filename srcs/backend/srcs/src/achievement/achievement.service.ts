import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { AchievementEntity } from './entities/achievement.entity';
import { Achievement } from './enums/achievement.enum';
import { numberOfFriend, NumberOfGame, PerfectGame } from './enums/achievement-value-to-success.ts';

@Injectable()
export class AchievementService {

	constructor(
		@Inject(forwardRef(() => UsersService))
		private usersService: UsersService,
		@InjectRepository(AchievementEntity)
		private readonly achievementRepository: Repository<AchievementEntity>,
	){}

	static achievementList = AchievementService.SetUpAchievementList()
	private static SetUpAchievementList()
	{
		const achievementList =
		[
			[Achievement.novice, "Novice", `Jouer ${NumberOfGame.novice} partie`, "novice-unlock.png", "novice-lock.png"],
			[Achievement.apprentice, "Apprentice", `Jouer ${NumberOfGame.apprentice} partie`, "apprentice-unlock.png", "apprentice-lock.png"],
			[Achievement.expert, "Expert", `Jouer ${NumberOfGame.expert} partie`, "expert-unlock.png", "expert-lock.png"],
			[Achievement.master, "Master", `Jouer ${NumberOfGame.master} partie`, "master-unlock.png", "master-lock.png"],
			[Achievement.conqueror, "Conqueror", `Gagner ${PerfectGame.winnerScore}-${PerfectGame.loserScore}`, "conqueror-unlock.png", "conqueror-lock.png"],
			[Achievement.loser, "Loser", `Perdre ${PerfectGame.winnerScore}-${PerfectGame.loserScore}`, "loser-unlock.png", "loser-lock.png"],
			[Achievement.locker, "Locker", "Activer la double authentification", "locker-unlock.png", "locker-lock.png"],
			[Achievement.fashion, "Fashion", "Avoir un avatar personnalisé", "fashion-unlock.png",  "fashion-lock.png"],
			[Achievement.galaxie, "Galaxie", "Star le projet Github", "galaxy-unlock.png", "galaxy-lock.png"],
			[Achievement.follower, "Follower", "Suivre tayschee, mapapin, kane53 et tguilbard sur Github et syngia_ sur Instagram",
			"follower-unlock.png", "follower-lock.png"],

			[Achievement.notAlone, "Not Alone", `Avoir ${numberOfFriend.notAlone} ami`, "not-alone-unlock.png", "not-alone-lock.png"],
			[Achievement.socialist, "Socialist", `Avoir ${numberOfFriend.socialist} amis`, "socialist-unlock.png", "socialist-lock.png"],

			[Achievement.perfectionnist, "Perfectionnist", "Avoir tout les achievements sauf Hacker",
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
		if (this.usersService.AchievementIsSet(user, Achievement.novice) == false && user.numberOfGame >= NumberOfGame.novice)
		{
			await this.usersService.UnlockAchievement(user, Achievement.novice);
		}
		else if (this.usersService.AchievementIsSet(user, Achievement.adept) == false && user.numberOfGame >= NumberOfGame.apprentice)
		{
			await this.usersService.UnlockAchievement(user, Achievement.adept);
		}
		else if (this.usersService.AchievementIsSet(user, Achievement.expert) == false && user.numberOfGame >= NumberOfGame.expert)
		{
			await this.usersService.UnlockAchievement(user, Achievement.expert);
		}
		else if (this.usersService.AchievementIsSet(user, Achievement.master) == false && user.numberOfGame >= NumberOfGame.master)
		{
			await this.usersService.UnlockAchievement(user, Achievement.master);
		}
	}

	async CheckScore(user: UserEntity, userScore: number, oppponentScore: number)
	{
		if (this.usersService.AchievementIsSet(user, Achievement.conqueror) == false && userScore == PerfectGame.winnerScore && oppponentScore == PerfectGame.loserScore)
		{
			await this.usersService.UnlockAchievement(user, Achievement.conqueror);
		}
		else if (this.usersService.AchievementIsSet(user, Achievement.loser) == false && userScore == PerfectGame.loserScore && oppponentScore == PerfectGame.winnerScore)
		{
			await this.usersService.UnlockAchievement(user, Achievement.loser);
		}
	}

	async CheckGame(user: UserEntity, userScore: number, oppponentScore: number)
	{
		await this.CheckNumberOfGame(user);
		await this.CheckScore(user, userScore, oppponentScore);
	}

	async CheckNumberOfFriend(user: UserEntity)
	{
		if (this.usersService.AchievementIsSet(user, Achievement.notAlone) == false && user.numberOfFriend == numberOfFriend.notAlone)
		{
			await this.usersService.UnlockAchievement(user, Achievement.notAlone);
		}
		else if (this.usersService.AchievementIsSet(user, Achievement.loser) == false && user.numberOfFriend == numberOfFriend.socialist)
		{
			await this.usersService.UnlockAchievement(user, Achievement.socialist);
		}
	}
}
