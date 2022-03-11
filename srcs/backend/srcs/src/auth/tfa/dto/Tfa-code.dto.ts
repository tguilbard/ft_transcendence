import { IsNotEmpty, IsString, IsPositive, IsNumber, IsNumberString, isNumber, isNumberString, IS_NUMBER_STRING } from "class-validator";
import { Type } from "class-transformer";


export class TfaCodeDTO {

    @IsNumberString()
  
    @IsNotEmpty()
    code: string;
}