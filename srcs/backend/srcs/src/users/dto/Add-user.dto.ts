import { IsNotEmpty, IsString, MaxLength, MinLength, IsIn, IsBoolean, IsOptional } from "class-validator";

export class AddUserDTO {
	@IsString()
	@IsOptional()
	@MinLength(3, {
		message: "La taille minimale du login est 3"
	})
	@MaxLength(255, {
		message: "La taille maximale du login est 255"
	})
    login: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(3, {
		message: "La taille minimale du login est 3"
	})
	@MaxLength(255, {
		message: "La taille maximale du login est 255"
	})
    username: string;

	@IsBoolean()
	@IsOptional()
    tfaActivated: boolean;

	// @IsString()
	// @IsNotEmpty()
	// password: string;
}