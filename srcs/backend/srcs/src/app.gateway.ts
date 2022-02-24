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
import { UsersService } from './users/users.service';
import { UserEntity } from './users/entities/users.entity';
import { MemberType } from './chat/enum/member-type.enum';
import { ChannelType } from './chat/enum/channel-type.enum';
import { ChatService } from './chat/chat.service';
import { ModeService } from './chat/generics/mode.class';

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
		private readonly userService: UsersService,
		private readonly modeService: ModeService,
		private readonly chatService: ChatService
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
		}
		this.logger.log(`User ${user.username} is connected`)
		//Changer le status en online si il est en offline
		// Ne pas changer pour in-game
		await this.userService.UpdateState(user, "login");
		let chanList = await this.chatService.GetChannelsOfUser(user.id);
		let general = await this.chatService.GetChannel("General");

		if (!chanList.find(e => e.name === "General")) {
			await this.chatService.AddMember(user, general.id, 0);
			chanList = await this.chatService.GetChannelsOfUser(user.id);
		}
		for (let chan of chanList) {
			let member = await this.chatService.GetMemberByUserIdAndChannelId(user.id, chan.id);
			if (!this.modeService.modeIsSet(member.mode, MemberType.ban))
			{
				client.join(chan.name);
				this.server.emit('refresh_user', "all");
			}
		}
		global.socketUserList.push({ socket: client, user: user })
		this.server.to(client.id).emit('initClient', (user.username));
	}

	async handleDisconnect(client: Socket) {
		console.log("handleDisconnect");
		let user = await this.userService.FindUserBySocket(client);
		if (user)
		{
			let index = global.socketUserList.findIndex(e => e.user.id == user.id);
			global.socketUserList.splice(index, 1);
	
			if (user.state === "login")
				await this.userService.UpdateState(user, "logout");
			this.logger.log(`Client ${user.username} disconnected`);
		}
		this.server.emit('del_user');
	}

	@SubscribeMessage('msgToServer')
	async handleMessage(client: Socket, payload: any) {
		console.log("msgToServer");
		let chanTarget = await this.chatService.GetChannel(payload[1]);
		if (!chanTarget) return;
		let user = await this.userService.FindUserBySocket(client);
		if (!user) return;
		payload[0].username = user.username;
		let member = await this.chatService.GetMemberByUserIdAndChannelId(user.id, chanTarget.id);

		if (member)
		{
			if (this.chatService.MemberIsBan(member))
			{
				payload[0].message = "You was banned";
				client.emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
			}
			else if (this.chatService.MemberIsMute(member)) {
				payload[0].message = "You was muted";
				client.emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
			}
			else
			{
				this.server.to(payload[1]).emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
				this.chatService.AddMessage(payload[0], member);
				this.server.to(payload[1]).emit('setMod', member.mode);
				this.server.to(client.id).emit('setMyMod', member.mode, chanTarget.name);
				this.server.emit("new_mode", chanTarget.name);
				//this.server.to(payload[1]).emit('msgUnreadPublic', payload[0], {id: chanTarget.id})
			}
		}
	}

	@SubscribeMessage('msgToServerPrivate')
	async handleMessagePrivate(client: Socket, payload: any) {
		console.log("msgToServerPrivate");
		
		let chanTarget = await this.chatService.GetChannel(payload[1]);
		if (!chanTarget) return;
		let user = await this.userService.FindUserBySocket(client);
		if (!user) return;
		payload[0].username = user.username;
		let member = await this.chatService.GetMemberByUserIdAndChannelId(user.id, chanTarget.id);

		if (member)
		{
			if (this.chatService.MemberIsBan(member))
			{
				payload[0].message = "You was banned";
				client.emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
			}
			else if (this.chatService.MemberIsMute(member)) {
				payload[0].message = "You was muted";
				client.emit('msgToClient', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
			}
			else
			{
				this.server.in(chanTarget.name).emit('msgToClientPrivate', payload[0], { name: chanTarget.name, mode: chanTarget.mode });
				//this.server.to(payload[1]).emit('msgUnreadPrivate', payload[0], {id: chanTarget.id}) //add one by one ?
				this.chatService.AddMessage(payload[0], member);
				this.server.to(payload[1]).emit('setMod', member.mode);
				this.server.to(client.id).emit('setMyMod', member.mode, chanTarget.name);
				this.server.emit("new_mode", chanTarget.name);
			}
		}
	}

	async afterInit(server: Server) {
		console.log("afterInit");
		try {
			const general = await this.chatService.CreateChannels("General", ChannelType.public, undefined);
			this.logger.log(`Initialisation done, ${general.name} created`);
		}
		catch (a) {
		}
	}

	@SubscribeMessage("leaveChanServer")
	async leaveChan(client, chanName: string) {
		console.log("leaveChanServer");

		let user = await this.userService.FindUserBySocket(client);
		let chan = await this.chatService.GetChannel(chanName);
		let member = await this.chatService.GetMemberByUserIdAndChannelId(user.id, chan.id);
		if (member && chan.name !== "General") {
			await this.chatService.SoftDeleteMember(member.id);
			this.server.in(chanName).emit('refresh_user', chanName);
		}
		member = null;
		member = await this.chatService.GetMemberByUserIdAndChannelId(user.id, chan.id);
		// this.server.emit('msgToClient', "Root", `User ${user.username} leaved ${chanName}`, chanName);
	}

	@SubscribeMessage("muteUserServer")
	async muteUserInChat(sender: Socket, payload: string[]) {
		let muteUntil = null;
		if (payload.length == 3) {
			let time = payload[2];
			muteUntil = new Date(Date.now() + +time*60000);
		}
		console.log("je suis dans muteUserServer");
		let chanTarget = await this.chatService.GetChannel(payload[1]);
		if (!chanTarget) return;
		let senderUserSocket = await this.userService.FindUserBySocket(sender);
		if (!senderUserSocket) return;
		let senderMember = await this.chatService.GetMemberByUserIdAndChannelId(senderUserSocket.id, chanTarget.id);

		let userTarget = await this.userService.FindUserByUsername(payload[0]);
		let memberTarget = await this.chatService.GetMemberByUserIdAndChannelId(userTarget.id, chanTarget.id);

		if (!senderMember || !userTarget
            || (this.modeService.modeIsSet(senderMember.mode, MemberType.admin)
            && this.modeService.modeIsSet(memberTarget.mode, MemberType.admin))
			|| !(this.modeService.modeIsSet(senderMember.mode, MemberType.owner)
			|| this.modeService.modeIsSet(senderMember.mode, MemberType.admin))
            || senderMember.id == memberTarget.id) return;
		try {
			this.chatService.SetMuteMember(memberTarget, muteUntil);
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
		let chanTarget = await this.chatService.GetChannel(payload[1]);
		if (!chanTarget) return;
		let senderUserSocket = await this.userService.FindUserBySocket(sender);
		if (!senderUserSocket) return;
		let senderMember = await this.chatService.GetMemberByUserIdAndChannelId(senderUserSocket.id, chanTarget.id);

		let userTarget = await this.userService.FindUserByUsername(payload[0])
		let memberTarget = await this.chatService.GetMemberByUserIdAndChannelId(userTarget.id, chanTarget.id);

		if (!senderMember || !userTarget
            || (this.modeService.modeIsSet(senderMember.mode, MemberType.admin)
            && this.modeService.modeIsSet(memberTarget.mode, MemberType.admin))
			|| !(this.modeService.modeIsSet(senderMember.mode, MemberType.owner)
			|| this.modeService.modeIsSet(senderMember.mode, MemberType.admin)))
			return;
		try {
			this.chatService.SetUnmuteMember(memberTarget);
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
		let banUntil = null;
		if (payload.length == 3) {
			let time = payload[2];
			banUntil = new Date(Date.now() + +time*60000);
		}
		console.log("je suis dans banUserServer");
		let chanTarget = await this.chatService.GetChannel(payload[1]);
		if (!chanTarget) return;
		let senderUserSocket = await this.userService.FindUserBySocket(sender);
		if (!senderUserSocket) return;
		let senderMember = await this.chatService.GetMemberByUserIdAndChannelId(senderUserSocket.id, chanTarget.id);

		let userTarget = await this.userService.FindUserByUsername(payload[0]);
		let memberTarget = await this.chatService.GetMemberByUserIdAndChannelId(userTarget.id, chanTarget.id);

		if (!senderMember || !userTarget
            || (this.modeService.modeIsSet(senderMember.mode, MemberType.admin)
            && this.modeService.modeIsSet(memberTarget.mode, MemberType.admin))
			|| !(this.modeService.modeIsSet(senderMember.mode, MemberType.owner)
			|| this.modeService.modeIsSet(senderMember.mode, MemberType.admin))
            || senderMember.id == memberTarget.id) return;
		try {
			this.chatService.SetBanMember(memberTarget, banUntil);
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
		let chanTarget = await this.chatService.GetChannel(payload[1]);
		if (!chanTarget) return;

		let senderUserSocket = await this.userService.FindUserBySocket(sender);
		if (!senderUserSocket) return;
		let senderMember = await this.chatService.GetMemberByUserIdAndChannelId(senderUserSocket.id, chanTarget.id);

		let userTarget = await this.userService.FindUserByUsername(payload[0]);
		let memberTarget = await this.chatService.GetMemberByUserIdAndChannelId(userTarget.id, chanTarget.id);

		if (!senderMember || !userTarget
            || (this.modeService.modeIsSet(senderMember.mode, MemberType.admin)
            && this.modeService.modeIsSet(memberTarget.mode, MemberType.admin))
            || !(this.modeService.modeIsSet(senderMember.mode, MemberType.owner)
			|| this.modeService.modeIsSet(senderMember.mode, MemberType.admin)))
			return;
		try {
			this.chatService.SetUnbanMember(memberTarget);
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
		
		let targetChan = await this.chatService.GetChannel(chanName);

		let userGeneral = await this.userService.FindUserBySocket(client);

		let chanMode = this.modeService.setMode(0, password ? ChannelType.public | ChannelType.protected : ChannelType.public);
		let userMode = this.modeService.setMode(0, MemberType.owner | MemberType.admin);
		if (!targetChan) {
			if (chanName.length === 19 && chanName.substring(8, 11) === " - ") {
				this.server.to(client.id).emit('alertMessage', chanName + ": Invalid channel name");
				return;
			}
			let newChannel = await this.chatService.CreateChannels(chanName, chanMode, password);
			await this.chatService.AddMember(userGeneral, newChannel.id, userMode, password);
			// let socket = this.findSocketInUserSocketObject(userGeneral.id);
			let socket = ChatGateway.findSocketInUserSocketObject(userGeneral.id);
			this.server.to(socket.id).emit('chanToClient', userMode, { name: newChannel.name, mode: newChannel.mode });
			client.join(chanName);
			this.server.in(chanName).emit('refresh_user', chanName);
		}
		else {
			let member = await this.chatService.GetMemberByUserIdAndChannelId(userGeneral.id, targetChan.id);
			if (member)
				this.server.to(client.id).emit('alertMessage', targetChan.name + ": You are already logged");
			try {
				await this.chatService.AddMember(userGeneral, targetChan.id, 0, password);
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

		
		let targetChan = await this.chatService.GetChannel(chanName)
		let userGeneral = await this.userService.FindUserBySocket(client)
		
		if (targetChan) {
			this.server.to(client.id).emit('alertMessage', chanName + " already exist");
			return;
		}
		if (chanName.length === 19 && chanName.substring(8, 11) === " - ") {
			this.server.to(client.id).emit('alertMessage', chanName + ": Invalid channel name");
			return;
		}
		let newChannel = await this.chatService.CreateChannels(chanName, ChannelType.private);
		await this.chatService.AddMember(userGeneral, newChannel.id, MemberType.owner | MemberType.admin);
		this.server.to(client.id).emit('chanToClientPrivate', ChannelType.private, { name: newChannel.name, mode: newChannel.mode });
		client.join(chanName);
		this.server.in(chanName).emit('refresh_user', chanName);
	}

	@SubscribeMessage("joinPrivateMessage")
	async joinPrivateMessage(client: Socket, username: string) {
		console.log("je suis dans joinPrivateMessage");
		let userTarget = await this.userService.FindUserByUsername(username);
		if (!userTarget) {
			this.server.to(client.id).emit('alertMessage', "User not found");
			return;
		}
		let userGeneral = await this.userService.FindUserBySocket(client);
		let chanName: string;
		if (userGeneral.username < userTarget.username)
			chanName = userGeneral.username + " - " + userTarget.username;
		else
			chanName = userTarget.username + " - " + userGeneral.username;
		if (await this.chatService.GetChannel(chanName))
		{
			this.server.to(client.id).emit('goMsg', chanName);
			return;
		}
		let targetChan = await this.chatService.CreateChannels(chanName, ChannelType.privateMessage, undefined);
		await this.chatService.AddMember(userGeneral, targetChan.id, 0);
		await this.chatService.AddMember(userTarget, targetChan.id, 0);
		this.server.to(client.id).emit('chanToClientPrivate', 0, { name: targetChan.name, mode: targetChan.mode });
		client.join(chanName);
		let socket = ChatGateway.findSocketInUserSocketObject(userTarget.id);
		if (socket)
			socket.join(chanName);
		this.server.to(client.id).emit('goMsg', chanName);
	}

	@SubscribeMessage("invite")
	async invite(client: Socket, payload: string[]) {
		console.log("invite");

		let userTargetName = payload[0];
		let chanName = payload[1];
		let chan = await this.chatService.GetChannel(chanName);
		let userSocket = await this.userService.FindUserBySocket(client);
		let memberSocket = await this.chatService.GetMemberByUserIdAndChannelId(userSocket.id, chan.id);
		let userTarget = await this.userService.FindUserByUsername(userTargetName);
		try {
			if (await this.chatService.GetMemberByUserIdAndChannelId(userTarget.id, chan.id)) {
				this.server.to(client.id).emit('alertMessage', "user already exist");
				return;
			}
		}
		catch {}
		try {
			let generalChannel = await this.chatService.GetChannel("General");
			var memberTarget = await this.chatService.GetMemberByUserIdAndChannelId(userTarget.id, generalChannel.id);
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
		let chan = await this.chatService.GetChannel(chanName);
		let userGeneral = await this.userService.FindUserBySocket(client);
		// let userMember = await this.chatService.FindMemberByUserIdAndChannelId(userGeneral.id, chan.id);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
		}
		if (ret === true) {
			this.chatService.AddMember(userGeneral, chan.id, 0);
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
		let chan = await this.chatService.GetChannel(chanName);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
		}
		let userTarget = await this.userService.FindUserByUsername(userName);
		let memberTarget = await this.chatService.GetMemberByUserIdAndChannelId(userTarget.id, chan.id);
		if (!memberTarget) {
			this.server.to(client.id).emit('alertMessage', "User not found");
		}

		let userSocket = await this.userService.FindUserBySocket(client);
		let memberSocket = await this.chatService.GetMemberByUserIdAndChannelId(userSocket.id, chan.id);

		if (memberSocket && this.modeService.modeIsSet(memberSocket.mode, MemberType.owner)) {
			this.chatService.SetAdminMember(memberTarget);

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
		let chan = await this.chatService.GetChannel(chanName);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
		}

		let userTarget = await this.userService.FindUserByUsername(userName);
		let memberTarget = await this.chatService.GetMemberByUserIdAndChannelId(userTarget.id, chan.id);
		if (!memberTarget) {
			this.server.to(client.id).emit('alertMessage', "User not found");
		}

		let userSocket = await this.userService.FindUserBySocket(client);
		let memberSocket = await this.chatService.GetMemberByUserIdAndChannelId(userSocket.id, chan.id);

		if (memberSocket && userTarget.username != userSocket.username && this.modeService.modeIsSet(memberSocket.mode, MemberType.owner)) {
			this.chatService.UnsetAdminMember(memberTarget);

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
		let chan = await this.chatService.GetChannel(chanName);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
			return;
		}

		if (!this.modeService.modeIsSet(chan.mode, ChannelType.public)) {
			this.server.to(client.id).emit('alertMessage', "Not in a public channel")
			return;
		}

		let userSocket = await this.userService.FindUserBySocket(client);
		let memberSocket = await this.chatService.GetMemberByUserIdAndChannelId(userSocket.id, chan.id);

		if (memberSocket && this.modeService.modeIsSet(memberSocket.mode, MemberType.owner)) {
			const passMode = await this.chatService.UpdateChannelPassword(chan, pass);
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
		let chan = await this.chatService.GetChannel(chanName);

		if (!chan) {
			this.server.to(client.id).emit('alertMessage', "Channel not found");
			return;
		}
		let user = await this.userService.FindUserByUsername(userName);
		if (!user) return;

		let member = await this.chatService.GetMemberByUserIdAndChannelId(user.id, chan.id);

		let msg = "[" + (this.modeService.modeIsSet(member.mode, MemberType.owner) ? " owner " : "") +
			(this.modeService.modeIsSet(member.mode, MemberType.admin) ? " admin " : "") +
			(this.modeService.modeIsSet(member.mode, MemberType.mute) ? " mute " : "") +
			(this.modeService.modeIsSet(member.mode, MemberType.ban) ? " ban " : "") +
			"]"
		this.server.to(client.id).emit('msgToClient', msg, { name: chan.name, mode: chan.mode} );
	}

	static findSocketInUserSocketObject(id: number) {
		const sockUser = global.socketUserList.find(elem => elem.user.id === id);
		if (sockUser && sockUser.socket)
			return sockUser.socket;
		return null;
	}

}