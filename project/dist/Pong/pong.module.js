"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PongModule = void 0;
const pong_service_1 = require("./pong.service");
const pong_controller_1 = require("./pong.controller");
const common_1 = require("@nestjs/common");
let PongModule = class PongModule {
};
PongModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [
            pong_controller_1.PongController,
        ],
        providers: [
            pong_service_1.PongService,
        ],
    })
], PongModule);
exports.PongModule = PongModule;
//# sourceMappingURL=pong.module.js.map