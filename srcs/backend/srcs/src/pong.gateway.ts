/*
https://docs.nestjs.com/websockets/gateways#gateways
*/

import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { HttpStatus, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JSDOM } from 'jsdom';
import { join } from 'path';
import { emit, exit } from 'process';
import { UsersService } from './users/users.service';
import { UserEntity } from './users/entities/users.entity';
import { ChatGateway, SocketUser } from './app.gateway';
const DataURIParser = require('datauri/parser');

const datauri = new DataURIParser();

var gameId: number = 0

class Game {
    id: number;
    users: SocketUser[];
    phaserServer: Socket;
    spectators: SocketUser[];
    socketRoomName: string;
    privateFlag: number;
    server: Server;

    constructor(user1: SocketUser, user2: SocketUser, phaserServer: Socket, server: Server, privateFlag=0) {
        this.id = gameId + 1
        this.users = [user1, user2]
        this.socketRoomName = 'game : ' + this.id.toString();
        this.phaserServer = phaserServer;
        user1.socket.join(this.socketRoomName);
        user2.socket.join(this.socketRoomName);
        this.phaserServer.join(this.socketRoomName);
        this.privateFlag = privateFlag;
        this.server = server;
    }

    sendMessage(msg: any[]) {
        this.server.to(this.socketRoomName).emit(msg[0], msg[1], msg[2]);
    }

    endGame() {
        this.users[0].socket.leave(this.socketRoomName);
        this.users[1].socket.leave(this.socketRoomName);
        this.phaserServer.leave(this.socketRoomName);
    }

    addToSpec(user: SocketUser) {
        this.spectators.push(user);
        user.socket.join(this.socketRoomName);
    }

    leaveSpec(socket: Socket) {
        let indexFound = this.spectators.findIndex(spec => spec.socket.id === socket.id);
        if (indexFound == -1) return;
        this.spectators.splice(indexFound, 1);
        socket.leave(this.socketRoomName);
    }
}

interface user{
    elo: number;
    name: string;
    id: Socket;
}

interface range{
    min: number;
    max: number;
    name: string;
}

function lunchServerPhaser(left: string, right: string, flag: number) {
    JSDOM.fromFile(join(process.cwd(), '/Pong/Private.html'), {
        // To run the scripts in the html file
        url: "http://localhost:3000",
        runScripts: "dangerously",
        // Also load supported external resources
        resources: "usable",
        // So requestAnimatinFrame events fire
        pretendToBeVisual: true,
    }).then((dom) => {
        dom.window.URL.createObjectURL = (blob) => {
            if (blob) {
                return datauri.format(blob, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
            }
        };
        dom.window.URL.revokeObjectURL = (objectURL) => { };
        dom.window.left = left;
        dom.window.right = right;
        dom.window.flag = flag;
    })
}

@WebSocketGateway()
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    constructor(private readonly userService: UsersService)
    {}

    Q: Array<user> = [];
    list: Array<user> = [];
    oldRoot: Array<string> = [];
    games: Game[] = [];

    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('PongGateway');

    async handleConnection(client: Socket, ...args: any[]) {
        try {
            var user = await this.userService.FindUserBySocket(client);
            if (!user)
                return ;
        }
        catch {
            this.logger.error(`Socket ${client.id} failed to connect to the gataway`)
            return client.disconnect()
        }
        this.logger.log(`User ${user.username} is connected`)
    }

    handleDisconnect(client: Socket) {
        this.Q.forEach((element, index) => {
            if (element.id.id === client.id) this.Q.splice(index, 1);
        });
        this.oldRoot.forEach((element, index) => {
            if (element === client.id) this.oldRoot.splice(index, 1);
        });
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    
    async afterInit(server: Server) {
        this.logger.log('Init');
        this.matching();
    }

    @SubscribeMessage('matching')
    async handleMatchMessage(client: Socket) {
        var lock: boolean = false;
        this.Q.forEach((element, index) => {
            if (element.id.id === client.id) {
                lock = true;
                return;
            }
        });
        if (lock === false)
        {
            var user = await this.userService.FindUserBySocket(client);

            this.Q.push({elo: user.elo, name: user.username, id: client});//a mettre avec base de donner
            this.list.push({elo: user.elo, name: user.username, id: client});
        }
    }

    @SubscribeMessage('unmatching')
    handleUnMatchMessage(client: Socket): void {
        this.Q.forEach((element, index) => {
            if (element.id.id === client.id) this.Q.splice(index, 1);
        });
        this.list.forEach((element, index) => {
            if (element.id.id === client.id) this.list.splice(index, 1);
        });
    }

    @SubscribeMessage("startGame")
    async startGame(phaserServer: Socket, payload: any[])
    {
        if (typeof payload === 'undefined' || payload[0] === 'undefined' || payload[1] === 'undefined' || payload[2] === 'undefined') 
        {return;}

        let user1 = await this.userService.FindUserByUsername(payload[0]);
        let user2 = await this.userService.FindUserByUsername(payload[1]);
        let flag = payload[2];

        if (!user1 || !user2) return;
        
        let socket1 = global.socketUserList.find(elem => elem.user.id === user1.id).socket;
        let socket2 = global.socketUserList.find(elem => elem.user.id === user2.id).socket;
        
        let test1 : SocketUser = {socket: socket1, user: user1};
        let test2 : SocketUser = {socket: socket2, user: user2};
        let g = new Game(test1, test2, phaserServer, this.server, flag);

        this.games.push(g);
    }

    @SubscribeMessage("phaser")
    async diffuseMessagePhaser(client: Socket, payload: any[]) {
        if (typeof payload === 'undefined' || payload[0] === 'undefined' || payload[1] === 'undefined' || payload[2] === 'undefined') 
        {return;}

        let g = this.games.find(game => game.phaserServer.id === client.id);
        g.sendMessage(payload);
    }

    @SubscribeMessage("players")
    async diffuseMessagePlayers(client: Socket, payload: any[]) {
        if (typeof payload === 'undefined' || payload[0] === 'undefined')
        {return;}

        let g = this.games.find(game => game.users[0].socket.id === client.id || game.users[1].socket.id === client.id);

        if (g.users[0].socket.id == client.id)
            g.sendMessage(['left', payload]);
        else if (g.users[1].socket.id == client.id)
            g.sendMessage(['right', payload]);
    }

    @SubscribeMessage("spec")
    async spec(client: Socket, payload: any) {
        // Payload == nom de la personne à spec
        let spec = global.socketUserList.find(elem => elem.socket.id === client.id);
        let g = this.games.find(game => game.users[0].user.username === payload || game.users[1].user.username === payload);
        if (!g)
            return ;
        g.addToSpec(spec);
    }
    
    @SubscribeMessage("unspec")
    async unspec(client: Socket) {
        let g = this.games.find(game => game.spectators.find(spe => spe.socket.id === client.id) != undefined);
        g.leaveSpec(client);
    }

    @SubscribeMessage("duel")
    async StartDuel(client: Socket, payload: any) {
        // rajouter la requête (accept / refuse)
        if (typeof payload === 'undefined')
            return ;
        let user = await this.userService.FindUserBySocket(client);
        lunchServerPhaser(user.username, payload, 1);
    }

    @SubscribeMessage("ROOT")
    async RootMessage(client: Socket, payload: any[]) {
        if (typeof payload === 'undefined' || payload[0] === 'undefined' || payload[1] === 'undefined' || payload[2] === 'undefined' || payload[3] === 'undefined')
        {return;}

        let lock: boolean;
        this.oldRoot.forEach((element, index) => {
            if (element === client.id) {
                lock = true;
                return;
            }
        });
        if (lock === true)
            {return;}

        this.oldRoot.push(client.id);
        let scoreLeft = payload[0];
        let scoreRight = payload[1];
        let playerLeft = payload[2];
        let playerRight = payload[3];

        this.logger.log(scoreLeft, scoreRight);
 
        if (scoreLeft === "13"){
            var userW = await this.userService.FindUserByUsername(playerLeft);
            var userL = await this.userService.FindUserByUsername(playerRight);
        }
        else{
            var userL = await this.userService.FindUserByUsername(playerLeft);
            var userW = await this.userService.FindUserByUsername(playerRight);
        }

        var tmp = this.eloChange(userW.elo, userL.elo);
        
        userW.elo += tmp;
        userL.elo = (userL.elo - tmp < 0)? 0 : userL.elo - tmp;
        
        let g = this.games.find(game => game.phaserServer.id === client.id);

        g.endGame();

    }
    
    private async matching() {
        var save: Array<user> = [];
        var matchingQ: Array<range> = [];

        var i: number = 0;
        var j: number = 0;
        while (1) {
            if (this.Q.length >= 2) {
                save = [...this.Q];
                save.sort((a, b) => a.elo - b.elo);
                for (i = 0; i < save.length; i++)
                {
                    matchingQ[i] = {min:0, max:0, name:""}
                    for (j = 0; matchingQ.length && j < matchingQ.length; j++)
                    {
                        if (save[i].name === matchingQ[j].name)
                            break;
                    }
                    if (matchingQ.length === 0 || j === matchingQ.length)
                    {
                        var tmp: range = {min: 0, max: 0, name: ""};
                        tmp.min = save[i].elo - 20;
                        tmp.max = save[i].elo + 20;
                        tmp.name = save[i].name;
                        matchingQ[i] = tmp;
                    }
                }
                for(i = 0; matchingQ.length && i < matchingQ.length; i++)
                {
                    for (j = 0; j < save.length; j++)
                    {
                        if (save[j].name === matchingQ[i].name)
                            break;
                    }
                    if (j === save.length)
                    {
                        matchingQ.splice(i, 1);
                        i--;
                    }
                }
                console.log(matchingQ);
    
                i = 0;
                j = 0;
    
                while (i < matchingQ.length - 1) {
                    j = i + 1;
                    while (j < matchingQ.length) {
                        if (matchingQ[i].max > matchingQ[j].min)
                        {

                            console.log("matching", save[i].name, save[j].name);
                            lunchServerPhaser(save[i].name, save[j].name, 0);


    
                            this.Q.splice(this.Q.indexOf(save[i]), 1);
                            this.Q.splice(this.Q.indexOf(save[j]), 1);
    
                            save.splice(i, 1);
                            save.splice(j - 1, 1);
    
                            matchingQ.splice(i, 1);
                            matchingQ.splice(j - 1, 1);
    
                            j--;
                        }
                        j++;
                    }
                    i++;
                }
            }
    
            for (i = 0; i < matchingQ.length; i++)
            {
                matchingQ[i].min--;
                matchingQ[i].max++;
            }
            await this.delay(1000);
        }
    }
    
    private delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
    
    private eloChange(eloWiner: number, eloLoser: number): number
    {
        var diff: number;
        var modifier: number;
        var bonus: number;
        var final: number;
    
        if (Math.abs(eloWiner - eloLoser) - 20 <= 0)
            diff = 1;
        else
            diff = Math.abs(eloWiner - eloLoser) - 20;
    
        modifier = (eloWiner > eloLoser) ? -1: 1;
    
        bonus = (modifier * Math.log(diff));
        final = 10 + bonus;
    
        return (Math.round(final));
    }

}