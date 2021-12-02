import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
export declare class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    Q: Array<string>;
    result: Array<string>;
    comp: number;
    server: Server;
    private logger;
    handleMessage(client: Socket, payload: string): void;
    diffuseMessage(client: Socket, payload: any[]): void;
    RootMessage(client: Socket, payload: string): void;
    afterInit(server: Server): void;
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket, ...args: any[]): void;
}
