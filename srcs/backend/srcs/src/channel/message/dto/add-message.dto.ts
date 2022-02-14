import { IsNotEmpty, IsPositive, IsString, MinLength } from "class-validator";

export class AddMessageDTO{

	@IsString()
	@MinLength(1)
	@IsNotEmpty()
	text : string;

	@IsPositive()
	@IsNotEmpty()
	userId : number; //memberId could be better

}