import { IsNotEmpty, IsString, IsPositive } from "class-validator";
import { Type } from "class-transformer";


export class GenerateTfaDTO {

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
    login: string;

    @IsPositive(
        {
            message: "$property dois etre positif"
        }
    )
    @IsNotEmpty(
        {
            message: "$property ne dois pas etre vide"
        }
    )
    @Type(()=> Number)
    id: number;
}