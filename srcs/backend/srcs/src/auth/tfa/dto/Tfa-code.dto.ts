import { IsNotEmpty, IsString, IsPositive } from "class-validator";
import { Type } from "class-transformer";


export class TfaCodeDTO {

    @IsString({
        message: "$property dois etre une string"
    })
    @IsNotEmpty(
        {
            message: "$property ne dois pas etre vide"
        }
    )
    code: string;
}