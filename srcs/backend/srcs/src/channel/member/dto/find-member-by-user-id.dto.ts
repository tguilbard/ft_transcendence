import { IsNotEmpty, IsPositive } from "class-validator";

export class FindMemberByUserIdAndChannelIdDTO {
	@IsPositive()
	@IsNotEmpty()
	userId: number;

	@IsPositive()
	@IsNotEmpty()
	channelId: number;
}