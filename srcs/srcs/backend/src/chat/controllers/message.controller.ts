import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ChatService } from "../chat.service";
import { AddMessageDTO } from "../dto/add-message.dto";

@Controller()
export class MessageController {
	constructor(
		private readonly chatService: ChatService
	){}

	@Get('channel/:channelId/message')
	async GetMessageForChannelId(@Param('channelId', ParseIntPipe) channelId: number)
	{
		return await this.chatService.GetMessagesByChannelId(channelId);
	}

	@Get('channel/:channelId/message/:numberOfMessage')
	async GetLastMessageForChannelId(@Param("channelId", ParseIntPipe) channelId: number,
									@Param("numberOfMessage", ParseIntPipe) numberOfMessage: number)
	{
		return await this.chatService.GetMessagesByChannelId(channelId, numberOfMessage);
	}

	@Get('channel/:channelId/message/:numberOfMessage/:MessageId')
	async GetRangeOfMessageForChannelId(@Param("channelId", ParseIntPipe) channelId: number,
									@Param("numberOfMessage", ParseIntPipe) numberOfMessage: number,
									@Param('MessageId', ParseIntPipe) MessageId: number)
	{
		return await this.chatService.GetMessagesSinceMessageIdByChannelId(channelId, MessageId, numberOfMessage);
	}

	//Warning
	// @Post('channel/:channelId/message')
	// async AddMessage(@Param("channelId", ParseIntPipe), @Body() addMessageDTO: AddMessageDTO)
	// {
	// 	const userId = addMessageDTO.userId;
	// 	const member = await this.memberService.FindMemberByUserIdAndChannelId(userId, channelId);

	// 	return await this.channelService.AddMessage(addMessageDTO.text, member);
	// }

	//Warning
	// @Get('messages') //FOR DEV THAT MUST DISAPEAR
	// async GetMessages()
	// {
	// 	return await this.messageService.GetMessages();
	// }
}