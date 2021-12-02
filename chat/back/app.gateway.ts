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

  superAdmin: UserObject;
  chanList: Chan[] = [];
  serverUsers: UserObject[] = [];

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: any): void {
    /* version message objet
      let msg = new Message(payload[0], payload[1]);
      this.server.to(payload[2]).emit('msgToClient', payload[0], msg.msg, payload[2]);
    */
    this.server.to(payload[2]).emit('msgToClient', payload[0], payload[1], payload[2]);
  }

  afterInit(server: Server) {
    this.superAdmin = new UserObject(new User("0", "Root", null),
      new Mode(Usertype.owner | Usertype.admin));
    let chan = new Chan(this.superAdmin.user, "General", ChanType.public);
    this.chanList.push(chan);
    this.serverUsers.push(this.superAdmin);
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    client.join(this.chanList[0].name);
    this.logger.log(`Client ${client.id} connected`);
    let user = new UserObject(new User(client.id, client.id, client),
               new Mode(0));
    this.serverUsers.push(user);
    if (!this.addUserInChan(user.user, this.chanList[0])) {
      console.log("DOEST WORK");
      client.leave(this.chanList[0].name);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }
  
  @SubscribeMessage("addUserInChanServer")
  addUserInChan(u: User, chan: Chan): boolean {
    if (!u || !chan.addUser(u))
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

  //@SubscribeMessage("joinPublic")
  @SubscribeMessage("joinServer")
  //joinPublic
  joinServer(client: Socket, chanName: string, password?: string): void {
    let targetChan = this.findChanByName(chanName);
    let userGeneral = this.findBySocketId(client, this.chanList[0]);
    if (!targetChan) {
      var newChan = new Chan(userGeneral.user,
                    chanName,
                    password ? ChanType.public | ChanType.protected : ChanType.public,
                    password ? password : undefined);
      this.chanList.push(newChan);
      client.join(chanName);
    }
    else {
      if (targetChan.mode.flagIsSet(ChanType.public)) {
        let userTmp = userGeneral;
        userTmp.userMode.flag = 0;
        if (targetChan.mode.flagIsSet(ChanType.protected)) {
          // Comparer les mdps
        }
        this.addUserInChan(userTmp.user, targetChan);
        client.join(targetChan.name);
      }
      else this.server.to(client.id).emit('failedJoinPublic');
    }
  }

  @SubscribeMessage("joinPrivate")
  joinPrivate(client: Socket, name:string): void {
    let user = this.findBySocketId(client, this.chanList[0]);
    let chan = this.findChanByName(name);
    if (chan) {
      this.server.to(client.id).emit('failedJoinPrivate');
      return ;
    }
    let newChan = new Chan(user.user, name,
                  ChanType.private);
    this.chanList.push(newChan);
    client.join(name);
  }
  
  @SubscribeMessage("joinPrivateMessage")
  joinPrivateMessage(client: Socket, userName: string): void {
    let userTarget = this.findUserByName(userName);
    if (!userTarget) {
      this.server.to(client.id).emit('userNotFound');
      return ;
    }
    
    let userGeneral = this.findBySocketId(client, this.chanList[0]);
    let chanName = userGeneral.user.nick + " - " + userName;
  
    if (this.findChanByName(chanName)) {
      // Open PM tab
      return ;
    }

    let newChan = new Chan(userGeneral.user,
                  chanName,
                  ChanType.privateMessage);
    console.log('HERE');
    newChan.addUser(userTarget.user);
    this.chanList.push(newChan);
    client.join(chanName);
    userTarget.user.socket.join(chanName);
  }

  findUserByName(name: string): UserObject | null {
    let found = this.serverUsers.find(elem => elem.user.nick === name);
    if (found) return found;
    return null;
  }

  findBySocketId(client: Socket, chan: Chan): UserObject | null {
    let found = chan.userList.find(elem => elem.user.id === client.id);
    if (found) return found;
    return null;
  }

  findChanByName(name: string): Chan | null {
    let found = this.chanList.find(elem => elem.name === name);
    if (found) return found;
    return null;
  }
}