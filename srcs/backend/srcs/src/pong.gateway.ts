import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JSDOM } from 'jsdom';
import { join } from 'path';
import { UsersService } from './users/users.service';
import { SocketUser } from './app.gateway';
import { GameHistoryService } from './game-history/game-history.service';
import { ChatService } from './chat/chat.service';
import { UserEntity } from './users/entities/users.entity';
const DataURIParser = require('datauri/parser');

const datauri = new DataURIParser();

var gameId: number = 0

class Game {
    id: number;
    users: SocketUser[] = [];
    phaserServer: Socket;
    spectators: SocketUser[] = [];
    socketRoomName: string;
    GameFlag: number;
    privateFlag: number;
    server: Server;

    constructor(user1: SocketUser, user2: SocketUser, phaserServer: Socket, server: Server, GameFlag = 0, privateFlag=0) {
        this.id = gameId + 1
        this.users = [user1, user2]
        this.socketRoomName = 'game : ' + this.id.toString();
        this.phaserServer = phaserServer;
        user1.socket.join(this.socketRoomName);
        user2.socket.join(this.socketRoomName);
        this.phaserServer.join(this.socketRoomName);
        this.GameFlag = GameFlag;
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
        user.socket.to(this.phaserServer.id).emit("initScore");
        this.server.to(user.socket.id).emit("START", this.GameFlag);
        this.server.to(user.socket.id).emit("openText", 0);
        this.spectators.push(user);
        user.socket.join(this.socketRoomName);
        this.server.to(user.socket.id).emit("start_game");
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

interface Duel{
    user1: UserEntity;
    user2: UserEntity;
}

interface range{
    min: number;
    max: number;
    name: string;
}

function lunchServerPhaser(left: string, right: string, flag: number, pflag: number) {
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
        dom.window.pflag = pflag;
    })
}

@WebSocketGateway()
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    constructor(private readonly userService: UsersService, private readonly chatService: ChatService, private readonly gameHistoryService : GameHistoryService )
    {}

    init1: user[] = [];
    init2: user[] = [];
    Q: user[][] = [[], []];
    oldRoot: Array<string> = [];
    games: Game[] = [];
    initDuel: Duel[] = [];

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
            if (element.id.id === client.id) this.Q[0].length === 1 ? this.Q[0] = [] : this.Q[0].splice(index, 1);
        });
        this.Q[1].forEach((element, index) => {
            if (element.id.id === client.id) this.Q[1].length === 1 ? this.Q[1] = [] : this.Q[1].splice(index, 1);
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

    @SubscribeMessage('init_score')
    async init_score(client: Socket) {
        let g = this.games.find(game => game.users[0].socket.id === client.id || game.users[1].socket.id === client.id);
        this.server.to(g.phaserServer.id).emit('initScore')
        this.server.to(client.id).emit('START', g.GameFlag);
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
                if (element.id.id === client.id) this.Q[payload].splice(index, 1);
            });
        }
    }
    
    @SubscribeMessage("invite_game")
    async invite_game(client: Socket, payload: any[]){
        if (!payload || !payload[1])
            return;
        const user = await this.userService.FindUserBySocket(client);
        if (!user)
        return;
        const user_target = payload[0];
        const socket = this.findSocketInUserSocketObject(user_target.id);
        if (!socket)
            return;
        this.initDuel.push({user1: user, user2: user_target});
        this.server.to(socket.id).emit("rcv_inv_game", user, payload[1]);
    }

    @SubscribeMessage("cancel_invite_game")
    async cancel__game(client: Socket, payload: UserEntity[]){
        const index = this.initDuel.findIndex(e => e.user1.id == payload[0].id && e.user2.id == payload[1].id )
        if (index > -1)
            this.initDuel.splice(index, 1);
    }

    @SubscribeMessage("duel")
    async duel(client: Socket, payload: any[]){
        if (!payload || !payload[1] || !payload[2] || !payload[3])
        return;
        const gduel = this.initDuel.find(e => e.user1.id == payload[1].id && e.user2.id == payload[2].id)
        let socket = global.socketUserList.find(elem => elem.user.id === payload[1].id).socket;
    
        if (payload[0] && gduel)
        {
            lunchServerPhaser(gduel.user1.username, gduel.user2.username, payload[3], 1);
        }
        else if (!payload[0] && gduel)
            socket.emit('alertMessage', payload[2].username + " cancel your invitation for gaming");
        else if (payload[0] && !gduel)
            client.emit('alertMessage', payload[1].username + " cancel his invitation for gamimg");
        const index = this.initDuel.findIndex(e => e.user1.id == payload[1].id && e.user2.id == payload[2].id )
        if (index > -1)
            this.initDuel.splice(index, 1);
    }

    @SubscribeMessage("startGame")
    async startGame(phaserServer: Socket, payload: any[])
    {
        if (typeof payload === 'undefined' || payload[0] === 'undefined' || payload[1] === 'undefined' || payload[2] === 'undefined' || payload[3] === 'undefined') 
        {return;}

        let user1 = await this.userService.FindUserByUsername(payload[0]);
        let user2 = await this.userService.FindUserByUsername(payload[1]);
        await this.userService.UpdateState(user1, 'in match');
        await this.userService.UpdateState(user2, 'in match');
        let flag = payload[2];
        let pflag = payload[3];

        if (!user1 || !user2) return;
        
        let socket1 = global.socketUserList.find(elem => elem.user.id === user1.id).socket;
        let socket2 = global.socketUserList.find(elem => elem.user.id === user2.id).socket;
        
        let test1 : SocketUser = {socket: socket1, user: user1};
        let test2 : SocketUser = {socket: socket2, user: user2};
        let g = new Game(test1, test2, phaserServer, this.server, flag, pflag);
        this.games.push(g);
        g.sendMessage(['start_game']);
        this.server.emit('refresh_user', 'all');
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

        if (!g)
            return;
        if (g.users[0].socket.id == client.id)
            g.sendMessage(['left', payload]);
        else if (g.users[1].socket.id == client.id)
            g.sendMessage(['right', payload]);
    }

    @SubscribeMessage("spec")
    async spec(client: Socket, payload: any) {
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
        let history: any;
 
        var userW: UserEntity;
        var userL: UserEntity;

        if (scoreLeft === 11){
            userW = await this.userService.FindUserByUsername(playerLeft);
            userL = await this.userService.FindUserByUsername(playerRight);
            history = {scoreUser1: scoreLeft , scoreUser2: scoreRight, usersId: [userW.id, userL.id]};
		}
		else
		{
			userL = await this.userService.FindUserByUsername(playerLeft);
			userW = await this.userService.FindUserByUsername(playerRight);
            history = {scoreUser1: scoreLeft , scoreUser2: scoreRight, usersId: [userL.id, userW.id]};
		}

		let userWUpdate = {
			numberOfGame: userW.numberOfGame + 1,
			elo: userW.elo,
			state: "login"
		}

		let userLUpdate = {
			numberOfGame: userL.numberOfGame + 1,
			elo: userL.elo,
			state: "login"
		}

		if (g.privateFlag === 0)
        {
            var tmp = this.eloChange(userW.elo, userL.elo);
			
			userWUpdate.elo += tmp
            userLUpdate.elo = (userL.elo - tmp < 0) ? 0 : userL.elo - tmp;
        }

        if (!this.server.sockets.adapter.rooms.get(g.users[0].socket.id))
        {
            if (userW.username == g.users[0].user.username)
                userWUpdate.state = "logout";
            else
                userLUpdate.state = "logout";
        }

        if (!this.server.sockets.adapter.rooms.get(g.users[1].socket.id))
        {
            if (userW.username == g.users[1].user.username)
                userWUpdate.state = "logout";
            else
                userLUpdate.state = "logout";
        }
		
		await this.userService.UpdateUser(userW.id, {...userWUpdate});
		await this.userService.UpdateUser(userL.id, {...userLUpdate})
        
		await this.gameHistoryService.AddMatchInHistory(history);

        g.endGame();
    }
    
    private async matching() {
        var save: user[][] = [];
        var matchingQ: range[][] = [[], []];

        var i: number = 0;
        var j: number = 0;
        var type: number = 0;
        while (1) {
            this.chatService.checkModeInMembers(this.server);
            if (this.Q[type].length >= 2) {
                save[type] = [...this.Q[type]];
                save[type].sort((a, b) => a.elo - b.elo);
                for (i = 0; i < save[type].length; i++)
                {
                    j = matchingQ[type].findIndex(e => save[type][i].name === e.name)
                    if (matchingQ[type].length === 0 || j === -1)
                        matchingQ[type].splice(i, 0, {min: save[type][i].elo - 20, max: save[type][i].elo + 20, name: save[type][i].name});
                }
                for(i = 0; matchingQ[type].length && i < matchingQ[type].length; i++)
                {
                    j = save[type].findIndex(e => e.name === matchingQ[type][i].name)
                    if (j === -1)
                        matchingQ[type].splice(i--, 1);
                }
    
                i = 0;
                j = 0;
    
                while (i < matchingQ[type].length - 1) {
                    j = i + 1;
                    while (j < matchingQ[type].length) {
                        if (matchingQ[type][i].max > matchingQ[type][j].min)
                        {
                            lunchServerPhaser(save[type][i].name, save[type][j].name, type, 0);
    
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
            type = (type + 1) % 2
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