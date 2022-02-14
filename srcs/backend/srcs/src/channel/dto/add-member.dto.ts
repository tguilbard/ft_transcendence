import { IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator"

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

	@IsString()
	@IsOptional()
	password: string
}