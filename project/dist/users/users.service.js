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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_entity_1 = require("./entitys/users.entity");
const databaseFiles_service_1 = require("../Photo/databaseFiles.service");
const axios_1 = require("@nestjs/axios");
const jwt_1 = require("@nestjs/jwt");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
let UsersService = class UsersService {
    constructor(usersRepository, databaseFilesService, httpService, jwt) {
        this.usersRepository = usersRepository;
        this.databaseFilesService = databaseFilesService;
        this.httpService = httpService;
        this.jwt = jwt;
    }
    async addAvatar(imageBuffer, filename) {
        console.log(imageBuffer);
        const avatar = await this.databaseFilesService.uploadDatabaseFile(imageBuffer, filename);
        console.log('ID = ', avatar.id);
        await this.usersRepository.update(5, {
            avatarId: avatar.id
        });
        return avatar;
    }
    async register(body, response) {
        console.log('je suis dans register');
        console.log(body);
        response.redirect('http://localhost:8080/login');
    }
    async isLogin(response) {
        console.log('je suis dans islogin 2');
        if (response.State && response.User)
            return response.send({ log: true });
        return response.send({ log: false });
    }
    async getAvatar() {
        const avatar = await this.databaseFilesService.getFileById(90);
        return avatar;
    }
    async isRegister(username) {
        console.log('je suis dans isRegister');
        return true;
    }
    async login(response, request) {
        if (!response.State) {
            console.log("je suis dans login");
            const code = request.body['code'];
            const url = 'https://api.intra.42.fr/oauth/token';
            const postData = {
                grant_type: 'authorization_code',
                client_id: '61094fffbf3140a13c461779c220cbc96dfbad643921a60e345ff8a99928a7a2',
                client_secret: 'ca81f062eb8d1c29f73449afed67fd1b2e462cdf0899e89953d740086fa4186d',
                redirect_uri: 'http://localhost:8080/ok',
                code: code
            };
            var result;
            try {
                result = await (0, rxjs_1.lastValueFrom)(this.httpService.post(url, postData).pipe((0, operators_1.map)(resp => resp.data)));
                console.log('access_token de 42 in login = ', result.access_token);
            }
            catch (e) {
                console.log("problem avec le token de 42");
            }
            try {
                const url = 'https://api.intra.42.fr/v2/me';
                const postData = {
                    'Authorization': 'Bearer ' + result.access_token
                };
                var info = await (0, rxjs_1.lastValueFrom)(this.httpService.get(url, { headers: postData }).pipe((0, operators_1.map)(resp => resp.data)));
                var username = info.login;
                if (!username) {
                    return response.status(401).json({ message: 'missing_required_parameter', info: 'username' });
                }
                const xsrfToken = await crypto.randomBytes(64).toString('hex');
                var state = false;
                if (await this.isRegister(username))
                    state = true;
                console.log('state = ', state);
                console.log('login = ', username);
                const accessToken = await jwt.sign({ login: username, 'id': request.sessionID, state: state }, 'secret', {
                    algorithm: "HS256"
                });
                response.cookie('access_token', accessToken, {
                    httpOnly: true,
                    secure: true
                });
                console.log('cookie was set');
                response.json({
                    'src': info.image_url,
                    'username': username,
                    'state': state,
                });
            }
            catch (err) {
                return response.status(500).json({ message: 'Internal server error' });
            }
        }
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.UsersEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        databaseFiles_service_1.default,
        axios_1.HttpService, jwt_1.JwtService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map