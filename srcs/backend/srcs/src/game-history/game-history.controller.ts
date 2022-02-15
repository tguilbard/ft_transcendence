import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AddMatchInHistoryDTO } from './dto/add-match-in-history.dto';
import { MatchEntity } from './entities/game-history.entity';
import { GameHistoryService } from './game-history.service';

@Controller('game-history')
export class GameHistoryController {
	constructor(
		private readonly gameHistoryService : GameHistoryService
	){}

	@Get()
	async GetAll() : Promise<MatchEntity[]> {
		return await this.gameHistoryService.GetAll();
	}

	@Get(':username')
	async GetAllMatchsForUser(@Param('username') username: string) : Promise<MatchEntity[]> {
		const list = await this.gameHistoryService.GetAllMatchsForUser(username);
		console.log("list matchs:\n", list);
		return list;
	}

	@Post() //MUST disapear it's an internal function of match
	async AddMatchInHistory(@Body() addMatchInHistoryDTO: AddMatchInHistoryDTO) : Promise<MatchEntity>{
		return await this.gameHistoryService.AddMatchInHistory(addMatchInHistoryDTO)
			// .catch(err => {
			// 	throw new HttpException({
			//  	 message: err.message
			// 	}, HttpStatus.BAD_REQUEST);
		  	// 	})
	}
}
