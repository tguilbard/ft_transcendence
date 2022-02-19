import { Body, Controller, Get, Param, ParseIntPipe, Req} from "@nestjs/common";
import { Request } from "express";
import { UsersService } from "src/users/users.service";
import { ChatService } from "../chat.service";
import { GetMemberInChannelByChannelIdDTO } from "../dto/get-member-in-channel-by-channel-id.dto";
import { ChannelMode } from "../interfaces/channel-mode.interface";

@Controller()
export class MemberController {
	constructor (
		private readonly chatService : ChatService,
		private readonly usersService : UsersService,
	){}

	@Get("members")
	async Getmembers()
	{
		return await this.chatService.GetMembers();
	}

	@Get("channel/:channelId/members")
	async GetMembersInChannelByChannelId(@Param("channelId", ParseIntPipe) channelId: number,
	@Body() getMembersInChannelByChannelIdDTO: GetMemberInChannelByChannelIdDTO)
	{
		return await this.chatService.GetMemberInChannelByChannelId(channelId, getMembersInChannelByChannelIdDTO.modes);
	}

	@Get("userInChan/:chanName")
	async getUserInChan(@Param("chanName") chanName: string) {
		let chan = await this.chatService.GetChannel(chanName)
		return await this.chatService.getUserInChan(chan);
	}

	@Get("getChanListByMode/:chanMode")
	async getChanListByMode(@Param("chanMode") chanMode: ChannelMode, @Req() request: Request) {
		let user = await this.usersService.FindUserById(request.User.id);
		let list = [];
		try {
		  var chanList = await this.chatService.GetChannelsOfUser(user.id, chanMode);
		  chanList.forEach(e => {
			list.push({name: e.name, mode: e.mode});
		  })
		}
		catch
		{
		}
		return list;
	}
}