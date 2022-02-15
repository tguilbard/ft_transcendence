import { Body, Controller, Get, Param, ParseIntPipe, Req, Post } from "@nestjs/common";
import { ChannelService } from "src/channel/channel.service";
import { UsersService } from "src/users/users.service";
import { AddMemberDTO } from "./dto/add-member.dto";
import { FindMemberByUserIdAndChannelIdDTO } from "./dto/find-member-by-user-id.dto";
import { GetMemberInChannelByChannelIdDTO } from "./dto/get-members-in-channel-by-channel-id.dto";
import { MemberService } from "./member.service";
import { ChannelMode } from '../../channel/interfaces/channel-mode.interface';
import { Request } from "express";


@Controller()
export class MemberController {
	constructor (
		private readonly memberService : MemberService,
		private readonly usersService : UsersService,
		private readonly channelService: ChannelService
	){}

	@Get("members")
	async Getmembers()
	{
		return await this.memberService.GetMembers();
	}

	@Get("channel/:channelId/members")
	async GetMembersInChannelByChannelId(@Param("channelId", ParseIntPipe) channelId: number,
	@Body() getMembersInChannelByChannelIdDTO: GetMemberInChannelByChannelIdDTO)
	{
		return await this.memberService.GetMemberInChannelByChannelId(channelId, getMembersInChannelByChannelIdDTO.modes);
	}

	@Get("userInChan/:chanName")
	async getUserInChan(@Param("chanName") chanName: string) {
		let chan = await this.channelService.GetChannelByName(chanName)
		return await this.memberService.getUserInChan(chan);
	}

	@Get("getChanListByMode/:chanMode")
	async getChanListByMode(@Param("chanMode") chanMode: ChannelMode, @Req() request: Request) {
		let user = await this.usersService.FindUserById(request.User.id);
		let list = [];
		try {
		  var chanList = await this.channelService.GetChannelsOfUser(user.id, chanMode);
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
