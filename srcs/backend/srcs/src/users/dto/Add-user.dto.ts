import { IsNotEmpty, IsString, MaxLength, MinLength, IsIn, IsBoolean, IsOptional } from "class-validator";

export class AddUserDTO {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	@MinLength(3)
	@MaxLength(20)
    login: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(10)
    username: string;

	@IsBoolean()
	@IsOptional()
    tfaActivated: boolean;
}