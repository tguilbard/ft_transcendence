import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ChannelService } from './channel.service';
import { AddMemberDTO } from './dto/add-member.dto';
import { AddMessageDTO } from './dto/add-message-dto';
import { CreateChannelDTO } from './dto/create-channel.dto';
import { MemberService } from './member/member.service';
import { ChannelType } from '../channel/enum/channel-type.enum';
import { MessageService } from '../channel/message/message.service';
import { MessageClass } from '../channel/message/interfaces/message-class.interface'
import { ModeService } from './generics/mode.class';
import { Request } from 'express';
import { MemberType } from './member/enum/member-type.enum';


@Controller('channel')
export class ChannelController {
	constructor(
		private readonly channelService: ChannelService,
		private readonly usersService: UsersService,
		private readonly memberService: MemberService,
		private readonly messageService: MessageService,
		private readonly modeService: ModeService
	) { }

	@Get()
	async GetChannels() {
		return await this.channelService.GetChannels();
	}

	@Get('mode/:chanName/:userTarget')
	async GetMode(@Req() req: Request, @Param("chanName") chanName: string, @Param("userTarget") userTarget: string)
	{
		let user = await this.usersService.FindUserByUsername(userTarget);
		let chan =  await this.channelService.FindChannelByName(chanName);
		let member = await this.memberService.FindMemberByUserIdAndChannelId(user.id, chan.id);
		return member.mode;
	}

	@Get("MessagesInChannel/:chanName")
	async getMessagesInChannel(@Param("chanName") chanName: string, @Req() request: Request) {
		let userId = request.User.id;
		let chan = await this.channelService.FindChannelByName(chanName);
		if (!chan) return;
		let member = await this.memberService.FindMemberByUserIdAndChannelId(userId, chan.id);
		if (!member)
			return;
		if (this.modeService.modeIsSet(member.mode, MemberType.ban))
			return [];
		let chanList = await this.messageService.FindMessagesByChannelId(chan.id, 50);
		let listMsg: MessageClass[] = [];
		let old: boolean = false;
		let i = chanList.length;
		while (--i >= 0) {
			if (chanList[i + 1] && chanList[i + 1].member.user.username != chanList[i].member.user.username) {
				if (old)
					old = false;
				else
					old = true;
			}
			const msg: MessageClass = {
				username: chanList[i].member.user.username,
				message: chanList[i].text,
				time: this.messageService.dateToString(chanList[i].createdAt),
				colored: old
			}
			listMsg.push(msg);
		}
		return listMsg;
	}

	@Delete("delete-member/:id")
	async DeleteMember(@Param("id") id: number)
	{
		try
		{
			return await this.memberService.SoftDeleteMember(id);
		}
		catch(err)
		{
			throw new HttpException(
				{ message: err.message },
				HttpStatus.BAD_REQUEST);
		}
	}

	@Get("ListChannelPublic")
	async getListChannelPublic() {
		let chanList = await this.channelService.GetChannelsByMode(ChannelType.public);
		return chanList;
	}

	@Delete(":channelId")
	async delete(@Param("channelId", ParseIntPipe) channelId: number) {
		return await this.channelService.DeleteChannel(channelId);
	}
	
	@Get(":channelId/full")
	async GetChannelWithMessages(@Param("channelId", ParseIntPipe) channelId: number) {
		return await this.channelService.GetChannel(channelId, { relation: ["messages", "members"] });
	}

	@Get(":channelId")
	async GetChannel(@Param("channelId", ParseIntPipe) channelId: number) {
		return await this.channelService.GetChannel(channelId);
	}

	@Post()
	async CreateChannel(@Body() createChannelDTO: CreateChannelDTO) {
		return await this.channelService.CreateChannels(createChannelDTO.name, createChannelDTO.mode, createChannelDTO.password);
	}

	@Post("add-member")
	async AddMember(@Body() addMemberDTO: AddMemberDTO)
	{
		try
		{
			return await this.channelService.AddMember(await this.usersService.FindUserById(addMemberDTO.userId), addMemberDTO.channelId,
													addMemberDTO.mode,
													addMemberDTO.password)
		}
		catch(err)
		{
			throw new HttpException(
				{ message: err.message },
				HttpStatus.BAD_REQUEST);
		}
	}

	@Post("add-message")
	async AddMessage(@Body() addMessageDTO: AddMessageDTO) {
		const userId = addMessageDTO.userId;
		const channelId = addMessageDTO.channelId;
		const member = await this.memberService.FindMemberByUserIdAndChannelId(userId, channelId);

		return await this.channelService.AddMessage(addMessageDTO.text, member);
	}
}
