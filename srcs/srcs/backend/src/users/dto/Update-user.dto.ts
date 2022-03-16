import { IsNotEmpty, IsOptional, IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDTO {
	@IsString(
		{
            message: "$property dois etre une string"
        }
	)
	@IsOptional()
	@MinLength(3, {
		message: "$property dois avoit une taillle minimale 3"
	})
	@MaxLength(255, {
		message: "$property dois avoit une taillle maximale de 255"
	})
    username: string;
}