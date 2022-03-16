import { IsNotEmpty, IsString, IsPositive, maxLength, MaxLength } from "class-validator";
import { Type } from "class-transformer";


export class GenerateTfaDTO {

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    login: string;

    @IsPositive()
    @IsNotEmpty()
    @Type(()=> Number)
    id: number;
}