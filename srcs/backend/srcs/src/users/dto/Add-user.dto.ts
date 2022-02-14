import { IsNotEmpty, IsString, MaxLength, MinLength, IsIn, IsBoolean, IsOptional } from "class-validator";

export class AddUserDTO {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	@MinLength(3, {
		message: "La taille minimale du login est 3"
	})
	@MaxLength(255, {
		message: "La taille maximale du login est 255"
	})
    login: string;

	@IsString(
		{
            message: "$property dois etre une string"
        }
	)
	@IsNotEmpty(
		{
            message: "$property ne dois pas etre vide"
        }
	)
	@MinLength(3, {
		message: "$property dois avoir une taille minimale de 3"
	})
	@MaxLength(255, {
		message: "$property dois avoir une taille maximale de 255"
	})
    username: string;

	@IsBoolean(
		{
            message: "$property dois etre un boolean"
        }
	)
	@IsOptional()
    tfaActivated: boolean;

}