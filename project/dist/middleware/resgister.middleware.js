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
        if (req.path != '/' && req.path != '/login') {
            try {
                const { cookies, headers } = req;
                console.log("cookies middleware = ", req.cookies);
                if (!cookies || !cookies.access_token) {
                    console.log('problem de cookies');
                    return res.status(401).json({ message: 'Missing token in cookie' });
                }
                console.log('cookie = ', cookies.access_token);
                const accessToken = cookies.access_token;
                const decodedToken = jwt.verify(accessToken, 'secret', {
                    algorithms: ['HS256']
                })['xsrfToken'];
                console.log('decode token = ', decodedToken);
                if (!decodedToken)
                    return res.status(401).json({ message: 'Problem de token' });
                const username = jwt.verify(accessToken, 'secret', {
                    algorithms: ['HS256']
                })['firstName'];
                console.log('user middleware = ', username);
                res.set('User', username);
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