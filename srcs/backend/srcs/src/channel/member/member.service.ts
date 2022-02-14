import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { channel } from 'diagnostics_channel';
import { truncate } from 'fs';
import { UserEntity } from 'src/users/entities/users.entity';
import { Brackets, Repository } from 'typeorm';
import { ChannelEntity } from '../entities/channel.entity';
import { ModeService } from '../generics/mode.class';
import { MemberEntity } from './entities/member.entity';
import { MemberType } from './enum/member-type.enum';
import { MemberModes } from './interfaces/user-selection-right.interface';

//@Injectable()
export class MemberService {
	constructor(
		@InjectRepository(MemberEntity)
		private readonly memberRepository: Repository<MemberEntity>,
		private readonly modeService: ModeService
	){}

	private async ChangeMemberAuthorization(memberChanged: MemberEntity, setOrUnset: "set"|"unset",  modeToChange: number)
	{
		if (setOrUnset == "set")
			memberChanged.mode = this.modeService.setMode(memberChanged.mode, modeToChange);
		else
			memberChanged.mode = this.modeService.unsetMode(memberChanged.mode, modeToChange);
	}

	
	async SetMuteMember(memberToMute: MemberEntity, muteUntil: Date = null)
	{
		this.ChangeMemberAuthorization(memberToMute, "set", MemberType.mute);
		memberToMute.MuteUntil = muteUntil;

		return await this.memberRepository.update({id: memberToMute.id}, memberToMute);
	}

	async SetUnmuteMember(memberToUnmute: MemberEntity)
	{
		this.ChangeMemberAuthorization(memberToUnmute, "unset", MemberType.mute);
		memberToUnmute.MuteUntil = null;

		return await this.memberRepository.update({id: memberToUnmute.id}, memberToUnmute);
	}

	async SetBanMember(memberToBan: MemberEntity, banUntil: Date = null)
	{
		this.ChangeMemberAuthorization(memberToBan, "set", MemberType.ban);
		memberToBan.MuteUntil = banUntil;
		return await this.memberRepository.update({id: memberToBan.id}, memberToBan);
	}

	async SetUnbanMember(memberToUnban: MemberEntity)
	{
		this.ChangeMemberAuthorization(memberToUnban, "unset", MemberType.ban);
		memberToUnban.MuteUntil = null;

		return await this.memberRepository.update({id: memberToUnban.id}, memberToUnban);
	}

	async SetAdminMember(memberToPromoteAdmin: MemberEntity)
	{
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

	async AddMember(mode: number, user: UserEntity, channel: ChannelEntity)
	{
		console.log(user)
		console.log(channel);
	
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

	IsMuteMode(member: MemberEntity) : boolean
	{
		if (this.modeService.modeIsSet(member.mode, MemberType.mute) && !this.modeService.modeIsSet(member.mode, MemberType.ban))
		{
			if (member.MuteUntil == null || member.MuteUntil > new Date())
				return true;
			//maybe do change
		}
		return false;
	}

	IsBanMode(member: MemberEntity) : boolean
	{
		if (this.modeService.modeIsSet(member.mode, MemberType.ban))
		{
			if (member.BanUntil == null || member.BanUntil > new Date())
				return true;
			//maybe do change
		}
		return false;
	}

	IsMuteOrBanMode(member: MemberEntity) : boolean
	{
		if (this.IsMuteMode(member))
			return true;
		else if (this.IsBanMode(member))
			return true;
		else
			return false;
	}

	IsAdminMode(member: MemberEntity) : boolean
	{
		if (this.modeService.modeIsSet(member.mode, MemberType.admin))
		{
			return true;
		}
		return false;
	}

	IsOwnerMode(member: MemberEntity) : boolean
	{
		if (this.modeService.modeIsSet(member.mode, MemberType.owner))
		{
			return true;
		}
		return false;
	}

	IsAdminOrOwnerMode(member: MemberEntity)
	{
		if (this.IsAdminMode(member))
		{
			return true;
		}
		else if (this.IsOwnerMode(member))
		{
			return true;
		}
	}

	HaveRightToWrite(member: MemberEntity) : boolean
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

	private IsBanModeSQL()
	{
		//console.log(`isBan : ${MemberType.ban}`);

		return (`(member.mode & ${MemberType.ban}) = ${MemberType.ban}`)
	}

	private IsMuteModeSQL()
	{
		//console.log("isMute");
		return (`(member.mode & ${MemberType.mute}) = ${MemberType.mute} AND (member.mode & ${MemberType.ban}) <> ${MemberType.ban}`)
	}

	private IsMemberModeSQL()
	{
		//console.log("isMember");
		return (`(member.mode & ${MemberType.ban}) <> ${MemberType.ban}
		AND (member.mode & ${MemberType.mute}) <> ${MemberType.mute}
		AND (member.mode & ${MemberType.admin}) <> ${MemberType.admin}
		AND (member.mode & ${MemberType.owner}) <> ${MemberType.owner}`)
	}

	IsAdminModeSQL(): string
	{
		//console.log("isAdmin");
		return (`(member.mode & ${MemberType.admin}) = ${MemberType.admin}`)

		return (`(member.mode & ${MemberType.owner}) = ${MemberType.owner}
		AND (member.mode & ${MemberType.mute}) <> ${MemberType.mute}
		AND (member.mode & ${MemberType.ban}) <> ${MemberType.ban}`) //if admin dont lose automaticly their status
	}

	private IsOwnerModeSQL()
	{
		//console.log("isOwner");
		return (`(member.mode & ${MemberType.owner}) = ${MemberType.owner}`)
	}

	IsOwnerOrAdminOrMemberModeSQL()
	{
		//console.log("isFree");	
		return "(" + this.IsMemberModeSQL() + " ) OR ( " + this.IsAdminModeSQL() + " ) OR ( " + this.IsOwnerModeSQL() + " )";
	}

	private IsMuteOrBanModeSQL()
	{
		//console.log("isConstrain");
		return this.IsBanModeSQL() + " OR " + this.IsMuteModeSQL();
	}

	private a(channelId: number) : string
	{
		return (`channel.id = ${channelId}`)
	}

	async SoftDeleteMember(memberId: number)
	{
		// let date = { deletedAt: new Date(), mode: 42 };
		// console.log("in softDeleteMember");
		// console.log(await this.memberRepository.findByIds([memberId]));
		console.log(await this.memberRepository.softDelete({id: memberId}));
		// await this.memberRepository.restore({id: 4});
		// console.log(await this.GetMembers());
		// console.log(await this.memberRepository.delete({id: memberId}));
		// console.log(await this.GetMembers());
	}

	async GetMemberInChannelByChannelId(channelId: number, memberModeSelection: MemberModes[] = ["member"])
	{
		const dictionnary = {
			"mute": this.IsMuteModeSQL(),
			"ban": this.IsBanModeSQL(),
			"member": this.IsMemberModeSQL(),
			"admin": this.IsAdminModeSQL(),
			"owner": this.IsOwnerModeSQL(),
			"free": this.IsOwnerOrAdminOrMemberModeSQL(),
			"constrain": this.IsMuteOrBanModeSQL()
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


	async FindMemberByUserIdAndChannelId(userId: number, channelId: number)
	{
		const a = await this.memberRepository
			.createQueryBuilder("member")
			.leftJoinAndSelect("member.user", "user")
			.leftJoinAndSelect("member.channel", "channel")
			.where("user.id = :userId AND channel.id = :channelId", {userId: userId, channelId: channelId})
			//.where("member.id = :userId", {userId: userId})
			.getOne()

		return await a;
	}

	async FindMemberWithChannelByUserIdAndChannelId(userId: number, channelId: number)
	{
		return await this.memberRepository
			.createQueryBuilder("member")
			.leftJoin("member.user", "user")
			.leftJoinAndSelect("member.channel", "channel")
			.where("user.id = :userId AND channel.id = :channelId", {userId: userId, channelId: channelId})
			.getOne()
	}

	async FindMemberWithUserByUserIdAndChannelId(userId: number, channelId: number)
	{
		return await this.memberRepository
			.createQueryBuilder("member")
			.leftJoinAndSelect("member.user", "user")
			.leftJoin("member.channel", "channel")
			.where("user.id = :userId AND channel.id = :channelId", {userId: userId, channelId: channelId})
			.getOne()
	}

	async FindMemberWithUserAndChannelByUserIdAndChannelId(userId: number, channelId: number)
	{
		return await this.memberRepository
			.createQueryBuilder("member")
			.leftJoinAndSelect("member.user", "user")
			.leftJoinAndSelect("member.channel", "channel")
			.where("user.id = :userId AND channel.id = :channelId", {userId: userId, channelId: channelId})
			.getOne()
	}

	
	async getUserInChan(chan: ChannelEntity) {
	  console.log("je suis dans getUsersInChan");
	  let list = []
	  if (!chan)
		return list;
	  let memberList = await this.GetMemberInChannelByChannelId(chan.id, ["free", "constrain"])
	  for (let member of memberList) {
		// if (!(member.user.state == "logout" && member.user.login == ""))
			list.push({username: member.user.username, state: member.user.state, mode: member.mode});
		}
	  return list;
	}
}
