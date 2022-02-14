import { HttpException, HttpStatus, Injectable, SerializeOptions } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { ChannelEntity } from './entities/channel.entity';
import { MemberEntity } from './member/entities/member.entity';
import { MemberService } from './member/member.service';
import { MessageService } from './message/message.service';
import * as bcrypt from 'bcrypt'
import { QueryBuilderService } from 'src/generics/class/query-builder.service';
import { ModeService } from './generics/mode.class';
import { ChannelType } from './enum/channel-type.enum';
import { MemberType } from './member/enum/member-type.enum';
import { ChannelMode } from './interfaces/channel-mode.interface';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChannelEntity)
		private channelRepository: Repository<ChannelEntity>,
		private readonly memberService: MemberService,
		private readonly messageService: MessageService,
		private readonly qbService: QueryBuilderService,
		private readonly modeService: ModeService

	){}

	async GetChannels()
	{
		return await this.channelRepository.find();
	}

	async GetChannelsByMode(mode: number)
	{
		const channelRepo = this.qbService.Create("channel", this.channelRepository)
		
		return await channelRepo.where("(channel.mode & :mode) = :mode", {mode: mode})
								//.orderBy("messages.id", "DESC") //id or createdAt dont know what is better
								.getMany();
	}

	async GetChannel(id: number, columnToAdd?)
	{
		const channelRepo = this.qbService.Create("channel", this.channelRepository, columnToAdd)
		
		return await channelRepo.where("channel.id = :id", {id: id})
								//.orderBy("messages.id", "DESC") //id or createdAt dont know what is better
								.getOne();

	}

	async GetChannelByName(chanName: string)
	{
		const channelRepo = this.qbService.Create("channel", this.channelRepository)
		
		return await channelRepo.where("channel.name = :chanName", {chanName: chanName})
								//.orderBy("messages.id", "DESC") //id or createdAt dont know what is better
								.getOne();
	}

	private IsPrivateModeSQL()
	{
		return (`(channel.mode = ${ChannelType.privateMessage} OR channel.mode = ${ChannelType.private})`);
		// return (`channel.mode & ${ChannelType.private} = ${ChannelType.private}`);
		// return (`channel.mode & ${ChannelType.privateMessage} = ${ChannelType.privateMessage}`);
	}

	private IsPrivateMessageModeSQL()
	{
		return (`channel.mode = ${ChannelType.privateMessage}`);
		// return (`channel.mode & ${ChannelType.private} = ${ChannelType.private}`);
		// return (`channel.mode & ${ChannelType.privateMessage} = ${ChannelType.privateMessage}`);
	}

	private IsPublicModeSQL()
	{
		return (`channel.mode & ${ChannelType.public} = ${ChannelType.public}`);
	}

	// return (`(member.mode & ${MemberType.ban}) <> ${MemberType.ban}
	// 	AND (member.mode & ${MemberType.mute}) <> ${MemberType.mute}
	// 	AND (member.mode & ${MemberType.admin}) <> ${MemberType.admin}
	// 	AND (member.mode & ${MemberType.owner}) <> ${MemberType.owner}`)

	async GetChannelsOfUser(userId: number, channelMode: ChannelMode = null)
	{
		// console.log("je suis dans GetChannelsOfUser");
		const channelRepo = this.qbService.Create("channel", this.channelRepository)
		.leftJoin("channel.members", "members")
		.leftJoin("members.user", "user")
		.where("user.id = :id", {id: userId})
		
		if (channelMode == "public")
		{
			channelRepo.andWhere(this.IsPublicModeSQL);
		}
		else if (channelMode == "private")		
		{
			channelRepo.andWhere(this.IsPrivateModeSQL);
			// channelRepo.orWhere("channel.mode = 8");
			// channelRepo.andWhere("channel.mode = 8");
		}
		return await channelRepo.getMany();
	}

	async RenameUserInChannelPrivateMessage (userId: number, username: string, newName: string){
		console.log("je suis dans rename");
		const channelRepo = this.qbService.Create("channel", this.channelRepository)
		.leftJoin("channel.members", "members")
		.leftJoin("members.user", "user")
		.where("user.id = :id", {id: userId})
		
		channelRepo.andWhere(this.IsPrivateMessageModeSQL)
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

	async FindChannelByName(name: string, columnToAdd?: string[])
	{
		const channel = "channel";

		if (columnToAdd)
		{
			columnToAdd.forEach((element, index) => {
				columnToAdd[index] = channel + "." + element;
			});
		}

		return await this.channelRepository.createQueryBuilder(channel)
											.addSelect(columnToAdd)
											.where("name = :name", {name: name})
											.getOne()
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

	//
	async AddMember(user: UserEntity, channelId: number, mode: number, plainTextPassword: string = null)
	{
		const channel = await this.GetChannel(channelId, { select: [ "password" ] });
		if (channel.password != null)
		{
			if (plainTextPassword == null || await bcrypt.compare(plainTextPassword, channel.password) == false)
			{
				throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED)
			}
		}
		//must check private
		return await this.memberService.AddMember(mode, user, channel);
	}

	async UpdateMode(channel: ChannelEntity, mode: "public" | "private", plainTextPassword: string = null)
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

	async UpdatePassword(channel: ChannelEntity, plainTextPassword: string)
	{
		if (channel.password == null && plainTextPassword)
		channel.mode = this.modeService.setMode(channel.mode, ChannelType.protected)
		if (!plainTextPassword || plainTextPassword == '""')
		{
			channel.mode = this.modeService.unsetMode(channel.mode, ChannelType.protected)
			channel.password = null;
		}
		else
			channel.password = await bcrypt.hash(plainTextPassword, 10)
		await this.channelRepository.update({id: channel.id}, channel);
		return { mode: channel.mode, chanName: channel.name};
	}

	//TU PEUX L'UTILISER
	async AddMessage(text: any, sender: MemberEntity)
	{
		return await this.messageService.AddMessage(text, sender);
	}

	private async ChangeMemberAuthorization(memberChanged: MemberEntity, setOrUnset: "set"|"unset",  modeToChange: number)
	{
		if (setOrUnset == "set")
			memberChanged.mode = this.modeService.setMode(memberChanged.mode, modeToChange);
		else
			memberChanged.mode = this.modeService.unsetMode(memberChanged.mode, modeToChange);
	}

	// async SetOwnerMember(memberToBan: MemberEntity, banUntil: Date = null)
	// {
	// 	this.ChangeMemberAuthorization(memberToBan, "set", MemberType.admin);

	// 	return await this.channelRepository.update({id: memberToBan.id}, memberToBan);
	// }

	// async SetMemberMode(memberToChange: MemberEntity, mode: any)
	// {
	// 	const modeOfMember = {
	// 		ban: this.modeService.modeIsSet(memberToChange.mode, MemberType.ban),
	// 		banUntil: null,
	// 		mute: this.modeService.modeIsSet(memberToChange.mode, MemberType.mute),
	// 		muteUntil: null,
	// 		admin: this.modeService.modeIsSet(memberToChange.mode, MemberType.admin),
	// 		owner: this.modeService.modeIsSet(memberToChange.mode, MemberType.owner)
	// 	}
	// 	const newMode = {
	// 		...modeOfMember,
	// 		...mode
	// 	}

	// 	newMode.forEach(element => {
	// 		if (element)
	// 	});
	// 	console.log(newMode);

	// 	memberToChange.mode = mode;
	// 	return await this.channelRepository.update({id: memberToChange.id}, memberToChange);
	// }

	// IsBanMode(member: MemberEntity) : boolean
	// {
	// 	return this.memberService.IsBanMode(member);
	// }

	// IsMuteMode(member: MemberEntity) : boolean
	// {
	// 	return this.memberService.IsBanMode(member);
	// }

	// IsBanOrMuteMode(member: MemberEntity)
	// {
	// 	return this.memberService.IsAdminMode(member);
	// }

	// IsAdminMode(member: MemberEntity) : boolean
	// {
	// 	return this.memberService.IsAdminMode(member);
	// }

	// IsOwnerMode(member: MemberEntity) : boolean
	// {
	// 	return this.memberService.IsOwnerMode(member);
	// }

	// IsAdminOrOwnerMode(member: MemberEntity) : boolean
	// {
	// 	return this.memberService.IsAdminOrOwnerMode(member);
	// }
}