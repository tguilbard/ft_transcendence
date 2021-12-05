"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const pong_module_1 = require("./Pong/pong.module");
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const app_gateway_1 = require("./app.gateway");
const users_module_1 = require("./users/users.module");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const jwt_1 = require("@nestjs/jwt");
const resgister_middleware_1 = require("./middleware/resgister.middleware");
const users_service_1 = require("./users/users.service");
const databaseFiles_service_1 = require("./Photo/databaseFiles.service");
const users_entity_1 = require("./users/entitys/users.entity");
const users_controller_1 = require("./users/users.controller");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(resgister_middleware_1.AuthMiddleware)
            .forRoutes('');
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            pong_module_1.PongModule,
            users_module_1.UsersModule,
            axios_1.HttpModule,
            jwt_1.JwtModule.register({
                secret: 'secret',
                signOptions: { expiresIn: '60s' },
            }),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: '127.0.0.1',
                port: 5432,
                username: 'jelarose',
                password: 'jelarose',
                database: 'pong',
                entities: ['dist/**/*.entity{.ts,.js}'],
                synchronize: true
            })
        ],
        controllers: [
            app_controller_1.AppController, users_controller_1.UsersController
        ],
        providers: [
            app_gateway_1.AppGateway, app_service_1.AppService, users_service_1.UsersService, databaseFiles_service_1.default, users_entity_1.UsersEntity
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map