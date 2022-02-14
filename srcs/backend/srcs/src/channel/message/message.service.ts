import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from '../member/entities/member.entity';
import { MessageEntity } from './entitites/message.entity';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(MessageEntity)
		private readonly messageRepository : Repository<MessageEntity>
	){}

	async AddMessage(text: any, sender: MemberEntity)
	{
		const newMessage = {
			createdAt: text.time,
			text: text.message,
			member: sender,
			channel: sender.channel
		}
		return await this.messageRepository.insert(newMessage);
	}

	async FindMessagesByChannelId(channelId: number, limit: number = 0)
	{
		return await this.messageRepository.createQueryBuilder("message")
											.withDeleted()
											.orderBy("message.id", "DESC")
											.leftJoin("message.channel", "channel")
											.leftJoinAndSelect("message.member", "member", undefined, undefined)
											.leftJoinAndSelect("member.user", "user")
											.where("channel.id = :channelId", { channelId: channelId })
											.limit(limit)
											.getMany();

	}

	async FindMessagesSinceMessageIdByChannelId(channelId: number, messageId: number, limit: number = 0)
	{
		return await this.messageRepository.createQueryBuilder("message")
											.withDeleted()
											.orderBy("message.id", "DESC")
											.where(":messageId > message.id", { messageId: messageId })
											.leftJoin("message.channel", "channel")
											.leftJoinAndSelect("message.member", "member")
											.leftJoinAndSelect("member.user", "user")
											.andWhere("channel.id = :channelId", { channelId: channelId })
											.limit(limit)
											.getMany();

	}

	async GetMessages()
	{
		return await this.messageRepository.find();
	}

	public dateToString(date_ob: Date): string
	{
	  const date = ("0" + date_ob.getDate()).slice(-2);
	  const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
	  const year = date_ob.getFullYear();
	  const hours = date_ob.getHours();
	  const minutes = date_ob.getMinutes();
	  const seconds = date_ob.getSeconds();
	  
	  return (year + "/" + month + "/" + date + " " + hours + ":" + minutes + ":" + seconds);
	}
}
