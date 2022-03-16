import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementService } from 'src/achievement/achievement.service';
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
			.getMany();
	}

	async AddMatchInHistory(addMatchInHistoryDTO : AddMatchInHistoryDTO ) //: Promise<MatchEntity>
	{
		const matchToAdd : Partial<MatchEntity> = 
		{
			user1: await this.usersService.GetUser(addMatchInHistoryDTO.usersId[0]),
			user2: await this.usersService.GetUser(addMatchInHistoryDTO.usersId[1]),
			...addMatchInHistoryDTO
		}

		await this.achievementService.UnlockGameAchievementIfPossible(matchToAdd.user1, addMatchInHistoryDTO.scoreUser1, addMatchInHistoryDTO.scoreUser2);
		await this.achievementService.UnlockGameAchievementIfPossible(matchToAdd.user2, addMatchInHistoryDTO.scoreUser2, addMatchInHistoryDTO.scoreUser1);

		return await this.matchRepositories.save(matchToAdd);
	}
}