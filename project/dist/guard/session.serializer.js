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
exports.SessionSerializer = void 0;
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
let SessionSerializer = class SessionSerializer extends passport_1.PassportSerializer {
    constructor() {
        super();
    }
    serializeUser(user, done) {
        console.log("je suis dans serializer");
        done(null, user);
    }
    async deserializeUser(user, done) {
        console.log("je suis dans deserializer");
        if (user)
            return done(null, { user });
        else
            return done(null, null);
    }
};
SessionSerializer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SessionSerializer);
exports.SessionSerializer = SessionSerializer;
//# sourceMappingURL=session.serializer.js.map