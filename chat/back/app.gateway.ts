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

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: any): void
  {
    this.server.emit('msgToClient', payload);
  }

  afterInit(server: Server)
  {
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[])
  {
    this.logger.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket)
  {
      this.logger.log(`Client ${client.id} disconnected`);
  }
  
}