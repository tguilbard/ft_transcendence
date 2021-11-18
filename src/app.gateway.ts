/*
https://docs.nestjs.com/websockets/gateways#gateways
*/

import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { HttpStatus, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JSDOM } from 'jsdom';
import { join } from 'path';
import { emit } from 'process';
const DataURIParser = require('datauri/parser');

const datauri = new DataURIParser();

function lunchServerPhaser(left: string, right: string) {
    JSDOM.fromFile(join(process.cwd(), '/src/Pong/Private.html'), {
        // To run the scripts in the html file
        url: "http://localhost:3000",
        runScripts: "dangerously",
        // Also load supported external resources
        resources: "usable",
        // So requestAnimatinFrame events fire
        pretendToBeVisual: true
    }).then((dom) => {
        dom.window.URL.createObjectURL = (blob) => {
            if (blob) {
                return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
            }
        };
        dom.window.URL.revokeObjectURL = (objectURL) => { };
        dom.window.left = left;
        dom.window.right = right;
    })
}

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    Q: Array<string> = [];

    result: Array<string> = [];

    comp: number = 0;

    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('AppGateway');

    @SubscribeMessage('matching')
    handleMessage(client: Socket, payload: string): void {
        if (this.Q.indexOf(client.id) == -1)
        {
            if (this.Q.push(client.id) >= 2) {
                lunchServerPhaser( this.Q[0], this.Q[1] );
                this.Q.splice(0, 2);
            }
        }
    }

    @SubscribeMessage("msgToserver")
    diffuseMessage(client: Socket, payload: any[]): void {
        this.server.emit(payload[0], payload[1], payload[2]);
    }

    @SubscribeMessage("ROOT")
    RootMessage(client: Socket, payload: string): void {
        if (this.result.indexOf(client.id) == -1)
        {
            this.result.push(client.id);
            this.logger.log(payload);
        }
    }

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.Q.forEach((element, index) => {
            if (element == client.id) this.Q.splice(index, 1);
        });
        this.result.forEach((element, index) => {
            if (element == client.id) this.result.splice(index, 1);
        });
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }
}
