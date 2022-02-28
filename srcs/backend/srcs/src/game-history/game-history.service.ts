import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { match, notEqual } from 'assert';
import { AchievementService } from 'src/achievement/achievement.service';
import { NumberOfGame } from 'src/achievement/enums/achievement-value-to-success.ts';
import { UserEntity } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { AddMatchInHistoryDTO } from './dto/add-match-in-history.dto';
import { MatchEntity } from './entities/game-history.entity';

@Injectable()
export class GameHistoryService {
	constructor(
		@InjectRepository(MatchEntity)
		private matchRepositories: Repository<MatchEntity>,
		@InjectRepository(UserEntity)
		private usersRepositories: Repository<UserEntity>,
		private usersService: UsersService,
		private achievementService: AchievementService
	) { }

	async GetAll() : Promise<MatchEntity[]>
	{
		return await this.matchRepositories.find( {relations: ["user1", "user2"]} );
	}

	async GetAllMatchsForUser(username: string) : Promise<MatchEntity[]>
	{
		const user = await this.usersService.FindUserByUsername(username);
		return await this.matchRepositories
    		.createQueryBuilder("match")
    		.leftJoinAndSelect("match.user1", "user1")
			.leftJoinAndSelect("match.user2", "user2")
			.where('user1.id = :id OR user2.id = :id', { id: user.id })
			//.leftJoinAndSelect("users", "users")
			//.createQueryBuilder()
			.getMany();
	}

	async AddMatchInHistory(addMatchInHistoryDTO : AddMatchInHistoryDTO ) //: Promise<MatchEntity>
	{
		//console.log("history:\n ", addMatchInHistoryDTO);
		const matchToAdd : Partial<MatchEntity> = 
		{
			user1: await this.usersService.GetUser(addMatchInHistoryDTO.usersId[0]),
			user2: await this.usersService.GetUser(addMatchInHistoryDTO.usersId[1]),
			...addMatchInHistoryDTO
		}

		//console.log("number of game 1: ", await this.usersService.GetUser(matchToAdd.user1.id));
		//console.log("number of game 2: ", await this.usersService.GetUser(matchToAdd.user2.id));
		await this.achievementService.UnlockGameAchievementIfPossible(matchToAdd.user1, addMatchInHistoryDTO.scoreUser1, addMatchInHistoryDTO.scoreUser2);
		await this.achievementService.UnlockGameAchievementIfPossible(matchToAdd.user2, addMatchInHistoryDTO.scoreUser2, addMatchInHistoryDTO.scoreUser1);

		await this.usersService.UpdateUser1(matchToAdd.user1.id, {numberOfGame: matchToAdd.user1.numberOfGame + 1});
		await this.usersService.UpdateUser1(matchToAdd.user2.id, {numberOfGame: matchToAdd.user2.numberOfGame + 1});
		return await this.matchRepositories.save(matchToAdd);
	}
}
