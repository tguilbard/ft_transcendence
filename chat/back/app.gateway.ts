import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Chan, User, ChanType, Mode, Usertype, Message } from './app.service';
import { UserObject } from './app.entities';

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  superAdmin: User;
  chanList: Chan[] = [];
  serverUsers: User[] = [];

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: any): void
  {
    /* version message objet
      let msg = new Message(payload[0], payload[1]);
      this.server.to(payload[2]).emit('msgToClient', payload[0], msg.msg, payload[2]);
    */
    this.server.to(payload[2]).emit('msgToClient', payload[0], payload[1], payload[2]);
  }

  afterInit(server: Server)
  {
    this.superAdmin = new User("0", "Root", null);
    let chan = new Chan(this.superAdmin, "General", ChanType.public);
    this.chanList.push(chan);
    this.serverUsers.push(this.superAdmin);
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[])
  {
    
    client.join(this.chanList[0].name);
    this.logger.log(`Client ${client.id} connected`);
    let user = new User(client.id, client.id, client);
    if (!this.addUserInChan(user, this.chanList[0])) {
      console.log("DOEST WORK");
      client.leave(this.chanList[0].name);
    }
  }

  handleDisconnect(client: Socket)
  {
    this.logger.log(`Client ${client.id} disconnected`);
  }
  
  @SubscribeMessage("addUserInChanServer")
  addUserInChan(u: User, chan: Chan): boolean {
    if (u === null || !chan.addUser(u))
      return false;
    u.socket.join(chan.name);
    /* version message objet
      let msg = new Message("Root", `User ${u.nick} joined ${chan.name}`);
      this.server.to(payload[2]).emit('msgToClient', "Root", msg.msg, chan.name);
    */
    this.server.to(chan.name).emit('msgToClient', "Root", `User ${u.nick} joined ${chan.name}`, chan.name);
    this.logger.log(`User ${u.nick} joined ${chan.name}`);
    return true;
  }

  @SubscribeMessage("leaveChanServer")
  leaveChan(u: User, chan: Chan): void {
    chan.leaveChan(u);
    this.server.emit('msgToClient', "Root", `User ${u.nick} leaved ${chan.name}`, chan.name);
  }

  @SubscribeMessage("muteUserServer")
  muteUserInChat(sender: User, u: User, chan: Chan): void {
    chan.muteUser(sender, u);
  }

  @SubscribeMessage("joinServer")
  joinServer(client: Socket, payload: any): void {
    let targetChan = this.findChanByName(payload);
    let userGeneral = this.findBySocketId(client, this.chanList[0]);
    if (!targetChan) {
      let userTmp = userGeneral;
      userTmp.userMode.flag = Usertype.owner | Usertype.admin;
      // Gérer avec le front la création de chan (Faire une fonction par type de
      // chan ?)
      var newChan = new Chan(userTmp.user, payload, ChanType.public);
      this.chanList.push(newChan);
      client.join(payload);
    }
    else {
      let userTmp = userGeneral;
      this.addUserInChan(userTmp.user, targetChan);
      client.join(targetChan.name);
    }
  }

  findBySocketId(client: Socket, chan: Chan): UserObject | null {
    let id = client.id;
    for (let u of chan.userList) {
      if (u.user.id === id) return u;
    }
    return null;
  }

  findChanByName(name: string): Chan | null {
    for (let chan of this.chanList) {
      if (chan.name === name) return chan;
    }
    return null;
  }
}