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
import { Chan, User, Chantype } from './app.service';

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
  superAdmin: User;
  chanList: Chan[] = [];

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: any): void
  {
    this.server.emit('msgToClient', payload);
  }

  afterInit(server: Server)
  {
    /* Initialisation du chat General
    * -> superAdmin : Owner du général
    * -> chanList qui contiendra la liste des channels
    */
    this.superAdmin = new User("0", "Root");
    var chan = new Chan(this.superAdmin, "General", Chantype.public);
    this.chanList.push(chan);
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[])
  {
    this.logger.log(`Client ${client.id} connected`);
    // Juste pour test, a enlever
    this.addUserInChan(new User(client.id, client.id), this.chanList[0]);
  }

  handleDisconnect(client: Socket)
  {
      this.logger.log(`Client ${client.id} disconnected`);
  }
  
  @SubscribeMessage("addUserInChanServer")
  addUserInChan(u: User, chan: Chan): void {
    chan.addUser(u);
    this.server.emit('msgToClient', `User ${u.nick} joined ${chan.name}`);
    this.logger.log(`User ${u.nick} joined ${chan.name}`);
  }

  @SubscribeMessage("leaveChanServer")
  leaveChan(u: User, chan: Chan): void {
    chan.leaveChan(u);
    this.server.emit('msgToClient', `User ${u.nick} leaved ${chan.name}`);
  }

  @SubscribeMessage("muteUserServer")
  muteUserInChat(sender: User, u: User, chan: Chan): void {
    chan.muteUser(sender, u);
  }
}