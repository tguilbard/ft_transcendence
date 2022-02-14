import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateChannelDTO {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNumber()
	@IsNotEmpty()
	mode: number;

	@IsString()
	@IsOptional()
	password: string;
}