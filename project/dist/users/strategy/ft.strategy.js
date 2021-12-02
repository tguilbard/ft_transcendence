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
exports.FtStrategy = void 0;
const passport_42_1 = require("passport-42");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
let FtStrategy = class FtStrategy extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy) {
    constructor() {
        super({
            clientID: '61094fffbf3140a13c461779c220cbc96dfbad643921a60e345ff8a99928a7a2',
            clientSecret: 'ca81f062eb8d1c29f73449afed67fd1b2e462cdf0899e89953d740086fa4186d',
            callbackURL: 'http://localhost:3000/login'
        });
    }
    async validate(accessToken, refreshToken, profile, response) {
        await console.log("je suis dans le validate de strategy");
        const { username, photos } = profile;
        if (!username) {
            throw new common_1.UnauthorizedException();
        }
        return await {
            'username': username
        };
    }
};
__decorate([
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FtStrategy.prototype, "validate", null);
FtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FtStrategy);
exports.FtStrategy = FtStrategy;
//# sourceMappingURL=ft.strategy.js.map