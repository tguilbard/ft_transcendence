import { Transform } from "class-transformer"
import { IsDate, IsNumber, IsOptional } from "class-validator"

export class AddMatchInHistoryDTO
{
	@IsNumber()
	@IsOptional()
	scoreUser1: number

	@IsNumber()
	@IsOptional()
	scoreUser2: number

	@Transform(() => new Date()) //not sure
	@IsDate()
	@IsOptional()
	startAt: Date

	@Transform(() => new Date()) //not sure
	@IsDate()
	@IsOptional()
	endAt: Date

	usersId : number[]
}