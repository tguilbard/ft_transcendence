import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ChannelService } from '../channel.service';
import { MemberService } from '../member/member.service';
import { AddMessageDTO } from './dto/add-message.dto';
import { MessageService } from './message.service';

@Controller()
export class MessageController {
	constructor(
		private readonly channelService: ChannelService,
		private readonly messageService : MessageService,
		private readonly memberService : MemberService,
	){}

	@Get('channel/:channelId/message')
	async GetMessageForChannelId(@Param('channelId', ParseIntPipe) channelId: number)
	{
		return await this.messageService.FindMessagesByChannelId(channelId);
	}

	@Get('channel/:channelId/message/:numberOfMessage')
	async GetLastMessageForChannelId(@Param("channelId", ParseIntPipe) channelId: number,
									@Param("numberOfMessage", ParseIntPipe) numberOfMessage: number)
	{
		return await this.messageService.FindMessagesByChannelId(channelId, numberOfMessage);
	}

	@Get('channel/:channelId/message/:numberOfMessage/:MessageId')
	async GetRangeOfMessageForChannelId(@Param("channelId", ParseIntPipe) channelId: number,
									@Param("numberOfMessage", ParseIntPipe) numberOfMessage: number,
									@Param('MessageId', ParseIntPipe) MessageId: number)
	{
		return await this.messageService.FindMessagesSinceMessageIdByChannelId(channelId, MessageId, numberOfMessage);
	}

	@Post('channel/:channelId/message')
	async AddMessage(@Param("channelId", ParseIntPipe) channelId: number, @Body() addMessageDTO: AddMessageDTO)
	{
		const userId = addMessageDTO.userId;
		const member = await this.memberService.FindMemberByUserIdAndChannelId(userId, channelId);

		return await this.channelService.AddMessage(addMessageDTO.text, member);
	}

	@Get('messages') //FOR DEV THAT MUST DISAPEAR
	async GetMessages()
	{
		return await this.messageService.GetMessages();
	}
}
