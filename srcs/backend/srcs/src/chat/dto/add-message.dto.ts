import { IsNotEmpty, IsPositive, IsString } from "class-validator";

export class AddMessageDTO {

	@IsNotEmpty()
	@IsString()
	text: string;

	@IsNotEmpty()
	@IsPositive()
	userId: number;

	@IsNotEmpty()
	@IsPositive()
	channelId: number;
}