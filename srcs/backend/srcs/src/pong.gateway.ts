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
import { Index } from 'typeorm';
import { GameHistoryService } from './game-history/game-history.service';
const DataURIParser = require('datauri/parser');

const datauri = new DataURIParser();

var gameId: number = 0

class Game {
    id: number;
    users: SocketUser[] = [];
    phaserServer: Socket;
    spectators: SocketUser[] = [];
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

    reconnect(user: Socket, id: number) {
        if (this.users[0].user.id === id) {
            this.users[0].socket = user;
            user.join(this.socketRoomName);
        }
        else {
            this.users[1].socket = user;
            user.join(this.socketRoomName);
        }
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
        // Ajouter émit ? 
        user.socket.to(this.phaserServer.id).emit("initScore");
        this.server.to(user.socket.id).emit("START", this.privateFlag);
        this.server.to(user.socket.id).emit("openText", 0);
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

    constructor(private readonly userService: UsersService, private readonly gameHistoryService : GameHistoryService )
    {}

    init1: user[] = [];
    init2: user[] = [];
    Q: user[][] = [this.init1, this.init2];
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
        if (user.state == "in match") {
            let g = this.games.find(g => g.users[0].user.id === user.id || g.users[1].user.id === user.id);
            if (g)
                g.reconnect(client, user.id);
        }
        this.logger.log(`User ${user.username} is connected`)
    }

    async handleDisconnect(client: Socket) {
        const index = this.games.findIndex(e => e.phaserServer.id == client.id);
        if (index >= 0)
            this.games.splice(index, 1);
        let user = await this.userService.FindUserBySocket(client);
        if (!user) return ;
        if (user.state == "login")
            await this.userService.UpdateState(user, "logout");
        this.Q[0].forEach((element, index) => {
            if (element.id.id === client.id) this.Q.splice(index, 1);
        });
        this.Q[1].forEach((element, index) => {
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
    async handleMatchMessage(client: Socket, payload: number) {
        if (typeof payload === undefined)
            return;
        var lock: boolean = false;
        if (this.Q[payload].find(element => element.id.id === client.id) === undefined)
        {
            var user = await this.userService.FindUserBySocket(client);

            if (this.Q[payload].find(e => e.name === user.username))
                return ;
            this.Q[payload].push({elo: user.elo, name: user.username, id: client});
        }
    }

    @SubscribeMessage('unmatching')
    handleUnMatchMessage(client: Socket, payload: number): void {
        if (typeof payload === undefined)
            return;
        if (this.Q[payload].length === 1)
        {
            this.Q[payload] = [];
        }
        else
        {
            this.Q[payload].forEach((element, index) => {
                if (element.id.id === client.id) this.Q.splice(index, 1);
            });
        }
    }
    
    @SubscribeMessage("invite_game")
    async invite_game(client: Socket, payload: string){
        if (!payload || !payload)
            return;
        const user = await this.userService.FindUserBySocket(client);
        if (!user)
        return;
        const user_target = await this.userService.FindUserByUsername(payload);
        const socket = this.findSocketInUserSocketObject(user_target.id);
        if (!socket)
        return;
        this.server.to(socket.id).emit("rcv_inv_game", user.username);
    }

    @SubscribeMessage("duel")
    async duel(client: Socket, payload: any[]){
        if (!payload || !payload[1])
        return;
        const user1 = await this.userService.FindUserBySocket(client);
        if (!user1)
            return;
        if (payload[0])
            lunchServerPhaser(user1.username, payload[1], -1);
    }


    @SubscribeMessage("startGame")
    async startGame(phaserServer: Socket, payload: any[])
    {
        if (typeof payload === 'undefined' || payload[0] === 'undefined' || payload[1] === 'undefined' || payload[2] === 'undefined') 
        {return;}

        let user1 = await this.userService.FindUserByUsername(payload[0]);
        let user2 = await this.userService.FindUserByUsername(payload[1]);
        await this.userService.UpdateState(user1, 'in match');
        await this.userService.UpdateState(user2, 'in match');
        let flag = payload[2];

        if (!user1 || !user2) return;
        
        let socket1 = global.socketUserList.find(elem => elem.user.id === user1.id).socket;
        let socket2 = global.socketUserList.find(elem => elem.user.id === user2.id).socket;
        
        let test1 : SocketUser = {socket: socket1, user: user1};
        let test2 : SocketUser = {socket: socket2, user: user2};
        let g = new Game(test1, test2, phaserServer, this.server, flag);
        this.games.push(g);
        g.sendMessage(['start_game', payload[0], payload[1]]);

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

        let g = this.games.find(game => game.phaserServer.id === client.id);

        this.oldRoot.push(client.id);
        let scoreLeft = payload[0];
        let scoreRight = payload[1];
        let playerLeft = payload[2];
        let playerRight = payload[3];

        this.logger.log(scoreLeft, scoreRight);
        let history;
 
        if (scoreLeft === "11"){
            var userW = await this.userService.FindUserByUsername(playerLeft);
            var userL = await this.userService.FindUserByUsername(playerRight);
            history = {scoreUser1: scoreLeft , scoreUser2: scoreRight, usersId: [userW.id, userL.id]};
        }
        else{
            var userL = await this.userService.FindUserByUsername(playerLeft);
            var userW = await this.userService.FindUserByUsername(playerRight);
            history = {scoreUser1: scoreLeft , scoreUser2: scoreRight, usersId: [userL.id, userW.id]};
        }

        this.gameHistoryService.AddMatchInHistory(history);

        await this.userService.UpdateState(g.users[0].user, "login");
        if (!this.server.sockets.adapter.rooms.get(g.users[0].socket.id))
            await this.userService.UpdateState(g.users[0].user, "logout");

        await this.userService.UpdateState(g.users[1].user, "login");
        if (!this.server.sockets.adapter.rooms.get(g.users[1].socket.id))
            await this.userService.UpdateState(g.users[1].user, "logout");
        
        if (g.privateFlag !== -1)
        {
            var tmp = this.eloChange(userW.elo, userL.elo);
        
            userW.elo += tmp;
            userL.elo = (userL.elo - tmp < 0)? 0 : userL.elo - tmp;
        }

        g.endGame();
    }
    
    private async matching() {
        var save: user[][] = [];
        var matchingQinit1: range[] = [];
        var matchingQinit2: range[] = [];
        var matchingQ: range[][] = [matchingQinit1, matchingQinit2];

        var i: number = 0;
        var j: number = 0;
        var type: number = 0;
        while (1) {
            if (this.Q[type].length >= 2) {
                save[type] = [...this.Q[type]];
                save[type].sort((a, b) => a.elo - b.elo);
                for (i = 0; i < save[type].length; i++)
                {
                    matchingQ[type][i] = {min:0, max:0, name:""}
                    for (j = 0; matchingQ[type].length && j < matchingQ[type].length; j++)
                    {
                        if (save[type][i].name === matchingQ[type][j].name)
                            break;
                    }
                    if (matchingQ[type].length === 0 || j === matchingQ[type].length)
                    {
                        var tmp: range = {min: 0, max: 0, name: ""};
                        tmp.min = save[type][i].elo - 20;
                        tmp.max = save[type][i].elo + 20;
                        tmp.name = save[type][i].name;
                        matchingQ[type][i] = tmp;
                    }
                }
                for(i = 0; matchingQ[type].length && i < matchingQ[type].length; i++)
                {
                    for (j = 0; j < save[type].length; j++)
                    {
                        if (save[type][j].name === matchingQ[type][i].name)
                            break;
                    }
                    if (j === save[type].length)
                    {
                        matchingQ[type].splice(i, 1);
                        i--;
                    }
                }
                console.log(matchingQ[type]);
    
                i = 0;
                j = 0;
    
                while (i < matchingQ[type].length - 1) {
                    j = i + 1;
                    while (j < matchingQ[type].length) {
                        if (matchingQ[type][i].max > matchingQ[type][j].min)
                        {
                            console.log("matching", save[type][i].name, save[type][j].name);
                            lunchServerPhaser(save[type][i].name, save[type][j].name, type);
    
                            this.Q[type].splice(this.Q[type].indexOf(save[type][i]), 1);
                            this.Q[type].splice(this.Q[type].indexOf(save[type][j]), 1);
    
                            save[type].splice(i, 1);
                            save[type].splice(j - 1, 1);
    
                            matchingQ[type].splice(i, 1);
                            matchingQ[type].splice(j - 1, 1);
    
                            j--;
                        }
                        j++;
                    }
                    i++;
                }
            }
    
            for (i = 0; i < matchingQ[type].length; i++)
            {
                matchingQ[type][i].min--;
                matchingQ[type][i].max++;
            }
            await this.delay(1000);
            type++;
            type = (type === 2)? 0 : type;
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

    private findSocketInUserSocketObject(id: number) {
		const sockUser = global.socketUserList.find(elem => elem.user.id === id);
		if (sockUser && sockUser.socket)
			return sockUser.socket;
		return null;
	}
}