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
exports.PongService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const fs = require("fs");
let PongService = class PongService {
    constructor() {
        fs.readFile((0, path_1.join)(process.cwd(), "src/Pong/Pong.html"), (err, data) => {
            if (err)
                throw err;
            this.page = data.toString();
        });
    }
    getFile(path) {
        const file = (0, fs_1.createReadStream)((0, path_1.join)(process.cwd(), path));
        return new common_1.StreamableFile(file);
    }
    getPage() {
        fs.readFile((0, path_1.join)(process.cwd(), "src/Pong/Pong.html"), (err, data) => {
            if (err)
                throw err;
            this.page = data.toString();
        });
        return this.page;
    }
};
PongService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PongService);
exports.PongService = PongService;
//# sourceMappingURL=pong.service.js.map