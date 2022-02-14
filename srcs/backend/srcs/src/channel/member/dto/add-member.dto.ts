import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class AddMemberDTO {
	@IsPositive()
	@IsNotEmpty()
	mode: number

	@IsPositive()
	@IsNotEmpty()
	userId: number

	@IsPositive()
	@IsNotEmpty()
	channelId: number
}