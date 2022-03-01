import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilderService } from 'src/generics/class/query-builder.service';
import { UserEntity } from 'src/users/entities/users.entity';
import { Brackets, Column, Repository } from 'typeorm';
import { ChannelEntity } from './entities/channel.entity';
import { MemberEntity } from './entities/member.entity';
import { MessageEntity } from './entities/message.entity';
import { ChannelType } from './enum/channel-type.enum';
import { ModeService } from './generics/mode.class';
import { ChannelMode } from './interfaces/channel-mode.interface';
import * as bcrypt from 'bcrypt';
import { MemberType } from './enum/member-type.enum';
import { SqlFunctionService } from './utils/services/sql-function.service';
import { MemberModes } from './interfaces/user-selection-right.interface';
import { channel } from 'diagnostics_channel';

@Injectable()
export class ChatService {

	constructor(
		@InjectRepository(ChannelEntity)
		private channelRepository: Repository<ChannelEntity>,
		@InjectRepository(MemberEntity)
		private memberRepository: Repository<MemberEntity>,
		@InjectRepository(MessageEntity)
		private messageRepository: Repository<MessageEntity>,
		private readonly qbService: QueryBuilderService,
		private readonly modeService: ModeService,
		private readonly sqlFunctionService: SqlFunctionService

	){}
	
	async GetChannels(columnToAdd?)
	{
		const channelRepo = this.qbService.Create("channel", this.channelRepository, columnToAdd)
		
		return await channelRepo.getMany();
	}

	async GetChannelsByMode(mode: number)
	{
		const channelRepo = this.qbService.Create("channel", this.channelRepository)
		
		return await channelRepo.where("(channel.mode & :mode) = :mode", {mode: mode})
								.getMany();
	}

	async GetChannel(id: number | string, columnToAdd?)
	{
		const channelRepo = this.qbService.Create("channel", this.channelRepository, columnToAdd)
		return await this.qbService.AutoWhere(channelRepo, "channel", id)
									.getOne()
		
	}

	async GetChannelsOfUser(userId: number, channelMode: ChannelMode = null)
	{
		const channelRepo = this.qbService.Create("channel", this.channelRepository)
											.leftJoin("channel.members", "members")
											.leftJoin("members.user", "user")
											.where("user.id = :id", {id: userId})
		
		if (channelMode == "public")
		{
			channelRepo.andWhere(this.sqlFunctionService.ChannelIsPublic);
		}
		else if (channelMode == "private")		
		{
			channelRepo.andWhere(this.sqlFunctionService.ChannelIsPrivate);
		}
		return await channelRepo.getMany();
	}

	async RenameUserInChannelPrivateMessage (userId: number, username: string, newName: string){
		const channelRepo = this.qbService.Create("channel", this.channelRepository)
		.leftJoin("channel.members", "members")
		.leftJoin("members.user", "user")
		.where("user.id = :id", {id: userId})
		
		channelRepo.andWhere(this.sqlFunctionService.ChannelIsPrivate)
		let list = await channelRepo.getMany();
		let li = [];
		list.forEach(e => {
			let tmp: string = e.name;
			let n1 = tmp.substring(tmp.indexOf('-') + 2);
			let n2 = tmp.substring(0, tmp.indexOf('-') - 1);
			if (n1 == username)
				n1 = newName;
			else
				n2 = newName;
			if (n1 < n2)
				e.name = n1 + " - " + n2;
			else
				e.name = n2 + " - " + n1;
			li.push({oldname: username, newname: newName, oldchan: tmp, newchan: e.name});
			this.channelRepository.update(e.id, e);
		})
		if (!li.length)
			li.push({oldname: username, newname: newName, oldchan: '', newchan: ''});	
		return li;
	}

	async CreateChannels(name: string, mode: number, plainTextPassword: string = null)
	{
		const newChannel = {
			name: name,
			mode: mode,
			password: null == plainTextPassword ? null : await bcrypt.hash(plainTextPassword, 10), //must be null if you doesnt use it
			createdAt: new Date(Date.now())
		}
		const channel =  await this.channelRepository.save(newChannel);
		delete channel.password;
		
		return channel;
	}

	async DeleteChannel(channelId: number)
	{
		return await this.channelRepository.delete({id: channelId});
	}

	private async PasswordIsValid(plainTextPassword: string, passwordCrypted: string)
	{
		if (passwordCrypted != null)
		{
			if (plainTextPassword == null || await bcrypt.compare(plainTextPassword, passwordCrypted) == false)
			{
				return false
			}
		}
		return true
	}

	async AddMember(user: UserEntity, channelId: number, mode: number, plainTextPassword: string = null)
	{
		const channel = await this.GetChannel(channelId, { select: [ "password" ] });
		if (!await this.PasswordIsValid(plainTextPassword, channel.password))
		{
			throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
		}

		const potentialSoftDeletedMember = await this.memberRepository.createQueryBuilder("member")
													.withDeleted()
													.leftJoinAndSelect("member.user", "user")
													.leftJoinAndSelect("member.channel", "channel")
													.where("user.id = :userId", { userId: user.id })
													.andWhere("channel.id = :channelId", { channelId: channel.id })
													.getOne()

		if (potentialSoftDeletedMember && potentialSoftDeletedMember.deletedAt != null)
		{
			return await this.memberRepository.restore(potentialSoftDeletedMember.id)
		}
		else
		{
			const member = {
				mode: mode,
				user: user,
				channel: channel
			}

			return await this.memberRepository.save(member);
		}
	}

	async UpdateChannelMode(channel: ChannelEntity, mode: "public" | "private", plainTextPassword: string = null)
	{
		if (mode == "public")
		{
			channel.mode = this.modeService.setMode(channel.mode, ChannelType.public);
			channel.password = null;
		}
		else if (mode == "private")
		{
			channel.mode = this.modeService.setMode(channel.mode, ChannelType.private);
			channel.password = null;
		}
		return await this.channelRepository.update({id: channel.id}, channel)
	}

	async UpdateChannelPassword(channel: ChannelEntity, plainTextPassword?: string)
	{
		if (channel.password == null && plainTextPassword)
		channel.mode = this.modeService.setMode(channel.mode, ChannelType.protected)
		if (!plainTextPassword || plainTextPassword == '""') //Warning
		{
			channel.mode = this.modeService.unsetMode(channel.mode, ChannelType.protected)
			channel.password = null;
		}
		else
			channel.password = await bcrypt.hash(plainTextPassword, 10)
		await this.channelRepository.update({id: channel.id}, channel);
		return { mode: channel.mode, chanName: channel.name};
	}

	async ReadMessage(senderId: number)
	{
		return await this.memberRepository.update({id: senderId}, {unreadMessage: 0});
	}

	async AddMessage(text: any, senderId: number)
	{
		const sender = await this.memberRepository.createQueryBuilder("member")
								.leftJoinAndSelect("member.channel", "channel")
								.leftJoinAndSelect("channel.members", "members")
								.where("member.id = :id", {id: senderId})
								.getOne();
		const newMessage = {
			createdAt: text.time,
			text: text.message,
			member: sender,
			channel: sender.channel
		}
		const message = await this.messageRepository.save(newMessage);
		sender.channel.members.forEach(async element => {
			await this.memberRepository.update({id: element.id}, {unreadMessage: element.unreadMessage + 1});
		});
		return message;
	}

	private async ChangeMemberAuthorization(memberChanged: MemberEntity, setOrUnset: "set"|"unset",  modeToChange: number)
	{
		if (setOrUnset == "set")
			memberChanged.mode = this.modeService.setMode(memberChanged.mode, modeToChange);
		else
			memberChanged.mode = this.modeService.unsetMode(memberChanged.mode, modeToChange);
	}

	async SetMuteMember(memberToMute: MemberEntity, muteUntil: Date = null)
	{
		this.UnsetAdminMember(memberToMute);
		this.SetUnbanMember(memberToMute);
		this.ChangeMemberAuthorization(memberToMute, "set", MemberType.mute);
		memberToMute.MuteUntil = muteUntil;

		return await this.memberRepository.update({id: memberToMute.id}, memberToMute);
	}

	async SetUnmuteMember(memberToUnmute: MemberEntity)
	{
		await this.ChangeMemberAuthorization(memberToUnmute, "unset", MemberType.mute);
		memberToUnmute.MuteUntil = null;

		return await this.memberRepository.update({id: memberToUnmute.id}, memberToUnmute);
	}

	async SetBanMember(memberToBan: MemberEntity, banUntil: Date = null)
	{
		await this.UnsetAdminMember(memberToBan);
		await this.SetUnmuteMember(memberToBan);
		this.ChangeMemberAuthorization(memberToBan, "set", MemberType.ban);
		memberToBan.BanUntil = banUntil;
		return await this.memberRepository.update({id: memberToBan.id}, memberToBan);
	}

	async SetUnbanMember(memberToUnban: MemberEntity)
	{
		this.ChangeMemberAuthorization(memberToUnban, "unset", MemberType.ban);
		memberToUnban.BanUntil = null;

		return await this.memberRepository.update({id: memberToUnban.id}, memberToUnban);
	}

	async SetAdminMember(memberToPromoteAdmin: MemberEntity)
	{
		this.SetUnmuteMember(memberToPromoteAdmin);
		this.SetUnbanMember(memberToPromoteAdmin);
		this.ChangeMemberAuthorization(memberToPromoteAdmin, "set", MemberType.admin);

		return await this.memberRepository.update({id: memberToPromoteAdmin.id}, memberToPromoteAdmin);
	}

	async UnsetAdminMember(memberToUnpromote: MemberEntity)
	{
		this.ChangeMemberAuthorization(memberToUnpromote, "unset", MemberType.admin);

		return await this.memberRepository.update({id: memberToUnpromote.id}, memberToUnpromote);
	}

	async SetOwnerMember(memberToPromote: MemberEntity)
	{
		this.ChangeMemberAuthorization(memberToPromote, "set", MemberType.owner);

		return await this.memberRepository.update({id: memberToPromote.id}, memberToPromote);
	}

	async UnsetOwnerMember(memberToUnpromote: MemberEntity)
	{
		this.ChangeMemberAuthorization(memberToUnpromote, "unset", MemberType.owner);

		return await this.memberRepository.update({id: memberToUnpromote.id}, memberToUnpromote);
	}

	async GetMembers()
	{
		return await this.memberRepository.find({relations: ["user", "channel"]}); 
	}

	async GetMember(id : number | string, columnToAdd?)
	{
		const qbs = this.qbService.Create("member", this.memberRepository, columnToAdd)
		return await this.qbService.AutoWhere(qbs, "member", id)
									.getOne();
	}

	MemberIsMute(member: MemberEntity) : boolean
	{
		if (this.modeService.modeIsSet(member.mode, MemberType.mute) && !this.modeService.modeIsSet(member.mode, MemberType.ban))
		{
			if (member.MuteUntil == null || member.MuteUntil > new Date())
				return true;
			//WARNING
		}
		return false;
	}

	MemberIsBan(member: MemberEntity) : boolean
	{
		if (this.modeService.modeIsSet(member.mode, MemberType.ban))
		{
			if (member.BanUntil == null || member.BanUntil > new Date())
				return true;
			//WARNING
		}
		return false;
	}

	MemberIsMuteOrBan(member: MemberEntity) : boolean
	{
		if (this.MemberIsMute(member))
			return true;
		else if (this.MemberIsBan(member))
			return true;
		else
			return false;
	}

	MemberIsAdmin(member: MemberEntity) : boolean
	{
		if (this.modeService.modeIsSet(member.mode, MemberType.admin))
		{
			return true;
		}
		return false;
	}

	MemberIsOwner(member: MemberEntity) : boolean
	{
		if (this.modeService.modeIsSet(member.mode, MemberType.owner))
		{
			return true;
		}
		return false;
	}

	MemberIsAdminOrOwner(member: MemberEntity)
	{
		if (this.MemberIsAdmin(member))
		{
			return true;
		}
		else if (this.MemberIsOwner(member))
		{
			return true;
		}
	}

	MemberHasRightToWrite(member: MemberEntity) : boolean
	{
		if (this.modeService.modeIsSet(member.mode, MemberType.mute) || this.modeService.modeIsSet(member.mode, MemberType.ban))
		{
			return false;
		}

		const actualDate = new Date()
		if (member.BanUntil > actualDate || member.MuteUntil > actualDate)
		{
			return false;
		}
		return true;
	}

	async SoftDeleteMember(memberId: number)
	{
		let memberReadyToDelete = await this.GetMember(memberId);
		this.UnsetAdminMember(memberReadyToDelete);
		this.UnsetOwnerMember(memberReadyToDelete);

		await this.memberRepository.update({id: memberId}, {mode: memberReadyToDelete.mode});
		return await this.memberRepository.softDelete({id: memberId});
	}

	async GetMemberInChannelByChannelId(channelId: number, memberModeSelection: MemberModes[] = ["member"])
	{
		const dictionnary = {
			"mute": this.sqlFunctionService.MemberIsMute(),
			"ban": this.sqlFunctionService.MemberIsBan(),
			"member": this.sqlFunctionService.MemberIsNormal(),
			"admin": this.sqlFunctionService.MemberIsAdmin(),
			"owner": this.sqlFunctionService.MemberIsOwner(),
			"free": this.sqlFunctionService.MemberIsOwnerOrAdminOrNormal(),
			"constrain": this.sqlFunctionService.MemberIsMuteOrBan()
		}
		return await this.memberRepository.createQueryBuilder("member")
			.leftJoinAndSelect("member.user", "user")
			.leftJoinAndSelect("member.channel", "channel")
			.where(`channel.id = :channelId`, {channelId: channelId})
			.andWhere(new Brackets(qb => 
				memberModeSelection.forEach((element, index) => {
					if (index == 0)
						qb.where(dictionnary[element])
					else
						qb.orWhere(dictionnary[element])
				}
			)))
			.getMany()
	}

	async checkModeInMembers(server: any)
	{
		const list = await this.GetMembers();
		let date = new Date();
		list.forEach(e => {
			if (e.MuteUntil && e.MuteUntil <= date)
			{
				this.SetUnmuteMember(e);
				// server.to(payload[1]).emit('setMod', member.mode);
				// server.to(client.id).emit('setMyMod', member.mode, chanTarget.name);
				// return await this.GetMember(member.id);
				if (server)
					server.emit("new_mode", e.channel.name, e.user.username, e.mode);
			}
			if (e.BanUntil && e.BanUntil <= date)
			{
				this.SetUnbanMember(e);
				if (server)
					server.emit("new_mode", e.channel.name, e.user.username, e.mode);

				// server.to(payload[1]).emit('setMod', e.mode);
				// server.to(client.id).emit('setMyMod', member.mode, chanTarget.name);
			}

		} )
	}

	async GetMemberByUserIdAndChannelId(userId: number, channelId: number, columnToAdd?)
	{
		const qb = this.qbService.Create("member", this.memberRepository)
									.leftJoin("member.user", "user")
									.leftJoin("member.channel", "channel")

		return await this.qbService.Join(qb, "member", columnToAdd)
									.where("user.id = :userId AND channel.id = :channelId", {userId: userId, channelId: channelId})
									.getOne()
	}

	async getUserInChan(chan: ChannelEntity) {
	  let list = []
	  if (!chan)
		return list;
	  let memberList = await this.GetMemberInChannelByChannelId(chan.id, ["free", "constrain"])
	  for (let member of memberList) {
		  	member.user.mode = member.mode;
			list.push(member.user);
		}
	  return list;
	}

	async GetMessagesByChannelId(channelId: number, limit: number = 0) : Promise<MessageEntity[]>
	{
		return await this.messageRepository.createQueryBuilder("message")
											.withDeleted()
											.orderBy("message.id", "DESC")
											.leftJoinAndSelect("message.member", "member", undefined, undefined)
											.leftJoin("member.channel", "channel")
											.leftJoinAndSelect("member.user", "user")
											.where("channel.id = :channelId", { channelId: channelId })
											.limit(limit)
											.getMany();

	}

	async GetMessagesSinceMessageIdByChannelId(channelId: number, messageId: number, limit: number = 0)
	{
		return await this.messageRepository.createQueryBuilder("message")
											.withDeleted()
											.orderBy("message.id", "DESC")
											.where(":messageId > message.id", { messageId: messageId })
											.leftJoinAndSelect("message.member", "member")
											.leftJoin("member.channel", "channel")
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
