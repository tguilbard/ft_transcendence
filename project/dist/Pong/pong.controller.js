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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PongController = void 0;
const common_1 = require("@nestjs/common");
const pong_service_1 = require("./pong.service");
let PongController = class PongController {
    constructor(PongService) {
        this.PongService = PongService;
    }
    getPong() {
        return this.PongService.getFile("src/Pong/Pong.js");
    }
    getPrivatePong() {
        return this.PongService.getFile("src/Pong/PrivatePong.js");
    }
    getAsset(path) {
        return this.PongService.getFile("src/Pong/assets/" + path);
    }
    getHello() {
        return this.PongService.getPage();
    }
};
__decorate([
    (0, common_1.Get)('Pong.js'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", common_1.StreamableFile)
], PongController.prototype, "getPong", null);
__decorate([
    (0, common_1.Get)('PrivatePong.js'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", common_1.StreamableFile)
], PongController.prototype, "getPrivatePong", null);
__decorate([
    (0, common_1.Get)(':png'),
    __param(0, (0, common_1.Param)('png')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", common_1.StreamableFile)
], PongController.prototype, "getAsset", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], PongController.prototype, "getHello", null);
PongController = __decorate([
    (0, common_1.Controller)('Pong'),
    __metadata("design:paramtypes", [pong_service_1.PongService])
], PongController);
exports.PongController = PongController;
//# sourceMappingURL=pong.controller.js.map