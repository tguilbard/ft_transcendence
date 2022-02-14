import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';

import { GoneException, Logger, ParseUUIDPipe } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChannelService } from './channel/channel.service';
import { UsersService } from './users/users.service';
import { MemberService } from './channel/member/member.service';
import { UserEntity } from './users/entities/users.entity';
import { ModeService } from './channel/generics/mode.class';
import { MemberType } from './channel/member/enum/member-type.enum';
import { ChannelType } from './channel/enum/channel-type.enum';

export interface SocketUser {
	socket: Socket;
	user: UserEntity;
}

@WebSocketGateway({
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('ChatGateway');

	constructor(
		private readonly channelService: ChannelService,
		private readonly userService: UsersService,
		private readonly memberService: MemberService,
		private readonly modeService: ModeService,
	) { }

	async handleConnection(client: Socket, ...args: any[]) {
		console.log("handleConnection");
		if (global.init)
			await this.userService.InitStateUsersInDB();
		try {
			var user = await this.userService.FindUserBySocket(client);
			if (!user)
				return;
		}
		catch {
			this.logger.error(`Socket ${client.id} failed to connect to the gataway`)
			return;
			// return client.disconnect()
		}
		this.logger.log(`User ${user.username} is connected`)
		//Changer le status en online si il est en offline
		// Ne pas changer pour in-game
		await this.userService.UpdateState(user, "login");
		let chanList = await this.channelService.GetChannelsOfUser(user.id);
		let general = await this.channelService.FindChannelByName("General");

		if (!chanList.find(e => e.name === "General")) {
			await this.channelService.AddMember(user, general.id, 0);
			chanList = await this.channelService.GetChannelsOfUser(user.id);
		}
		for (let chan of chanList) {
			let member = await this.memberService.FindMemberByUserIdAndChannelId(user.id, chan.id);
			if (!this.modeService.modeIsSet(member.mode, MemberType.ban))
			{
				client.join(chan.name);
				this.server.emit('refresh_user', "all");
			}
		}
		global.socketUserList.push({ socket: client, user: user })
		// console.log("all socket:\n", global.socketUserList);
		console.log("emit to initClient and send username = ", user.username);
		this.server.to(client.id).emit('initClient', (user.username));
	}

	async handleDisconnect(client: Socket) {
		console.log("handleDisconnect");
		let user = await this.userService.FindUserBySocket(client);
		let index = global.socketUserList.findIndex(e => e.user.id == user.id);
		global.socketUserList.splice(index, 1);

		await this.userService.UpdateState(user, "logout");
		this.logger.log(`Client ${user.username} disconnected`);

		this.server.emit('del_user');
	}

	@SubscribeMessage('msgToServer')
	async handleMessage(client: Socket, payload: any) {
		console.log("msgToServer");
		console.log(payload);
		let chanTarget = await this.channelService.FindChannelByName(payload[1]);
		if (!chanTarget) return;
		let user = await this.userService.FindUserBySocket(client);
		if (!user) return;
		payload[0].username = user.username;
		let member = await this.memberService.FindMemberByUserIdAndChannelId(user.id, chanTarget.id);

		if (member)
		{
			if (this.memberService.IsBanMode (member))
			{
				payload[0].message = "You was banned";
				client.emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
			}
			else if (this.memberService.IsMuteMode(member)) {
				payload[0].message = "You was muted";
				client.emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
			}
			else
			{
				this.server.to(payload[1]).emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
				this.channelService.AddMessage(payload[0], member);
			}
		}
	}

	@SubscribeMessage('msgToServerPrivate')
	async handleMessagePrivate(client: Socket, payload: any) {
		console.log("msgToServerPrivate");
		
		let chanTarget = await this.channelService.FindChannelByName(payload[1]);
		if (!chanTarget) return;
		let user = await this.userService.FindUserBySocket(client);
		if (!user) return;
		payload[0].username = user.username;
		let member = await this.memberService.FindMemberByUserIdAndChannelId(user.id, chanTarget.id);

		if (member)
		{
			if (this.memberService.IsBanMode (member))
			{
				payload[0].message = "You was banned";
				client.emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
			}
			else if (this.memberService.IsMuteMode(member)) {
				payload[0].message = "You was muted";
				client.emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
			}
			else
			{
				this.server.in(chanTarget.name).emit('msgToClientPrivate', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
				this.channelService.AddMessage(payload[0], member);
			}
		}
	}

	async afterInit(server: Server) {
		console.log("afterInit");
		try {
			const general = await this.channelService.CreateChannels("General", ChannelType.public, undefined);
			this.logger.log(`Initialisation done, ${general.name} created`);
		}
		catch (a) {
		}
	}

	@SubscribeMessage("leaveChanServer")
	async leaveChan(client, chanName: string) {
		console.log("leaveChanServer");

		let user = await this.userService.FindUserBySocket(client);
		let chan = await this.channelService.FindChannelByName(chanName);
		let member = await this.memberService.FindMemberByUserIdAndChannelId(user.id, chan.id);
		if (member && chan.name !== "General") {
			await this.memberService.SoftDeleteMember(member.id);
			this.server.in(chanName).emit('refresh_user', chanName);
		}
		member = null;
		member = await this.memberService.FindMemberByUserIdAndChannelId(user.id, chan.id);
		// this.server.emit('msgToClient', "Root", `User ${user.username} leaved ${chanName}`, chanName);
	}

	@SubscribeMessage("muteUserServer")
	async muteUserInChat(sender: Socket, payload: string[]) {
		console.log("je suis dans muteUserServer");
		let chanTarget = await this.channelService.FindChannelByName(payload[1]);
		if (!chanTarget) return;
		let senderUserSocket = await this.userService.FindUserBySocket(sender);
		if (!senderUserSocket) return;
		let senderMember = await this.memberService.FindMemberByUserIdAndChannelId(senderUserSocket.id, chanTarget.id);

		let userTarget = await this.userService.FindUserByUsername(payload[0]);
		let memberTarget = await this.memberService.FindMemberByUserIdAndChannelId(userTarget.id, chanTarget.id);

		if (!senderMember || !userTarget
            || (this.modeService.modeIsSet(senderMember.mode, MemberType.admin)
            && this.modeService.modeIsSet(memberTarget.mode, MemberType.admin))
			|| !(this.modeService.modeIsSet(senderMember.mode, MemberType.owner)
			|| this.modeService.modeIsSet(senderMember.mode, MemberType.admin))
            || senderMember.id == memberTarget.id) return;
		try {
			this.memberService.SetMuteMember(memberTarget);
			this.server.to(sender.id).emit('setMod', memberTarget.mode);
			// let socket = this.findSocketInUserSocketObject(userTarget.id);
			let socket = ChatGateway.findSocketInUserSocketObject(userTarget.id);
			this.server.to(socket.id).emit('setMyMod', memberTarget.mode, chanTarget.name);
			this.server.emit("new_mode", chanTarget.name);
		}
		catch {
			return;
		}
		// ChatGateway.findSocketInUserSocketObject(userTarget.id);
		// this.server.to(socket.id).emit('alertMessage', chanTarget.name + ": You are mute");
	}

	@SubscribeMessage("unmuteUserServer")
	async unmuteUserInChat(sender: Socket, payload: string[]) {
		console.log("je suis dans muteUserServer");
		let chanTarget = await this.channelService.FindChannelByName(payload[1]);
		if (!chanTarget) return;
		let senderUserSocket = await this.userService.FindUserBySocket(sender);
		if (!senderUserSocket) return;
		let senderMember = await this.memberService.FindMemberByUserIdAndChannelId(senderUserSocket.id, chanTarget.id);

		let userTarget = await this.userService.FindUserByUsername(payload[0])
		let memberTarget = await this.memberService.FindMemberByUserIdAndChannelId(userTarget.id, chanTarget.id);

		if (!senderMember || !userTarget
            || (this.modeService.modeIsSet(senderMember.mode, MemberType.admin)
            && this.modeService.modeIsSet(memberTarget.mode, MemberType.admin))
			|| !(this.modeService.modeIsSet(senderMember.mode, MemberType.owner)
			|| this.modeService.modeIsSet(senderMember.mode, MemberType.admin)))
			return;
		try {
			this.memberService.SetUnmuteMember(memberTarget);
			this.server.to(sender.id).emit('setMod', memberTarget.mode);
			// let socket = this.findSocketInUserSocketObject(userTarget.id);
			let socket = ChatGateway.findSocketInUserSocketObject(userTarget.id);
			this.server.to(socket.id).emit('setMyMod', memberTarget.mode, chanTarget.name);
			this.server.emit("new_mode", chanTarget.name);
		}
		catch {
			return;
		}
	}

	@SubscribeMessage("banUserServer")
	async banUserInChat(sender: Socket, payload: string[]) {
		console.log("je suis dans banUserServer");
		let chanTarget = await this.channelService.FindChannelByName(payload[1]);
		if (!chanTarget) return;
		let senderUserSocket = await this.userService.FindUserBySocket(sender);
		if (!senderUserSocket) return;
		let senderMember = await this.memberService.FindMemberByUserIdAndChannelId(senderUserSocket.id, chanTarget.id);

		let userTarget = await this.userService.FindUserByUsername(payload[0]);
		let memberTarget = await this.memberService.FindMemberByUserIdAndChannelId(userTarget.id, chanTarget.id);

		if (!senderMember || !userTarget
            || (this.modeService.modeIsSet(senderMember.mode, MemberType.admin)
            && this.modeService.modeIsSet(memberTarget.mode, MemberType.admin))
			|| !(this.modeService.modeIsSet(senderMember.mode, MemberType.owner)
			|| this.modeService.modeIsSet(senderMember.mode, MemberType.admin))
            || senderMember.id == memberTarget.id) return;
		try {
			this.memberService.SetBanMember(memberTarget);
			let socket = ChatGateway.findSocketInUserSocketObject(userTarget.id);
			socket.leave(chanTarget.name);
			this.server.to(sender.id).emit('setMod', memberTarget.mode);
			this.server.to(socket.id).emit('setMyMod', memberTarget.mode, chanTarget.name);
			this.server.emit("new_mode", chanTarget.name);
		}
		catch {
			return;
		}
	}

	@SubscribeMessage("unbanUserServer")
	async unbanUserInChat(sender: Socket, payload: string[]) {
		console.log("je suis dans unbanUserServer");
		let chanTarget = await this.channelService.FindChannelByName(payload[1]);
		if (!chanTarget) return;

		let senderUserSocket = await this.userService.FindUserBySocket(sender);
		if (!senderUserSocket) return;
		let senderMember = await this.memberService.FindMemberByUserIdAndChannelId(senderUserSocket.id, chanTarget.id);

		let userTarget = await this.userService.FindUserByUsername(payload[0]);
		let memberTarget = await this.memberService.FindMemberByUserIdAndChannelId(userTarget.id, chanTarget.id);

		if (!senderMember || !userTarget
            || (this.modeService.modeIsSet(senderMember.mode, MemberType.admin)
            && this.modeService.modeIsSet(memberTarget.mode, MemberType.admin))
            || !(this.modeService.modeIsSet(senderMember.mode, MemberType.owner)
			|| this.modeService.modeIsSet(senderMember.mode, MemberType.admin)))
			return;
		try {
			this.memberService.SetUnbanMember(memberTarget);
			let socket = ChatGateway.findSocketInUserSocketObject(userTarget.id);
			socket.join(chanTarget.name);
			this.server.to(sender.id).emit('setMod', memberTarget.mode);
			this.server.to(socket.id).emit('setMyMod', memberTarget.mode, chanTarget.name);
			this.server.emit("new_mode", chanTarget.name);
		}
		catch {
			return;
		}
	}

	@SubscribeMessage("joinPublic")
	async joinPublic(client: Socket, payload: string[]) {
		console.log("je suis dans joinPublic");
		let chanName: string = payload[0];
		let password: string = payload[1] ? payload[1] : null;
		
		let targetChan = await this.channelService.FindChannelByName(chanName);

		let userGeneral = await this.userService.FindUserBySocket(client);

		let chanMode = this.modeService.setMode(0, password ? ChannelType.public | ChannelType.protected : ChannelType.public);
		let userMode = this.modeService.setMode(0, MemberType.owner | MemberType.admin);
		if (!targetChan) {
			if (chanName.length === 19 && chanName.substring(8, 11) === " - ") {
				this.server.to(client.id).emit('alertMessage', chanName + ": Invalid channel name");
				return;
			}
			let newChannel = await this.channelService.CreateChannels(chanName, chanMode, password);
			await this.channelService.AddMember(userGeneral, newChannel.id, userMode, password);
			// let socket = this.findSocketInUserSocketObject(userGeneral.id);
			let socket = ChatGateway.findSocketInUserSocketObject(userGeneral.id);
			this.server.to(socket.id).emit('chanToClient', userMode, { name: newChannel.name, mode: newChannel.mode });
			client.join(chanName);
			this.server.in(chanName).emit('refresh_user', chanName);
		}
		else {
			let member = await this.memberService.FindMemberByUserIdAndChannelId(userGeneral.id, targetChan.id);
			if (member)
				this.server.to(client.id).emit('alertMessage', targetChan.name + ": You are already logged");
			try {
				await this.channelService.AddMember(userGeneral, targetChan.id, 0, password);
				// let socket = await this.findSocketInUserSocketObject(userGeneral.id);
				let socket = ChatGateway.findSocketInUserSocketObject(userGeneral.id);
				this.server.to(socket.id).emit('chanToClient', 0, { name: targetChan.name, mode: targetChan.mode });
				client.join(chanName);
				this.server.in(chanName).emit('refresh_user', chanName);
			}
			catch (e) {
				if (e == "HttpException: UNAUTHORIZED")
					this.server.to(client.id).emit('alertMessage', chanName + ": You are password is bad" );
				else {
					this.server.to(client.id).emit('alertMessage', chanName + ": There was a problem" );
				}
			}
		}
	}

	@SubscribeMessage("joinPrivate")
	async joinPrivate(client: Socket, chanName: string) {
		console.log("je suis dans joinPrivate");

		
		let targetChan = await this.channelService.FindChannelByName(chanName)
		let userGeneral = await this.userService.FindUserBySocket(client)
		
		if (targetChan) {
			this.server.to(client.id).emit('alertMessage', chanName + " already exist");
			return;
		}
		if (chanName.length === 19 && chanName.substring(8, 11) === " - ") {
			this.server.to(client.id).emit('alertMessage', chanName + ": Invalid channel name");
			return;
		}
		let newChannel = await this.channelService.CreateChannels(chanName, ChannelType.private);
		await this.channelService.AddMember(userGeneral, newChannel.id, MemberType.owner | MemberType.admin);
		this.server.to(client.id).emit('chanToClientPrivate', ChannelType.private, { name: newChannel.name, mode: newChannel.mode });
		client.join(chanName);
		this.server.in(chanName).emit('refresh_user', chanName);
	}

	@SubscribeMessage("joinPrivateMessage")
	async joinPrivateMessage(client: Socket, userName: string) {
		console.log("je suis dans joinPrivateMessage");
		let userTarget = await this.userService.FindUserByUsername(userName);
		if (!userTarget) {
			this.server.to(client.id).emit('alertMessage', "User not found");
			return;
		}
		// console.log("userName = ", userName);
		let userGeneral = await this.userService.FindUserBySocket(client);
		let chanName: string;
		if (userGeneral.username < userTarget.username)
			chanName = userGeneral.username + " - " + userTarget.username;
		else
			chanName = userTarget.username + " - " + userGeneral.username;
		if (await this.channelService.FindChannelByName(chanName))
		{
			this.server.to(client.id).emit('goMsg', chanName);
			return;
		}
		console.log("channel found");
		let targetChan = await this.channelService.CreateChannels(chanName, ChannelType.privateMessage, undefined);
		await this.channelService.AddMember(userGeneral, targetChan.id, 0);
		await this.channelService.AddMember(userTarget, targetChan.id, 0);
		this.server.to(client.id).emit('chanToClientPrivate', 0, { name: targetChan.name, mode: targetChan.mode });
		client.join(chanName);
		let socket = ChatGateway.findSocketInUserSocketObject(userTarget.id);
		socket.join(chanName);
	}

	@SubscribeMessage("invite")
	async invite(client: Socket, payload: string[]) {
		console.log("invite");

		let userTargetName = payload[0];
		let chanName = payload[1];
		let chan = await this.channelService.FindChannelByName(chanName);
		let userSocket = await this.userService.FindUserBySocket(client);
		let memberSocket = await this.memberService.FindMemberByUserIdAndChannelId(userSocket.id, chan.id);
		let userTarget = await this.userService.FindUserByUsername(userTargetName);
		try {
			if (await this.memberService.FindMemberByUserIdAndChannelId(userTarget.id, chan.id)) {
				this.server.to(client.id).emit('alertMessage', "user already exist");
				return;
			}
		}
		catch {}
		try {
			let generalChannel = await this.channelService.FindChannelByName("General");
			var memberTarget = await this.memberService.FindMemberByUserIdAndChannelId(userTarget.id, generalChannel.id);
		}
		catch {
			this.server.to(client.id).emit('alertMessage', "User not found");
			return;
		}
		if (!chan || !this.modeService.modeIsSet(chan.mode, ChannelType.private) || !memberTarget) {
			this.server.to(client.id).emit('alertMessage', "Forbidden Command");
			return;
		}
		if (memberSocket && this.modeService.modeIsSet(memberSocket.mode, MemberType.admin)) {
			// let socket = this.findSocketInUserSocketObject(userTarget.id);
			let socket = ChatGateway.findSocketInUserSocketObject(userTarget.id);
			this.server.to(socket.id).emit('rcvInvite', {name: chan.name, mode: chan.mode}, {username: userSocket.username, state: userSocket.state});
		}
		else {
			this.server.to(client.id).emit('alertMessage', "Forbidden Command");
		}
	}

	@SubscribeMessage("valInvite")
	async valInvite(client: Socket, payload: any[]) {
		console.log("valInvite");

		let ret: boolean = payload[0];
		let chanName = payload[1];
		let chan = await this.channelService.FindChannelByName(chanName);
		let userGeneral = await this.userService.FindUserBySocket(client);
		// let userMember = await this.memberService.FindMemberByUserIdAndChannelId(userGeneral.id, chan.id);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
		}
		if (ret === true) {
			this.channelService.AddMember(userGeneral, chan.id, 0);
			this.server.to(client.id).emit('chanToClientPrivate', 0, chan);

			client.join(chanName);
			this.server.in(chanName).emit('refresh_user', chanName);
		}
		else
		{
			const user = await this.userService.FindUserByUsername(payload[2]);
			const userSocket = ChatGateway.findSocketInUserSocketObject(user.id);
			if (userSocket)
				this.server.to(userSocket.id).emit('alertMessage', userGeneral.username + " refused your invitation on " + chanName);
		}
	}

	@SubscribeMessage("setAdmin")
	async setAdmin(client: Socket, payload: string[]) {
		console.log("setAdmin");

		let userName = payload[0];
		let chanName = payload[1];
		let chan = await this.channelService.FindChannelByName(chanName);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
		}
		let userTarget = await this.userService.FindUserByUsername(userName);
		let memberTarget = await this.memberService.FindMemberByUserIdAndChannelId(userTarget.id, chan.id);
		if (!memberTarget) {
			this.server.to(client.id).emit('alertMessage', "User not found");
		}

		let userSocket = await this.userService.FindUserBySocket(client);
		let memberSocket = await this.memberService.FindMemberByUserIdAndChannelId(userSocket.id, chan.id);

		if (memberSocket && this.modeService.modeIsSet(memberSocket.mode, MemberType.owner)) {
			this.memberService.SetAdminMember(memberTarget);

			this.server.to(client.id).emit('setMod', memberTarget.mode);
			// let socket = this.findSocketInUserSocketObject(userTarget.id);
			let socket = ChatGateway.findSocketInUserSocketObject(userTarget.id);
			this.server.to(socket.id).emit('setMyMod', memberTarget.mode, chanName);
			this.server.emit("new_mode", chanName);
		}
		else {
			//this.server.to(client.id).emit('alertMessage', "Forbidden Command");
		}
	}

	@SubscribeMessage("unsetAdmin")
	async unsetAdmin(client: Socket, payload: string[]) {
		console.log("unsetAdmin");

		let userName = payload[0];
		let chanName = payload[1];
		let chan = await this.channelService.FindChannelByName(chanName);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
		}

		let userTarget = await this.userService.FindUserByUsername(userName);
		let memberTarget = await this.memberService.FindMemberByUserIdAndChannelId(userTarget.id, chan.id);
		if (!memberTarget) {
			this.server.to(client.id).emit('alertMessage', "User not found");
		}

		let userSocket = await this.userService.FindUserBySocket(client);
		let memberSocket = await this.memberService.FindMemberByUserIdAndChannelId(userSocket.id, chan.id);

		if (memberSocket && userTarget.username != userSocket.username && this.modeService.modeIsSet(memberSocket.mode, MemberType.owner)) {
			this.memberService.UnsetAdminMember(memberTarget);

			this.server.to(client.id).emit('setMod', memberTarget.mode);
			// let socket = this.findSocketInUserSocketObject(userTarget.id);
			let socket = ChatGateway.findSocketInUserSocketObject(userTarget.id);
			this.server.to(socket.id).emit('setMyMod', memberTarget.mode, chanName);
			this.server.emit("new_mode", chanName);
		}
		else {
		//	this.server.to(client.id).emit('alertMessage', "Forbidden Command");
		}
	}

	@SubscribeMessage("passChan")
	async passChan(client: Socket, payload: string[]) {
		console.log("passChan");

		let pass = payload[0];
		let chanName = payload[1];
		let chan = await this.channelService.FindChannelByName(chanName);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
			return;
		}

		if (!this.modeService.modeIsSet(chan.mode, ChannelType.public)) {
			this.server.to(client.id).emit('alertMessage', "Not in a public channel")
			return;
		}

		let userSocket = await this.userService.FindUserBySocket(client);
		let memberSocket = await this.memberService.FindMemberByUserIdAndChannelId(userSocket.id, chan.id);

		if (memberSocket && this.modeService.modeIsSet(memberSocket.mode, MemberType.owner)) {
			const passMode = await this.channelService.UpdatePassword(chan, pass);
			this.server.in(chanName).emit("setPassMode", passMode);
		}
		else {
			this.server.to(client.id).emit('alertMessage', "Forbidden Command");
		}
	}

	@SubscribeMessage("addFriend")
	async addFriend(client: Socket, userName: string) {
		console.log("addFriend");

		let userSocket = await this.userService.FindUserBySocket(client);
		let userTarget = await this.userService.FindUserByUsername(userName);
		await this.userService.AddFriend(userSocket.id, userTarget.id);
	}

	@SubscribeMessage("removeFriend")
	async removeFriend(client: Socket, userName: string) {
		console.log("removeFriend");

		let userSocket = await this.userService.FindUserBySocket(client);
		let userTarget = await this.userService.FindUserByUsername(userName);
		await this.userService.DeleteFriend(userSocket.id, userTarget.id);
	}

	@SubscribeMessage("changeUsername")
	async changeUsername(client: Socket, payload: any) {
		console.log("je suis dans changeUsername");
	
		// console.log("payload:/n", payload);
		if (payload && payload.length)
		{
			payload.forEach(element => {
				this.server.in(element.oldchan).socketsJoin(element.newchan);
				this.server.socketsLeave(element.oldchan);
			});
	
		}
		global.socketUserList.forEach(e =>  {
			if (e.user.username == payload[0].oldname)
			{
				e.user.username = payload[0].newname;
			}
		})
		this.server.emit('changeUsername', (payload));
	}

	@SubscribeMessage("displayMods")
	async displayMods(client: Socket, payload: string[]) {
		console.log("displayMods");
		let userName = payload[0];
		let chanName = payload[1];
		let chan = await this.channelService.FindChannelByName(chanName);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
			return;
		}
		let user = await this.userService.FindUserByUsername(userName);
		if (!user) return;

		let member = await this.memberService.FindMemberByUserIdAndChannelId(user.id, chan.id);

		let msg = "[" + (this.modeService.modeIsSet(member.mode, MemberType.owner) ? " owner " : "") +
			(this.modeService.modeIsSet(member.mode, MemberType.admin) ? " admin " : "") +
			(this.modeService.modeIsSet(member.mode, MemberType.mute) ? " mute " : "") +
			(this.modeService.modeIsSet(member.mode, MemberType.ban) ? " ban " : "") +
			"]"
		// console.log(msg);
		this.server.to(client.id).emit('msgToClient', msg, { name: chan.name, mode: chan.mode} );
	}

	static findSocketInUserSocketObject(id: number) {
		return global.socketUserList.find(elem => elem.user.id === id).socket;
	}

}