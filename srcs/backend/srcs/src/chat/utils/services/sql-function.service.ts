import { Injectable } from "@nestjs/common";
import { ChannelType } from "src/chat/enum/channel-type.enum";
import { MemberType } from "src/chat/enum/member-type.enum";

@Injectable()
export class SqlFunctionService {
	
	ChannelIsPrivate()
	{
		return (`(channel.mode = ${ChannelType.privateMessage} OR channel.mode = ${ChannelType.private})`);
	}

	ChannelIsPrivateMessage()
	{
		return (`channel.mode = ${ChannelType.privateMessage}`);
	}

	ChannelIsPublic()
	{
		return (`channel.mode & ${ChannelType.public} = ${ChannelType.public}`);
	}

	MemberIsBan()
	{
		return (`(member.mode & ${MemberType.ban}) = ${MemberType.ban}`)
	}

	MemberIsMute()
	{
		return (`(member.mode & ${MemberType.mute}) = ${MemberType.mute} AND (member.mode & ${MemberType.ban}) <> ${MemberType.ban}`)
	}

	MemberIsNormal()
	{
		return (`(member.mode & ${MemberType.ban}) <> ${MemberType.ban}
		AND (member.mode & ${MemberType.mute}) <> ${MemberType.mute}
		AND (member.mode & ${MemberType.admin}) <> ${MemberType.admin}
		AND (member.mode & ${MemberType.owner}) <> ${MemberType.owner}`)
	}

	MemberIsAdmin(): string
	{
		return (`(member.mode & ${MemberType.admin}) = ${MemberType.admin}`)

		return (`(member.mode & ${MemberType.owner}) = ${MemberType.owner}
		AND (member.mode & ${MemberType.mute}) <> ${MemberType.mute}
		AND (member.mode & ${MemberType.ban}) <> ${MemberType.ban}`) //WARNING if admin dont lose automaticly their status
	}

	MemberIsOwner()
	{
		return (`(member.mode & ${MemberType.owner}) = ${MemberType.owner}`)
	}

	MemberIsOwnerOrAdminOrNormal()
	{
		return "(" + this.MemberIsNormal() + " ) OR ( " + this.MemberIsAdmin() + " ) OR ( " + this.MemberIsOwner() + " )";
	}

	MemberIsMuteOrBan()
	{
		return this.MemberIsBan() + " OR " + this.MemberIsMute();
	}

}