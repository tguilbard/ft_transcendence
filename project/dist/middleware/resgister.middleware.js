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
exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt = require("jsonwebtoken");
let AuthMiddleware = class AuthMiddleware {
    constructor(userService) {
        this.userService = userService;
    }
    use(req, res, next) {
        console.log('path = ', req.path);
        const path = req.path;
        if (path != '/user/isRegister' && path != '/user/login') {
            try {
                const { cookies, headers } = req;
                if (!cookies || !cookies.access_token && path != '/user/isLogin') {
                    console.log('problem de cookies');
                    return res.status(401).json({ message: 'Missing token in cookie' });
                }
                if (cookies && cookies.access_token) {
                    console.log('je suis dans is cookies de middleware');
                    const accessToken = cookies.access_token;
                    const decodedToken = jwt.verify(accessToken, 'secret', {
                        algorithms: ['HS256']
                    });
                    const session = decodedToken['id'];
                    console.log('session = ', session);
                    console.log('sessionToken = ', req.sessionID);
                    if (session != req.sessionID && path != '/user/isRegister' && path != '/user/isLogin')
                        return res.status(401).json({ message: 'Problem de session' });
                    const username = decodedToken['login'];
                    console.log('user middleware = ', username);
                    const state = decodedToken['state'];
                    if (!username || (!state && path != '/user/upload' && path != '/user/register' && path != '/user/isRegister' && path != '/user/isLogin'))
                        return res.status(401).json({ message: 'Vous devez vous loger pour acceder a ce contenu' });
                    res.set('User', username);
                    res.set('State', state);
                }
                return next();
            }
            catch (err) {
                return res.status(500).json({ message: 'Internal error' });
            }
        }
        console.log('middleware passed');
        next();
    }
};
AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthMiddleware);
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=resgister.middleware.js.map