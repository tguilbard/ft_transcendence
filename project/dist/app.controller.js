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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const axios_1 = require("@nestjs/axios");
const jwt_1 = require("@nestjs/jwt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const operators_1 = require("rxjs/operators");
const users_service_1 = require("./users/users.service");
const consumers_1 = require("stream/consumers");
let AppController = class AppController {
    constructor(httpService, jwt, usersService) {
        this.httpService = httpService;
        this.jwt = jwt;
        this.usersService = usersService;
    }
    async salut(request) {
        const { cookies, headers } = request;
        await console.log('JE SUIS DANS SALUT');
        return await { 'message': 'Hello World!',
            'cookie': cookies['access_token'],
            'token': headers['x-xsrf-token']
        };
    }
    async register(body, response) {
        console.log('je suis dans register');
        console.log(body);
        response.redirect('http://localhost:8080');
    }
    async isRegister(request, response) {
        console.log('user dans isregister', response.get('User'));
        response.redirect('http://localhost:8080/register');
    }
    async login(res, request) {
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
        console.log("je suis dans login 2");
        try {
            result = await (0, rxjs_1.lastValueFrom)(this.httpService.post(url, postData).pipe((0, operators_1.map)(resp => resp.data)));
            console.log('access_token in login = ', result.access_token);
        }
        catch (e) {
            console.log("problem avec le post");
        }
        try {
            console.log('access_token in login = ', result.access_token);
            console.log("je suis dans login 3");
            const url = 'https://api.intra.42.fr/v2/me';
            const postData = {
                'Authorization': 'Bearer ' + result.access_token
            };
            var info = await (0, rxjs_1.lastValueFrom)(this.httpService.get(url, { headers: postData }).pipe((0, operators_1.map)(resp => resp.data)));
            var username = info.login;
            console.log('username = ', username);
            console.log('photo = ', info.image_url);
            const hes = {
                'responseType': "file"
            };
            var photo = await (0, rxjs_1.lastValueFrom)(this.httpService.get(info.image_url, { headers: hes }).pipe((0, operators_1.map)(resp => resp.data)));
            console.log(typeof consumers_1.blob);
            const buffer = Buffer.from(photo);
            await this.usersService.addAvatar(buffer, 'intra_photo');
            if (!username) {
                return res.status(401).json({ message: 'missing_required_parameter', info: 'username' });
            }
            const xsrfToken = await crypto.randomBytes(64).toString('hex');
            const accessToken = await jwt.sign({ firstName: username, xsrfToken }, 'secret', {
                algorithm: "HS256"
            });
            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: true
            });
            res.json({
                xsrfToken
            });
        }
        catch (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};
__decorate([
    (0, common_1.Get)('salut'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "salut", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('register'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "isRegister", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_2.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [axios_1.HttpService, jwt_1.JwtService,
        users_service_1.UsersService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map