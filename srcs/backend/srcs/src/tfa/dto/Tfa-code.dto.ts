import { IsNotEmpty, IsString, IsPositive } from "class-validator";
import { Type } from "class-transformer";


export class TfaCodeDTO {

    // @IsPositive()
    // @IsNotEmpty()
    // @Type(()=> Number)
    // id: number;

    @IsString()
    @IsNotEmpty()
    code: string;
}