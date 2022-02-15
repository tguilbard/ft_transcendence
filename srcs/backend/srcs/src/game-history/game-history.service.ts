import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { match, notEqual } from 'assert';
import { AchievementService } from 'src/achievement/achievement.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { AddMatchInHistoryDTO } from './dto/add-match-in-history.dto';
import { MatchEntity } from './entities/game-history.entity';

@Injectable()
export class GameHistoryService {
	constructor(
		@InjectRepository(MatchEntity)
		private matchRepositories: Repository<MatchEntity>,
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
			.where('user1.id = :id OR user2.id = :id', {id: user.id })
			//.leftJoinAndSelect("users", "users")
			//.createQueryBuilder()
			.getMany();
	}

	async AddMatchInHistory(addMatchInHistoryDTO : AddMatchInHistoryDTO ) : Promise<MatchEntity>
	{
		const matchToAdd : Partial<MatchEntity> = 
		{
			user1: await this.usersService.FindUserById(addMatchInHistoryDTO.usersId[0]),
			user2: await this.usersService.FindUserById(addMatchInHistoryDTO.usersId[1]),
			...addMatchInHistoryDTO
		}

		this.achievementService.CheckGame(matchToAdd.user1, addMatchInHistoryDTO.scoreUser1, addMatchInHistoryDTO.scoreUser2);
		this.achievementService.CheckGame(matchToAdd.user2, addMatchInHistoryDTO.scoreUser2, addMatchInHistoryDTO.scoreUser1);
		return await this.matchRepositories.save(matchToAdd);
	}
}
