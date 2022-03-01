import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { UsersService } from "src/users/users.service";
import { ChatService } from "../chat.service";
import { AddMemberDTO } from "../dto/add-member.dto";
import { AddMessageDTO } from "../dto/add-message.dto";
import { CreateChannelDTO } from "../dto/create-channel.dto";
import { ChannelType } from "../enum/channel-type.enum";
import { MemberType } from "../enum/member-type.enum";
import { ModeService } from "../generics/mode.class";
import { MessageClass } from "../interfaces/message-class.interface";

@Controller('channel')
export class ChannelController {
	constructor(
		private readonly usersService: UsersService,
		private readonly chatService: ChatService,
		private readonly modeService: ModeService
	) { }

	@Get()
	async GetChannels() {
		return await this.chatService.GetChannels();
	}

	@Get('mode/:chanName/:userTarget')
	async GetMode(@Req() req: Request, @Param("chanName") chanName: string, @Param("userTarget") userTarget: string): Promise<any>
	{
		let user = await this.usersService.FindUserByUsername(userTarget);
		let chan =  await this.chatService.GetChannel(chanName);
		let member = await this.chatService.GetMemberByUserIdAndChannelId(user.id, chan.id);
		return member.mode;
	}

	@Get("MessagesInChannel/:chanName")
	async getMessagesInChannel(@Param("chanName") chanName: string, @Req() request: Request) {
		let userId = request.User.id;
		let chan = await this.chatService.GetChannel(chanName);
		if (!chan) return;
		let member = await this.chatService.GetMemberByUserIdAndChannelId(userId, chan.id);
		if (!member)
			return;
		if (this.modeService.modeIsSet(member.mode, MemberType.ban))
			return [];
		let msgList = await this.chatService.GetMessagesByChannelId(chan.id, 50);
		let listMsg: MessageClass[] = [];
		let old: boolean = false;
		let i = msgList.length;
		while (--i >= 0) {
			if (msgList[i + 1] && msgList[i + 1].member.user.username != msgList[i].member.user.username) {
				if (old)
					old = false;
				else
					old = true;
			}
			const msg: MessageClass = {
				username: msgList[i].member.user.username,
				message: msgList[i].text,
				time: this.chatService.dateToString(msgList[i].createdAt),
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
			return await this.chatService.SoftDeleteMember(id);
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
		return await this.chatService.GetChannelsByMode(ChannelType.public);
	}

	@Delete(":channelId")
	async delete(@Param("channelId", ParseIntPipe) channelId: number) {
		return await this.chatService.DeleteChannel(channelId);
	}
	
	@Get(":channelId/full")
	async GetChannelWithMessages(@Param("channelId", ParseIntPipe) channelId: number) {
		return await this.chatService.GetChannel(channelId, { relation: ["messages", "members"] });
	}

	@Get(":channelId")
	async GetChannel(@Param("channelId", ParseIntPipe) channelId: number) {
		return await this.chatService.GetChannel(channelId);
	}

	@Post()
	async CreateChannel(@Body() createChannelDTO: CreateChannelDTO) {
		return await this.chatService.CreateChannels(createChannelDTO.name, createChannelDTO.mode, createChannelDTO.password);
	}

	@Post("add-member")
	async AddMember(@Body() addMemberDTO: AddMemberDTO)
	{
		try
		{
			return await this.chatService.AddMember(await this.usersService.FindUserById(addMemberDTO.userId), addMemberDTO.channelId,
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
		const member = await this.chatService.GetMemberByUserIdAndChannelId(userId, channelId);

		return await this.chatService.AddMessage(addMessageDTO.text, member.id);
	}
}