import { IsNotEmpty, IsString, MaxLength, MinLength, IsIn, IsBoolean } from "class-validator";

export class AddUserDTO {
	@IsString()
	@IsNotEmpty()
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
    pseudo: string;

	@IsBoolean()
    tfaActivated: boolean;

	// @IsString()
	// @IsNotEmpty()
	// password: string;
}