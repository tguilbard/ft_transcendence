import { IsNotEmpty, IsString, IsPositive } from "class-validator";
import { Type } from "class-transformer";


export class GenerateTfaDTO {

    @IsString()
    @IsNotEmpty()
    login: string;

    @IsPositive()
    @IsNotEmpty()
    @Type(()=> Number)
    id: number;
}