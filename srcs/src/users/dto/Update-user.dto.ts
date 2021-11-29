import { IsNotEmpty, IsOptional, IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDTO {
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
	@IsOptional()
	password: string;

	@IsString()
	@IsOptional()
	password2: string;
}