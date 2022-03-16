import { IsArray, isArray, IsEnum, IsIn, IsOptional } from "class-validator";
import { MemberModes } from "../interfaces/user-selection-right.interface";

export class GetMemberInChannelByChannelIdDTO {

	//must create decorator for check if is it MemberMode
	@IsArray()
	@IsOptional()
	modes: MemberModes[]
}