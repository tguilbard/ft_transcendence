"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jsdom_1 = require("jsdom");
const path_1 = require("path");
const DataURIParser = require('datauri/parser');
const datauri = new DataURIParser();
function lunchServerPhaser(left, right) {
    jsdom_1.JSDOM.fromFile((0, path_1.join)(process.cwd(), '/src/Pong/Private.html'), {
        url: "http://localhost:3000",
        runScripts: "dangerously",
        resources: "usable",
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
    });
}
let AppGateway = class AppGateway {
    constructor() {
        this.Q = [];
        this.result = [];
        this.comp = 0;
        this.logger = new common_1.Logger('AppGateway');
    }
    handleMessage(client, payload) {
        if (this.Q.indexOf(client.id) == -1) {
            if (this.Q.push(client.id) >= 2) {
                lunchServerPhaser(this.Q[0], this.Q[1]);
                this.Q.splice(0, 2);
            }
        }
    }
    diffuseMessage(client, payload) {
        this.server.emit(payload[0], payload[1], payload[2]);
    }
    RootMessage(client, payload) {
        if (this.result.indexOf(client.id) == -1) {
            this.result.push(client.id);
            this.logger.log(payload);
        }
    }
    afterInit(server) {
        this.logger.log('Init');
    }
    handleDisconnect(client) {
        this.Q.forEach((element, index) => {
            if (element == client.id)
                this.Q.splice(index, 1);
        });
        this.result.forEach((element, index) => {
            if (element == client.id)
                this.result.splice(index, 1);
        });
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleConnection(client, ...args) {
        this.logger.log(`Client connected: ${client.id}`);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('matching'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("msgToserver"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Array]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "diffuseMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("ROOT"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "RootMessage", null);
AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)()
], AppGateway);
exports.AppGateway = AppGateway;
//# sourceMappingURL=app.gateway.js.map